import pandas as pd
import numpy as np
import requests
import time
import threading
from datetime import datetime, timedelta
import logging
import os
from pathlib import Path

from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestClassifier

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
from dotenv import load_dotenv
from pydantic import BaseModel
import google.generativeai as genai

# Setup Logging before anything else
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Console handler
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)

# Formatter with detailed info
formatter = logging.Formatter('[%(asctime)s] %(levelname)-8s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
ch.setFormatter(formatter)

logger.addHandler(ch)

logger.info("="*80)
logger.info("ALGO TRADING PLATFORM - API LOGGING INITIALIZED")
logger.info("="*80)

load_dotenv()

# Free Stock API - No authentication needed
STOCK_API_BASE = "https://military-jobye-haiqstudios-14f59639.koyeb.app"
STOCK_SYMBOL = os.getenv('STOCK_SYMBOL', 'ITC.NS')  # Default to ITC.NS, can be changed in .env

logger.info(f"Configured Stock Symbol (default): {STOCK_SYMBOL}")
logger.info(f"Configured Stock API Base URL: {STOCK_API_BASE}")

def fetch_live_data(symbol=None, days=60):
    """Fetch historical data from Yahoo Finance (preferred) and fallback free stock API."""
    if symbol is None:
        symbol = STOCK_SYMBOL
    
    logger.info(f"STEP 1: Starting data fetch for symbol: {symbol}")

    # Normalize index symbol if caret form was used
    if symbol.startswith('^'):
        logger.info(f"STEP 1b: Keeping caret for index symbol {symbol}")
        actual_symbol = symbol
    else:
        actual_symbol = symbol

    # For index/ticker symbols, try Yahoo Finance first
    if actual_symbol.startswith('^') or actual_symbol.upper() in [v.lstrip('^') for v in INDEX_SYMBOL_MAP.values()] or actual_symbol.endswith('.NS') or actual_symbol.endswith('.BO') or '-' in actual_symbol:
        yahoo_symbol = actual_symbol if actual_symbol.startswith('^') else f"^{actual_symbol}"
        logger.info(f"STEP 2: Fetching from Yahoo Finance for {yahoo_symbol}")
        try:
            yahoo_data = fetch_yahoo_chart(yahoo_symbol, interval='5m', range_='5d')
            if yahoo_data:
                df = pd.DataFrame(yahoo_data)
                df['date'] = pd.to_datetime(df['date'])
                df = df.set_index('date')
                df = df.rename(columns={
                    'open': 'Open', 'high': 'High', 'low': 'Low',
                    'close': 'Close', 'volume': 'Volume'
                })
                df = df[['Open', 'High', 'Low', 'Close', 'Volume']]
                logger.info(f"STEP 3: Yahoo data converted to DataFrame with {len(df)} rows")
                return df
            else:
                logger.warning(f"Yahoo returned no data for {yahoo_symbol}")
        except Exception as e:
            logger.warning(f"Yahoo fetch failed for {yahoo_symbol}: {e}")

    # Fallback: existing free stock API
    try:
        # Build API request
        url = f"{STOCK_API_BASE}/stock"
        params = {
            'symbol': symbol,
            'res': 'num'
        }

        logger.info(f"STEP 2: Preparing API request")
        logger.info(f"  └─ API URL: {url}")
        logger.info(f"  └─ Parameters: symbol={params['symbol']}, res={params['res']}")
        
        # Make API request
        logger.debug(f"STEP 3: Making HTTP GET request to stock API...")
        start_time = time.time()
        
        response = requests.get(url, params=params, timeout=10)
        elapsed_time = time.time() - start_time
        
        logger.info(f"STEP 4: API Response received")
        logger.info(f"  └─ Status Code: {response.status_code}")
        logger.info(f"  └─ Response Time: {elapsed_time:.2f}s")
        
        # Parse response
        logger.debug(f"STEP 5: Parsing JSON response...")
        logger.debug(f"  └─ Response text: {response.text[:200]}")  # Log first 200 chars
        
        # Check if response is empty
        if not response.text:
            logger.error(f"STEP 5: API returned empty response (no data)")
            logger.error(f"Data fetch failed for {symbol}")
            return None
        
        data = response.json()
        
        if data.get('status') == 'success':
            stock_data = data['data']
            logger.info(f"STEP 6: API call successful ✓")
            logger.info(f"  └─ Last Price: ₹{stock_data.get('last_price', 'N/A')}")
            logger.info(f"  └─ Volume: {stock_data.get('volume', 'N/A')}")
            logger.info(f"  └─ Change: {stock_data.get('change', 'N/A')}%")
            
            # Create a DataFrame with the fetched data
            logger.info(f"STEP 7: Generating simulated historical data (100 candles)")
            dates = pd.date_range(end=datetime.now(), periods=100, freq='5min')
            price = stock_data['last_price']
            
            df = pd.DataFrame({
                'Open': np.random.uniform(price * 0.98, price * 1.02, 100),
                'High': np.random.uniform(price * 1.00, price * 1.05, 100),
                'Low': np.random.uniform(price * 0.95, price * 1.00, 100),
                'Close': np.random.uniform(price * 0.98, price * 1.02, 100),
                'Volume': np.random.uniform(stock_data['volume'] * 0.1, stock_data['volume'] * 0.5, 100)
            }, index=dates)
            
            logger.info(f"STEP 8: Created DataFrame with {len(df)} rows")
            logger.info(f"  └─ Date Range: {df.index[0]} to {df.index[-1]}")
            logger.info(f"  └─ Price Range: ₹{df['Close'].min():.2f} to ₹{df['Close'].max():.2f}")
            logger.info(f"Data fetch completed successfully for {symbol}")
            logger.debug("-" * 80)
            
            return df
        else:
            error_msg = data.get('message', 'Unknown error')
            logger.warning(f"STEP 6: API returned error")
            logger.warning(f"  └─ Status: {data.get('status')}")
            logger.warning(f"  └─ Message: {error_msg}")
            logger.error(f"Failed to fetch data for {symbol}: {error_msg}")
            return None
            
    except requests.exceptions.Timeout:
        logger.error(f"STEP 3: API request TIMEOUT (>10s) for {symbol}")
        logger.error(f"Data fetch failed for {symbol}")
        return None
    except requests.exceptions.ConnectionError as e:
        logger.error(f"STEP 3: CONNECTION ERROR while calling stock API: {str(e)}")
        logger.error(f"Data fetch failed for {symbol}")
        return None
    except Exception as e:
        logger.error(f"STEP X: UNEXPECTED ERROR during data fetch: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.exception(f"Full traceback:")
        return None

def add_sma(df):
    df["SMA10"] = df["Close"].rolling(10).mean()
    df["SMA20"] = df["Close"].rolling(20).mean()
    return df

def add_rsi(df):
    delta = df["Close"].diff()
    gain = (delta.where(delta > 0, 0)).rolling(14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
    rs = gain / loss
    df["RSI"] = 100 - (100 / (1 + rs))
    return df

def HMA(series, period):
    half = int(period / 2)
    sqrt_period = int(np.sqrt(period))

    wma1 = series.rolling(half).mean()
    wma2 = series.rolling(period).mean()

    return (2 * wma1 - wma2).rolling(sqrt_period).mean()

def add_hma(df):
    df["HMA50"] = HMA(df["Close"], 50)
    df["HMA200"] = HMA(df["Close"], 200)
    return df

def add_atr(df, period=14):
    df = df.copy()

    high = df["High"]
    low = df["Low"]
    close = df["Close"]

    tr1 = high - low
    tr2 = (high - close.shift()).abs()
    tr3 = (low - close.shift()).abs()

    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)

    df["ATR"] = tr.rolling(period).mean()

    return df

def add_ut_bot(df, multiplier=1):
    df = df.copy()

    # Ensure no duplicate columns
    df = df.loc[:, ~df.columns.duplicated()]

    # Ensure Series format
    close = df["Close"].squeeze()
    high = df["High"].squeeze()
    low = df["Low"].squeeze()

    # ATR
    tr1 = high - low
    tr2 = (high - close.shift()).abs()
    tr3 = (low - close.shift()).abs()

    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    df["ATR"] = tr.rolling(14).mean()

    # Bands
    df["upper"] = close + multiplier * df["ATR"]
    df["lower"] = close - multiplier * df["ATR"]

    trend = [0]

    for i in range(1, len(df)):
        if close.iloc[i] > df["upper"].iloc[i-1]:
            trend.append(1)
        elif close.iloc[i] < df["lower"].iloc[i-1]:
            trend.append(0)
        else:
            trend.append(trend[-1])

    df["UT_trend"] = trend

    return df

def create_target(df):
    df["y"] = (df["Close"].shift(-1) > df["Close"]).astype(int)
    return df.dropna()

def prepare_data(df, features, window=20):
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(df[features])

    X, y = [], []

    for i in range(window, len(scaled)):
        X.append(scaled[i-window:i])
        y.append(df["y"].iloc[i])

    return np.array(X), np.array(y), scaler

def build_model():
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    return model

def generate_signals(df, model, scaler, features, window=20):
    scaled = scaler.transform(df[features])

    signals = []

    for i in range(window, len(scaled)):
        X_input = scaled[i-window:i].reshape(1, -1)
        pred = model.predict_proba(X_input)[0][1]

        ml_signal = 1 if pred > 0.5 else 0
        ut_signal = df["UT_trend"].iloc[i]

        final_signal = 1 if (ml_signal == 1 and ut_signal == 1) else 0
        signals.append(final_signal)

    df = df.iloc[window:].copy()
    df["signal"] = signals

    return df

def backtest(df, capital=100000, stop_loss=None, target=None, trailing_sl=None, square_off="Complete", entry_time="09:15", exit_time="15:15", no_reentry=False, no_reentry_time="14:30"):
    """Enhanced backtest with risk management"""
    balance = float(capital)
    position = 0.0
    equity = []
    entry_price = 0.0
    max_price = 0.0
    
    for i in range(len(df)):
        signal = int(df.iloc[i]["signal"])
        price = float(df.iloc[i]["Close"])
        timestamp = df.index[i] if hasattr(df.index, '__getitem__') else None
        
        # Time-based filters
        if timestamp:
            current_time = timestamp.time()
            entry_time_obj = pd.Timestamp(entry_time).time()
            exit_time_obj = pd.Timestamp(exit_time).time()
            no_reentry_time_obj = pd.Timestamp(no_reentry_time).time()
            
            # Skip if outside trading hours
            if current_time < entry_time_obj or current_time > exit_time_obj:
                # Square off at end of day
                if position > 0:
                    balance = position * price
                    position = 0.0
                current_value = balance
                equity.append(float(current_value))
                continue
        
        # BUY
        if signal == 1 and position == 0:
            if not no_reentry or (timestamp and timestamp.time() <= no_reentry_time_obj):
                position = balance / price
                balance = 0.0
                entry_price = price
                max_price = price
        
        # SELL conditions
        elif position > 0:
            should_sell = False
            
            # Stop Loss (absolute points)
            if stop_loss and price <= entry_price - stop_loss:
                should_sell = True
            
            # Target (absolute points)
            if target and price >= entry_price + target:
                should_sell = True
            
            # Trailing Stop Loss (absolute points from max price)
            if trailing_sl:
                max_price = max(max_price, price)
                if price <= max_price - trailing_sl:
                    should_sell = True
            
            # Signal-based sell
            if signal == 0:
                should_sell = True
            
            if should_sell:
                balance = position * price
                position = 0.0
                entry_price = 0.0
                max_price = 0.0
        
        # Equity calculation
        if position == 0:
            current_value = balance
        else:
            current_value = position * price
        
        equity.append(float(current_value))
    
    df["equity"] = equity
    return df

def metrics(df):
    returns = df["equity"].pct_change().dropna()

    print("Return:", (df["equity"].iloc[-1] / df["equity"].iloc[0] - 1))
    print("Sharpe:", (returns.mean() / returns.std()) * np.sqrt(252))
    print("Drawdown:", (df["equity"] / df["equity"].cummax() - 1).min())

def run_pipeline():
    try:
        df = fetch_live_data(STOCK_SYMBOL)
        
        if df is None or df.empty:
            print("Using sample data for pipeline...")
            dates = pd.date_range(end=datetime.now(), periods=500, freq='5min')
            df = pd.DataFrame({
                'Open': np.random.uniform(300, 400, 500),
                'High': np.random.uniform(305, 405, 500),
                'Low': np.random.uniform(295, 395, 500),
                'Close': np.random.uniform(300, 400, 500),
                'Volume': np.random.uniform(1000000, 5000000, 500)
            }, index=dates)

        df = add_sma(df)
        df = add_rsi(df)
        df = add_hma(df)
        df = add_ut_bot(df)

        df.dropna(inplace=True)
        df = create_target(df)

        features = [
            "Close","SMA10","SMA20",
            "RSI","HMA50","HMA200",
            "ATR","UT_trend"
        ]

        X, y, scaler = prepare_data(df, features)

        model = build_model()
        model.fit(X.reshape(X.shape[0], -1), y)

        df = generate_signals(df, model, scaler, features)
        df = backtest(df)

        return df, model, scaler, features
    except Exception as e:
        print(f"Pipeline error: {e}")
        raise

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For testing, allow all; in production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

global_df = None
model = None
scaler = None
features = None
current_symbol = None

# Available stock symbols
AVAILABLE_SYMBOLS = [
    "ITC.NS", "ITC.BO",
    "RELIANCE.NS", "RELIANCE.BO",
    "TCS.NS", "TCS.BO",
    "INFY.NS", "INFY.BO",
    "HDFCBANK.NS", "HDFCBANK.BO",
    "ICICIBANK.NS", "ICICIBANK.BO",
    "SBIN.NS", "SBIN.BO",
    "BHARTIARTL.NS", "BHARTIARTL.BO",
    "LT.NS", "LT.BO",
    "ASIANPAINT.NS", "ASIANPAINT.BO",
    "^BSESENSEX", "^NSEI", "^NSEBANK"
]

INDEX_SYMBOL_MAP = {
    "SENSEX": "^BSESENSEX",
    "NIFTY": "^NSEI",
    "BANKNIFTY": "^NSEBANK",
    "FINNIFTY": "^NSEFI",
    "MIDCPNIFTY": "^NSMIDCP",
    "^BSESENSEX": "^BSESENSEX",
    "^NSEI": "^NSEI",
    "^NSEBANK": "^NSEBANK"
}

@app.get("/")
def root():
    return {
        "message": "Algo Trading Platform - Indian Stock Market",
        "version": "1.0",
        "status": "running",
        "ui": "Open http://localhost:8000/test-ui",
        "instructions": "Use /analyze endpoint to start trading analysis",
        "example": "/analyze?symbol=ITC.NS"
    }

@app.get("/health")
def health_check():
    """Health check endpoint for UptimeRobot to keep the Render free tier awake"""
    return {"status": "ok", "message": "Server is awake"}

@app.get("/test-ui")
async def test_ui():
    """Serve the test UI"""
    return FileResponse('frontend_test.html', media_type='text/html')

@app.get("/symbols")
def get_symbols():
    return {
        "available_symbols": AVAILABLE_SYMBOLS,
        "total": len(AVAILABLE_SYMBOLS),
        "note": ".NS for NSE, .BO for BSE",
        "usage": "Pass symbol to /analyze endpoint"
    }

@app.post("/analyze")
def analyze_stock(symbol: str = "ITC.NS", risk_management: dict = None):
    """Analyze a stock and run the trading pipeline"""
    global global_df, model, scaler, features, current_symbol
    
    if risk_management is None:
        risk_management = {}
    
    # Normalize index names and symbols
    candidate = symbol.strip().upper()
    if candidate in INDEX_SYMBOL_MAP:
        symbol = INDEX_SYMBOL_MAP[candidate]
    elif candidate.startswith('^') and candidate in INDEX_SYMBOL_MAP.values():
        symbol = candidate
    elif not candidate.startswith('^') and f"^{candidate}" in INDEX_SYMBOL_MAP.values():
        symbol = f"^{candidate}"

    try:
        # Allow if it's a stock symbol or an index symbol
        is_stock = symbol in AVAILABLE_SYMBOLS
        is_index = symbol in INDEX_SYMBOL_MAP.values() or symbol.startswith('^')
        
        if not (is_stock or is_index):
            return {
                "status": "error",
                "message": f"Symbol {symbol} not available",
                "available_symbols": AVAILABLE_SYMBOLS + list(INDEX_SYMBOL_MAP.values())
            }
        
        print(f"\n=== Starting analysis for {symbol} ===")
        current_symbol = symbol
        
        # Fetch data for the symbol
        df = fetch_live_data(symbol)
        
        if df is None or df.empty:
            return {
                "status": "error",
                "message": f"Failed to fetch data for {symbol}",
                "symbol": symbol
            }
        
        # Run pipeline
        df = add_sma(df)
        df = add_rsi(df)
        df = add_hma(df)
        df = add_ut_bot(df)
        
        df.dropna(inplace=True)
        df = create_target(df)
        
        features = [
            "Close", "SMA10", "SMA20",
            "RSI", "HMA50", "HMA200",
            "ATR", "UT_trend"
        ]
        
        X, y, scaler = prepare_data(df, features)
        
        model = build_model()
        model.fit(X.reshape(X.shape[0], -1), y)
        
        df = generate_signals(df, model, scaler, features)
        
        # Extract risk management parameters
        stop_loss = risk_management.get('stopLoss')
        target = risk_management.get('target')
        trailing_sl = risk_management.get('trailingSl')
        square_off = risk_management.get('squareOff', 'Complete')
        entry_time = risk_management.get('entryTime', '09:15')
        exit_time = risk_management.get('exitTime', '15:15')
        no_reentry = risk_management.get('noReentry', False)
        no_reentry_time = risk_management.get('noReentryTime', '14:30')
        
        df = backtest(df, stop_loss=stop_loss, target=target, trailing_sl=trailing_sl, 
                     square_off=square_off, entry_time=entry_time, exit_time=exit_time,
                     no_reentry=no_reentry, no_reentry_time=no_reentry_time)
        
        global_df = df
        
        # Get latest signal
        latest = df.iloc[-1]
        
        return {
            "status": "success",
            "symbol": symbol,
            "message": f"Analysis completed for {symbol}",
            "results": {
                "current_price": float(latest["Close"]),
                "signal": "BUY" if latest["signal"] == 1 else "SELL",
                "equity": float(latest["equity"]),
                "total_return": f"{((latest['equity'] / 100000 - 1) * 100):.2f}%",
                "rows_analyzed": len(df),
                "features": features
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "symbol": symbol
        }

@app.post("/run_backtest")
def run_backtest(payload: dict):
    """Run backtest using index symbol mapping."""
    index = payload.get('index', 'NIFTY')
    instrument = payload.get('instrument', 'Futures')
    strategyType = payload.get('strategyType', 'Intraday')
    entryTime = payload.get('entryTime', '09:15')
    exitTime = payload.get('exitTime', '15:15')
    reentry = payload.get('reentry', {})
    noReentry = reentry.get('enabled', True) == False
    noReentryTime = reentry.get('after', '14:30')
    overallMomentum = payload.get('momentum', True)
    riskManagement = payload.get('riskManagement', {})
    metricType = riskManagement.get('type', 'Points')
    squareOff = riskManagement.get('squareOff', 'Complete')
    stopLoss = riskManagement.get('stopLoss', 50.0)
    target = riskManagement.get('target', 100.0)
    trailingSl = riskManagement.get('trailingSl', 20.0)
    
    # Prepare risk management dict for analyze_stock
    risk_mgmt = {
        'stopLoss': stopLoss,
        'target': target,
        'trailingSl': trailingSl,
        'squareOff': squareOff,
        'entryTime': entryTime,
        'exitTime': exitTime,
        'noReentry': noReentry,
        'noReentryTime': noReentryTime,
    }
    
    symbol_key = index.strip().upper()
    symbol = INDEX_SYMBOL_MAP.get(symbol_key, symbol_key)

    # Run analysis with resolved symbol and risk management
    result = analyze_stock(symbol=symbol, risk_management=risk_mgmt)

    # Return enriched response to include index/instrument config
    if isinstance(result, dict) and result.get('status') == 'success':
        result['index'] = index
        result['instrument'] = instrument
        result['strategy'] = strategyType
        result['risk_management'] = risk_mgmt
    return result

@app.get("/status")
def get_status():
    """Get current analysis status"""
    global global_df, current_symbol
    
    if global_df is None or global_df.empty:
        return {
            "status": "no_analysis",
            "message": "No analysis performed yet. Use /analyze endpoint.",
            "instructions": "POST /analyze?symbol=ITC.NS"
        }
    
    latest = global_df.iloc[-1]
    return {
        "status": "analyzed",
        "symbol": current_symbol,
        "current_price": float(latest["Close"]),
        "signal": "BUY" if latest["signal"] == 1 else "SELL",
        "equity": float(latest["equity"]),
        "total_rows": len(global_df),
        "last_updated": str(global_df.index[-1])
    }

@app.get("/data")
def get_data():
    if global_df is None or global_df.empty:
        return []
    return global_df.tail(100).to_dict(orient="records")

@app.get("/signal")
def get_signal():
    if global_df is None or global_df.empty:
        return {
            "status": "error",
            "message": "No analysis performed yet. Use /analyze endpoint."
        }
    return global_df[["Close","signal"]].tail(50).to_dict(orient="records")

@app.get("/equity")
def get_equity():
    if global_df is None or global_df.empty:
        return []
    return global_df["equity"].tail(50).tolist()

@app.get("/live-signal")
def live_signal():
    """Get the latest signal from the current analysis"""
    global global_df, current_symbol
    
    if global_df is None or global_df.empty:
        return {
            "status": "error",
            "message": "No analysis performed yet",
            "instructions": "Use /analyze endpoint first",
            "example": "/analyze?symbol=ITC.NS"
        }
    
    try:
        # Fetch current price from free API
        url = f"{STOCK_API_BASE}/stock"
        params = {
            "symbol": current_symbol,
            "res": "num"
        }
        response = requests.get(url, params=params)
        quote_data = response.json()
        
        latest = global_df.iloc[-1]
        
        if quote_data.get('status') == 'success':
            current_price = quote_data['data']['last_price']
        else:
            current_price = float(latest["Close"])
        
        return {
            "status": "success",
            "price": current_price,
            "signal": "BUY" if latest["signal"] == 1 else "SELL",
            "equity": float(latest["equity"]),
            "symbol": current_symbol
        }
    except Exception as e:
        print(f"Error in live_signal: {e}")
        latest = global_df.iloc[-1]
        return {
            "status": "success",
            "price": float(latest["Close"]),
            "signal": "BUY" if latest["signal"] == 1 else "SELL",
            "equity": float(latest["equity"]),
            "symbol": current_symbol
        }

@app.get("/dashboard")
def dashboard():
    global global_df, current_symbol
    
    if global_df is None or global_df.empty:
        return {
            "status": "error",
            "message": "No analysis performed yet",
            "instructions": "Use /analyze endpoint first",
            "example": "/analyze?symbol=ITC.NS"
        }
    
    latest = global_df.iloc[-1]

    return {
        "status": "success",
        "symbol": current_symbol,
        "price": float(latest["Close"]),
        "signal": "BUY" if latest["signal"] == 1 else "SELL",
        "equity": float(latest["equity"]),
        "total_return": f"{((latest['equity'] / 100000 - 1) * 100):.2f}%",
        "data": global_df.tail(100).to_dict(orient="records")
    }

@app.get("/logs")
def get_logs(limit: int = 50):
    """Retrieve recent API logs"""
    return {
        "status": "no_logs",
        "message": "File-based logs have been disabled. Check the terminal for live logs.",
        "logs": []
    }

# ------------------------------------------------------------------
# AI Trading Agent Endpoints
# ------------------------------------------------------------------
class AIAnalyzeRequest(BaseModel):
    symbol: str
    trade_amount: float
    total_return: str
    final_equity: float
    sharpe: str
    max_drawdown: str
    buy_signals: int
    sell_signals: int

class ExecuteTradeRequest(BaseModel):
    symbol: str
    signal: str
    trade_amount: float

# Configure Gemini
api_key = os.getenv('GEMINI_API_KEY')
if api_key:
    genai.configure(api_key=api_key)

@app.post("/ai-analyze")
def ai_analyze(payload: AIAnalyzeRequest):
    if not api_key:
        return {"status": "error", "message": "Gemini API key not configured in .env"}
    
    prompt = f"""
    You are an expert quantitative trading AI assistant.
    Analyze the following backtest results for the asset {payload.symbol}:
    - Total Return: {payload.total_return}%
    - Final Simulated Equity: ₹{payload.final_equity}
    - Sharpe Ratio: {payload.sharpe}
    - Max Drawdown: {payload.max_drawdown}%
    - BUY Signals fired: {payload.buy_signals}
    - SELL Signals fired: {payload.sell_signals}
    
    The user is considering starting a live simulated paper trade system with a fixed capital amount of ₹{payload.trade_amount}.
    
    Based on these metrics, provide a final trading signal recommendation (must be strictly one of: BUY, SELL, or HOLD), 
    an estimated confidence score (0-100), and a concise strategic suggestion explaining your reasoning in 2-3 sentences.
    
    Reply ONLY in valid JSON format exactly like this:
    {{"signal": "BUY", "confidence": 85, "suggestion": "The Sharpe ratio is excellent indicating strong risk-adjusted returns..."}}
    """
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:-3].strip()
        elif text.startswith('```'):
            text = text[3:-3].strip()
            
        import json
        result = json.loads(text)
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return {"status": "error", "message": f"AI Engine error: {str(e)}"}

@app.post("/execute-trade")
def execute_trade(payload: ExecuteTradeRequest):
    # Mock trade execution
    logger.info(f"AI Trade Executed: {payload.signal} {payload.symbol} for ₹{payload.trade_amount}")
    return {
        "status": "success",
        "message": f"Successfully executed [{payload.signal}] order for {payload.symbol} sizing ₹{payload.trade_amount}",
        "trade_details": {
            "symbol": payload.symbol,
            "signal": payload.signal,
            "amount": payload.trade_amount,
            "timestamp": datetime.now().isoformat()
        }
    }

# ------------------------------------------------------------------
# Yahoo Finance Market Data Endpoints
# ------------------------------------------------------------------
from market_data import fetch_yahoo_chart, get_latest_candle, VALID_INTERVALS, VALID_RANGES

@app.get("/market-data/{symbol}")
def get_market_data(symbol: str, interval: str = "5m", range: str = "5d"):
    """Fetch OHLCV market data from Yahoo Finance"""
    try:
        if interval not in VALID_INTERVALS:
            return {"status": "error", "message": f"Invalid interval '{interval}'. Valid: {VALID_INTERVALS}"}
        if range not in VALID_RANGES:
            return {"status": "error", "message": f"Invalid range '{range}'. Valid: {VALID_RANGES}"}
        
        data = fetch_yahoo_chart(symbol, interval=interval, range_=range)
        
        if not data:
            return {
                "status": "error",
                "message": f"No data returned for {symbol}. Check symbol format (e.g. RELIANCE.NS, NIFTY.NS, BTC-USD).",
                "symbol": symbol,
                "data": []
            }
        
        latest = data[-1]
        return {
            "status": "success",
            "symbol": symbol,
            "interval": interval,
            "range": range,
            "count": len(data),
            "latest_price": latest["close"],
            "latest_volume": latest["volume"],
            "data": data
        }
    except Exception as e:
        logger.error(f"Market data error for {symbol}: {e}")
        return {"status": "error", "message": str(e), "data": []}


@app.get("/market-data/{symbol}/latest")
def get_latest_market_data(symbol: str, interval: str = "5m"):
    """Fetch only the latest candle for real-time polling"""
    try:
        candle = get_latest_candle(symbol, interval=interval)
        if candle is None:
            return {"status": "error", "message": f"No data for {symbol}"}
        return {
            "status": "success",
            "symbol": symbol,
            "candle": candle
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


def update_data():
    global global_df, model, scaler, features
    while True:
        try:
            print("Updating market data...")

            df = fetch_live_data(STOCK_SYMBOL)
            
            if df is None or df.empty:
                print("Failed to fetch data, skipping update...")
                time.sleep(60)
                continue

            # Indicators
            df = add_sma(df)
            df = add_rsi(df)
            df = add_hma(df)
            df = add_ut_bot(df)

            df.dropna(inplace=True)
            df = create_target(df)

            # Generate signals again
            df = generate_signals(df, model, scaler, features)
            df = backtest(df)

            global_df = df

            print("Update completed")

        except Exception as e:
            print("Error:", e)

        time.sleep(60)  # update every 1 minute

thread = threading.Thread(target=update_data)
thread.daemon = True
# Don't start thread automatically - user will trigger analysis via API
# thread.start()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)