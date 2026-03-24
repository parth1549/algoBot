'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, CheckCircle } from 'lucide-react';
import BrokerLogoGrid from './BrokerLogoGrid';

const BROKERS_LIST = [
  { id: 'zerodha', name: 'Zerodha', logoUrl: 'https://zerodha.com/static/images/logo.svg', connected: true },
  { id: 'angelone', name: 'Angel One', logoUrl: '/brokers/angelone.svg', connected: false },
  { id: 'upstox', name: 'Upstox', logoUrl: '/brokers/upstox.svg', connected: false }
];

export default function BrokerSetup() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [brokers, setBrokers] = useState(BROKERS_LIST);
  const [brokerId, setBrokerId] = useState('');
  const [clientId, setClientId] = useState('');
  const [otp, setOtp] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setBrokers(brokers.map(b => b.id === brokerId ? { ...b, connected: true } : b));
      setIsSaving(false);
      setBrokerId('');
      setClientId('');
      setOtp('');
      setIsOpen(false);
    }, 800);
  };

  const connectedCount = brokers.filter(b => b.connected).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors"
        style={{ 
          background: connectedCount > 0 ? 'rgba(16,185,129,0.1)' : 'var(--bg-primary)', 
          border: `1px solid ${connectedCount > 0 ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
          color: connectedCount > 0 ? 'var(--accent-green)' : 'var(--text-secondary)',
          fontSize: 12,
          fontWeight: 600
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: connectedCount > 0 ? 'var(--accent-green)' : 'var(--text-muted)' }} />
        Add Broker
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-3 py-4 z-50 fade-in"
          style={{ 
            width: 480, 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border)', 
            borderRadius: 16, 
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' 
          }}
        >
          <div className="px-6 py-2 border-b mb-4 pb-4" style={{ borderColor: 'var(--border)' }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 16 }}>Add Broker</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Select your broker to enable automated live trading execution based on the generated signals.</div>
          </div>

          <div className="px-6">
            <BrokerLogoGrid 
              brokers={brokers}
              selectedId={brokerId}
              onSelect={(id) => setBrokerId(id)}
            />

            {brokerId && (
              <div className="fade-in mt-6 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                <div style={{ marginBottom: 16 }}>
                  <label className="stat-label" style={{ display: 'block', marginBottom: 8 }}>
                    Phone Number or Client ID
                  </label>
                  <input 
                    type="text" 
                    className="input bg-slate-900/50" 
                    placeholder={`Enter your ${brokers.find(b => b.id === brokerId)?.name} Client ID or Phone`}
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                  />
                </div>
                
                <div style={{ marginBottom: 20 }}>
                  <label className="stat-label" style={{ display: 'block', marginBottom: 8 }}>
                    Verification OTP
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="input bg-slate-900/50 flex-1" 
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 rounded-lg font-medium border border-slate-700 transition-colors">
                      Get OTP
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                    The OTP will be sent to your registered mobile number by {brokers.find(b => b.id === brokerId)?.name}.
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-700/50">
                  <button 
                    className="btn-primary w-full justify-center" 
                    onClick={handleSave}
                    disabled={!brokerId || !clientId || !otp || isSaving}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    {isSaving ? (
                      <><span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} /> Verifying...</>
                    ) : (
                      <><CheckCircle size={16} /> Verify & Connect Broker</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
