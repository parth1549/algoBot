"""
Yahoo Finance Market Data Service
Fetches OHLCV data from Yahoo Finance v8 chart API with caching and retry logic.
"""

import requests
import time
import logging
from datetime import datetime
import urllib.parse

logger = logging.getLogger(__name__)

# --- In-memory TTL Cache ---
_cache: dict = {}
CACHE_TTL = 30  # seconds


def _cache_key(symbol: str, interval: str, range_: str) -> str:
    return f"{symbol}|{interval}|{range_}"


def _get_cached(key: str):
    if key in _cache:
        entry = _cache[key]
        if time.time() - entry["ts"] < CACHE_TTL:
            logger.info(f"Cache HIT for {key}")
            return entry["data"]
        else:
            del _cache[key]
    return None


def _set_cache(key: str, data):
    _cache[key] = {"data": data, "ts": time.time()}


# --- Yahoo Finance Fetcher ---

YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

# Valid intervals and ranges
VALID_INTERVALS = ["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo"]
VALID_RANGES = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"]


def fetch_yahoo_chart(
    symbol: str,
    interval: str = "5m",
    range_: str = "5d",
    max_retries: int = 3,
) -> list[dict]:
    """
    Fetch OHLCV data from Yahoo Finance chart API.

    Args:
        symbol: Stock symbol (e.g. RELIANCE.NS, NIFTY.NS, BTC-USD)
        interval: Candle interval (1m, 5m, 15m, 1d, etc.)
        range_: Data range (1d, 5d, 1mo, 3mo, 1y, etc.)
        max_retries: Number of retry attempts on failure

    Returns:
        List of dicts with keys: date, open, high, low, close, volume
    """

    # Check cache first
    key = _cache_key(symbol, interval, range_)
    cached = _get_cached(key)
    if cached is not None:
        return cached

    url = f"{YAHOO_BASE}/{urllib.parse.quote(symbol, safe='^')}"
    params = {
        "interval": interval,
        "range": range_,
        "includePrePost": "false",
        "events": "div,splits",
    }
    
    last_error = None

    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Yahoo Finance fetch attempt {attempt}/{max_retries} — {symbol} ({interval}/{range_})")
            logger.info(f"URL: {url}")

            response = requests.get(url, params=params, headers=HEADERS, timeout=10)

            # Handle rate limiting
            if response.status_code == 429:
                wait = 2 ** attempt
                logger.warning(f"Rate limited (429). Waiting {wait}s before retry...")
                time.sleep(wait)
                continue

            response.raise_for_status()
            raw = response.json()

            # Parse the Yahoo Finance response structure
            result = raw.get("chart", {}).get("result")
            if not result or len(result) == 0:
                logger.error(f"Empty result from Yahoo Finance for {symbol}")
                return []

            data = result[0]
            timestamps = data.get("timestamp", [])
            quote = data.get("indicators", {}).get("quote", [{}])[0]

            opens = quote.get("open", [])
            highs = quote.get("high", [])
            lows = quote.get("low", [])
            closes = quote.get("close", [])
            volumes = quote.get("volume", [])

            # Build clean records, filtering nulls
            records = []
            for i in range(len(timestamps)):
                o = opens[i] if i < len(opens) else None
                h = highs[i] if i < len(highs) else None
                l = lows[i] if i < len(lows) else None
                c = closes[i] if i < len(closes) else None
                v = volumes[i] if i < len(volumes) else None

                # Skip rows with any null OHLC value
                if any(val is None for val in [o, h, l, c]):
                    continue

                dt = datetime.fromtimestamp(timestamps[i])

                records.append({
                    "date": dt.strftime("%Y-%m-%d %H:%M:%S"),
                    "open": round(o, 2),
                    "high": round(h, 2),
                    "low": round(l, 2),
                    "close": round(c, 2),
                    "volume": int(v) if v is not None else 0,
                })

            logger.info(f"Yahoo Finance: fetched {len(records)} candles for {symbol}")

            # Cache the result
            _set_cache(key, records)

            return records

        except requests.exceptions.Timeout:
            last_error = f"Timeout on attempt {attempt}"
            logger.warning(last_error)
        except requests.exceptions.ConnectionError as e:
            last_error = f"Connection error: {e}"
            logger.warning(last_error)
        except requests.exceptions.HTTPError as e:
            last_error = f"HTTP error: {e}"
            logger.warning(last_error)
        except Exception as e:
            last_error = f"Unexpected error: {e}"
            logger.error(last_error)
            break

        # Exponential backoff between retries
        if attempt < max_retries:
            wait = 2 ** attempt
            logger.info(f"Retrying in {wait}s...")
            time.sleep(wait)

    logger.error(f"All {max_retries} attempts failed for {symbol}: {last_error}")
    return []


def get_latest_candle(symbol: str, interval: str = "5m") -> dict | None:
    """Fetch only the latest candle for real-time polling."""
    data = fetch_yahoo_chart(symbol, interval=interval, range_="1d")
    if data:
        return data[-1]
    return None
