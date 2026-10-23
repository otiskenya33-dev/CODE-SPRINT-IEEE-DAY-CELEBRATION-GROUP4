import React from 'react';
import { AlertCircle } from 'lucide-react';

export const MedicalDisclaimer: React.FC = () => {
  return (
    <div className="bg-slate-100/80 border-b border-slate-200 py-2 px-4 text-xs text-slate-600">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>
            <strong>Clinical Safety Notice:</strong> AfyaCheck AI provides preliminary decision-support and health guidance. It does not replace certified professional clinical diagnosis. In case of chest pain, severe bleeding, or acute pesticide ingestion, call emergency services immediately.
          </span>
        </div>
        <div className="text-slate-500 text-[11px] whitespace-nowrap">
          Emergency Lines: <span className="font-mono font-medium text-slate-700">999 / 911 / 112</span>
        </div>
      </div>
    </div>
  );
};
