'use client';

import { CheckCircle2 } from 'lucide-react';

interface BrokerLogoCardProps {
  id: string;
  name: string;
  logoUrl: string;
  connected: boolean;
  selected: boolean;
  onClick: () => void;
}

export default function BrokerLogoCard({ id, name, logoUrl, connected, selected, onClick }: BrokerLogoCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-5 rounded-xl transition-all duration-300 w-full overflow-hidden group
        ${selected ? 'ring-2 ring-blue-500 bg-white scale-[1.02] shadow-[0_4px_20px_rgba(59,130,246,0.15)]' : 'bg-slate-200 hover:bg-white hover:ring-2 hover:ring-slate-300 hover:scale-[1.02] shadow-sm'}
      `}
      style={{ outline: 'none' }}
    >
      {/* Selected Overlay Checkmark */}
      {selected && (
        <div className="absolute top-2.5 left-2.5 text-blue-500">
          <CheckCircle2 size={16} className="fill-blue-50" />
        </div>
      )}

      {/* Connection Status Dot */}
      <div className="absolute top-3.5 right-3.5 flex items-center justify-center group-hover:scale-110 transition-transform">
        <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`} title={connected ? "Connected" : "Not connected"} />
      </div>

      {/* Logo container */}
      <div className="h-10 w-full flex flex-col items-center justify-center mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={logoUrl} 
          alt={`${name} logo`} 
          className="max-h-full max-w-[85%] object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${name}&background=f8fafc&color=0f172a&bold=true`;
          }}
        />
      </div>

      {/* Label */}
      <div className="text-xs font-bold text-slate-800 tracking-wide">{name}</div>
    </button>
  );
}
