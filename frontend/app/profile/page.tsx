'use client';

import { useState, useEffect } from 'react';
import { UserCircle, Settings, Key, Building2, CheckCircle, Save } from 'lucide-react';

import BrokerLogoGrid from '@/components/BrokerLogoGrid';

const brokers = [
  { id: 'zerodha', name: 'Zerodha', logoUrl: 'https://zerodha.com/static/images/logo.svg', connected: true },
  { id: 'angelone', name: 'Angel One', logoUrl: 'https://companieslogo.com/img/orig/ANGELONE.NS-e51b17b6.png', connected: false },
  { id: 'upstox', name: 'Upstox', logoUrl: 'https://upstox.com/app/themes/upstox/assets/images/upstox-logo.svg', connected: false }
];

export default function ProfilePage() {
  const [broker, setBroker] = useState('');
  const [clientId, setClientId] = useState('');
  const [otp, setOtp] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedBroker = localStorage.getItem('algo_broker_id');
    const savedClient = localStorage.getItem('algo_client_id');
    if (savedBroker) setBroker(savedBroker);
    if (savedClient) setClientId(savedClient);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API call to save config
    setTimeout(() => {
      localStorage.setItem('algo_broker_id', broker);
      localStorage.setItem('algo_client_id', clientId);
      
      setIsSaving(false);
      setSuccess('Broker verified and connected successfully!');
      setTimeout(() => setSuccess(''), 4000);
    }, 800);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 800 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          User Profile & Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Manage your account details and connect your brokerage account.
        </p>
      </div>

      {success && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }} className="fade-in">
          <CheckCircle size={16} color="var(--accent-green)" />
          <span style={{ color: 'var(--accent-green)', fontSize: 13, fontWeight: 500 }}>{success}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column - User Info */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '30px 20px' }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: '50%', 
            background: 'var(--bg-secondary)', border: '2px solid var(--border-bright)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16
          }}>
            <UserCircle size={40} color="var(--text-muted)" />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Algo Trader</h2>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Free Tier Plan</div>
          
          <div style={{ width: '100%', height: 1, background: 'var(--border)', marginBottom: 20 }} />
          
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 10 }}>
            <span style={{ color: 'var(--text-muted)' }}>Status</span>
            <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Active</span>
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Member Since</span>
            <span style={{ color: 'var(--text-secondary)' }}>Mar 2026</span>
          </div>
        </div>


      </div>
    </div>
  );
}
