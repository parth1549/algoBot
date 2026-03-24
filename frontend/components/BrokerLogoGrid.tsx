'use client';

import BrokerLogoCard from './BrokerLogoCard';

export interface Broker {
  id: string;
  name: string;
  logoUrl: string;
  connected?: boolean;
}

interface BrokerLogoGridProps {
  brokers: Broker[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function BrokerLogoGrid({ brokers, selectedId, onSelect }: BrokerLogoGridProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {brokers.map((broker) => (
          <BrokerLogoCard
            key={broker.id}
            id={broker.id}
            name={broker.name}
            logoUrl={broker.logoUrl}
            connected={!!broker.connected}
            selected={selectedId === broker.id}
            onClick={() => onSelect(broker.id)}
          />
        ))}
      </div>
    </div>
  );
}
