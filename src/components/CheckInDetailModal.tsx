import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Phone,
  Clock,
  Printer,
  FileText,
  User,
  Heart,
  Trees,
} from 'lucide-react';
import { PatientCheckIn, CaregiverStatus } from '../types';

interface CheckInDetailModalProps {
  checkIn: PatientCheckIn | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: CaregiverStatus, note?: string) => void;
  onOpenEmergency: () => void;
}

export const CheckInDetailModal: React.FC<CheckInDetailModalProps> = ({
  checkIn,
  onClose,
  onUpdateStatus,
  onOpenEmergency,
}) => {
  if (!checkIn) return null;

  const [newNote, setNewNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CaregiverStatus>(checkIn.caregiverStatus);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onUpdateStatus(checkIn.id, selectedStatus, newNote.trim());
    setNewNote('');
  };

  const handleStatusChange = (status: CaregiverStatus) => {
    setSelectedStatus(status);
    onUpdateStatus(checkIn.id, status);
  };

  const handlePrint = () => {
    window.print();
  };

  const triage = checkIn.triage;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${
                triage.triageLevel === 'URGENT_EMERGENCY'
                  ? 'bg-rose-600'
                  : triage.triageLevel === 'MODERATE_FOLLOW_UP'
                  ? 'bg-amber-600'
                  : 'bg-emerald-600'
              }`}
            >
              {triage.triageLevel === 'URGENT_EMERGENCY' ? (
                <AlertOctagon className="w-5 h-5" />
              ) : triage.triageLevel === 'MODERATE_FOLLOW_UP' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{checkIn.patientName}</h3>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-600 font-mono">{checkIn.patientLocation}</span>
              </div>
              <p className="text-xs text-slate-500">
                Logged {new Date(checkIn.createdAt).toLocaleString()} · ID: {checkIn.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
              title="Print Clinical Summary"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Triage Status Strip */}
          <div
            className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
              triage.triageLevel === 'URGENT_EMERGENCY'
                ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                : triage.triageLevel === 'MODERATE_FOLLOW_UP'
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">
                {triage.triageLevel.replace('_', ' ')}
              </span>
              <p className="text-xs mt-1 font-medium leading-relaxed">
                {triage.primaryAssessment}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] block font-mono text-slate-500">Discomfort</span>
              <span className="text-base font-bold font-mono text-slate-900">{checkIn.severity}/10</span>
            </div>
          </div>

          {/* Vitals & Context Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block mb-0.5">Body Temp</span>
              <span className="font-mono font-bold text-slate-900">
                {checkIn.vitals.temp ? `${checkIn.vitals.temp}°C` : 'Not recorded'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block mb-0.5">Blood Pressure</span>
              <span className="font-mono font-bold text-slate-900">
                {checkIn.vitals.bp || 'Not recorded'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block mb-0.5">Pulse Rate</span>
              <span className="font-mono font-bold text-slate-900">
                {checkIn.vitals.heartRate ? `${checkIn.vitals.heartRate} bpm` : 'Not recorded'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block mb-0.5">SpO2 Oxygen</span>
              <span className="font-mono font-bold text-slate-900">
                {checkIn.vitals.spO2 ? `${checkIn.vitals.spO2}%` : 'Not recorded'}
              </span>
            </div>
          </div>

          {/* Symptoms Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Reported Symptoms & History
            </h4>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
              <p className="font-medium text-slate-900 mb-1">"{checkIn.symptomDescription}"</p>
              <div className="flex flex-wrap items-center gap-3 text-slate-500 pt-2 border-t border-slate-200 text-[11px]">
                <span>Duration: <strong>{checkIn.duration}</strong></span>
                <span>·</span>
                <span>Farm Labor: <strong>{checkIn.context.isFarmWorker ? 'Yes' : 'No'}</strong></span>
                <span>·</span>
                <span>Pesticides in 48h: <strong>{checkIn.context.recentPesticideHandling ? 'Yes (Flagged)' : 'No'}</strong></span>
                <span>·</span>
                <span>Animal Contact: <strong>{checkIn.context.animalContact ? 'Yes' : 'No'}</strong></span>
              </div>
            </div>
          </div>

          {/* Safety Flags & Caregiver Note */}
          {triage.safetyFlags && triage.safetyFlags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Predefined Safety Flags Detected</span>
              </h4>
              <div className="space-y-1.5">
                {triage.safetyFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 text-xs text-rose-900 flex items-start gap-2"
                  >
                    <span className="font-bold text-rose-600 shrink-0">!</span>
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caregiver Clinical Handover Note */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Caregiver Triage Handover Assessment</span>
            </h4>
            <div className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-100 text-xs text-slate-700 leading-relaxed font-mono">
              {triage.caregiverTriageNote}
            </div>
          </div>

          {/* Caregiver Status Management */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Caregiver Triage Disposition
              </span>
              <span className="text-[11px] text-slate-500">
                Last reviewed: {checkIn.reviewedBy || 'Not yet reviewed'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { key: 'pending_review', label: 'Pending Review' },
                { key: 'under_review', label: 'Under Review' },
                { key: 'followup_scheduled', label: 'Follow-up Scheduled' },
                { key: 'resolved', label: 'Resolved / Discharged' },
              ].map((st) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => handleStatusChange(st.key as CaregiverStatus)}
                  className={`py-2 px-3 rounded-lg font-medium transition-colors text-center ${
                    selectedStatus === st.key
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Existing Notes Log */}
            {checkIn.caregiverNotes && checkIn.caregiverNotes.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <span className="text-[11px] font-semibold text-slate-600">Caregiver Action Log:</span>
                {checkIn.caregiverNotes.map((note, idx) => (
                  <div key={idx} className="p-2 bg-white rounded border border-slate-200 text-xs text-slate-700">
                    {note}
                  </div>
                ))}
              </div>
            )}

            {/* Add Clinical Note Form */}
            <form onSubmit={handleSaveNote} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add clinical observation or follow-up instruction..."
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap"
              >
                Add Note
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {checkIn.patientPhone ? (
              <a
                href={`tel:${checkIn.patientPhone}`}
                className="font-medium text-emerald-700 hover:underline flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Patient: {checkIn.patientPhone}</span>
              </a>
            ) : (
              <span>No direct phone provided</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {triage.isEmergency && (
              <button
                type="button"
                onClick={onOpenEmergency}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Dispatch Emergency (999/911)</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
