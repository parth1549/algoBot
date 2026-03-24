'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, HelpCircle, Users, BookOpen, FileText, BarChart2, Calculator, PlayCircle, Settings, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: Settings, label: 'Settings', href: '/profile' },
    { icon: PlayCircle, label: 'Take Product Tour' },
    { icon: HelpCircle, label: 'Customer Support' },
    { icon: Users, label: 'Community' },
    { icon: FileText, label: 'Docs' },
    { icon: BookOpen, label: 'Blog' },
    { icon: BarChart2, label: 'Charts' },
    { icon: Calculator, label: 'Margin Calculator' },
    { icon: PlayCircle, label: 'Courses' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Avatar */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-full bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors"
        style={{ width: 36, height: 36, fontSize: 13, border: '2px solid var(--border-bright)' }}
      >
        PA
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-3 pt-2 pb-2 z-50 fade-in"
          style={{ 
            width: 300, 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border)', 
            borderRadius: 16, 
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' 
          }}
        >
          {/* Section 1: User Info */}
          <div className="px-5 py-4 flex items-center gap-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="rounded-full bg-blue-600 text-white font-bold flex items-center justify-center" style={{ width: 44, height: 44, fontSize: 16 }}>
              PA
            </div>
            <div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15 }}>Parth Agrawal</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>parth@example.com</div>
            </div>
          </div>



          {/* Section 3: Menu Options */}
          <div className="py-2 border-b" style={{ borderColor: 'var(--border)' }}>
            {menuItems.map((item, i) => {
              if (item.href) {
                return (
                  <Link 
                    key={i} 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center gap-3 px-5 py-2.5 transition-colors"
                    style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <item.icon size={16} color="var(--text-muted)" />
                    {item.label}
                  </Link>
                );
              }
              return (
                <button 
                  key={i} 
                  className="w-full flex items-center gap-3 px-5 py-2.5 transition-colors"
                  style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <item.icon size={16} color="var(--text-muted)" />
                  {item.label}
                </button>
              );
            })}
          </div>



        </div>
      )}
    </div>
  );
}
