import React from 'react';
import { Activity, ShieldAlert, HeartPulse } from 'lucide-react';

interface HeaderProps {
  activeTab: 'symptom-check' | 'caregiver-dashboard' | 'integrated-farm' | 'medicinal-garden' | 'safety-protocols';
  setActiveTab: (tab: 'symptom-check' | 'caregiver-dashboard' | 'integrated-farm' | 'medicinal-garden' | 'safety-protocols') => void;
  urgentCount: number;
  onOpenEmergency: () => void;
  onStartNewCheckIn: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  urgentCount,
  onOpenEmergency,
  onStartNewCheckIn,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('symptom-check')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  AfyaCheck AI
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-400">
                  Health & Caregiver Companion
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('symptom-check')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'symptom-check'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : 'hover:text-slate-900'
              }`}
            >
              Symptom Check
            </button>

            <button
              onClick={() => setActiveTab('caregiver-dashboard')}
              className={`relative whitespace-nowrap transition-colors py-1 flex items-center gap-1.5 ${
                activeTab === 'caregiver-dashboard'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : 'hover:text-slate-900'
              }`}
            >
              <span>Caregiver Dashboard</span>
              {urgentCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-mono font-semibold bg-rose-600 text-white rounded-md tabular-nums">
                  {urgentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('integrated-farm')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'integrated-farm'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : 'hover:text-slate-900'
              }`}
            >
              Integrated Farm Hub
            </button>

            <button
              onClick={() => setActiveTab('medicinal-garden')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'medicinal-garden'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : 'hover:text-slate-900'
              }`}
            >
              Botanical Dispensary
            </button>

            <button
              onClick={() => setActiveTab('safety-protocols')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'safety-protocols'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : 'hover:text-slate-900'
              }`}
            >
              Safety Protocols
            </button>
          </nav>

          {/* Zone 3: Primary action point */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenEmergency}
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              title="Emergency SOS / Red Flag Hotline"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Emergency SOS</span>
            </button>

            <button
              onClick={onStartNewCheckIn}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>+ New Check-in</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation strip */}
        <div className="flex md:hidden items-center gap-4 overflow-x-auto py-2.5 border-t border-slate-100 text-xs font-medium text-slate-600 no-scrollbar">
          <button
            onClick={() => setActiveTab('symptom-check')}
            className={`whitespace-nowrap shrink-0 ${activeTab === 'symptom-check' ? 'text-emerald-700 font-semibold' : ''}`}
          >
            Symptom Check
          </button>
          <button
            onClick={() => setActiveTab('caregiver-dashboard')}
            className={`whitespace-nowrap shrink-0 flex items-center gap-1 ${activeTab === 'caregiver-dashboard' ? 'text-emerald-700 font-semibold' : ''}`}
          >
            Caregiver ({urgentCount})
          </button>
          <button
            onClick={() => setActiveTab('integrated-farm')}
            className={`whitespace-nowrap shrink-0 ${activeTab === 'integrated-farm' ? 'text-emerald-700 font-semibold' : ''}`}
          >
            Integrated Farm
          </button>
          <button
            onClick={() => setActiveTab('medicinal-garden')}
            className={`whitespace-nowrap shrink-0 ${activeTab === 'medicinal-garden' ? 'text-emerald-700 font-semibold' : ''}`}
          >
            Botanicals
          </button>
          <button
            onClick={() => setActiveTab('safety-protocols')}
            className={`whitespace-nowrap shrink-0 ${activeTab === 'safety-protocols' ? 'text-emerald-700 font-semibold' : ''}`}
          >
            Safety
          </button>
        </div>
      </div>
    </header>
  );
};
