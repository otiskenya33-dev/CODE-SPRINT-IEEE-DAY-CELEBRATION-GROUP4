import React, { useState } from 'react';
import {
  X,
  Phone,
  ShieldAlert,
  AlertOctagon,
  MapPin,
  Clock,
  Heart,
  Droplets,
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatchCaregiverAlert: (details: { callerName: string; location: string; situation: string }) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onDispatchCaregiverAlert,
}) => {
  if (!isOpen) return null;

  const [callerName, setCallerName] = useState('');
  const [callerLocation, setCallerLocation] = useState('Farm Greenhouse Sector 2');
  const [situation, setSituation] = useState('Suspected agrochemical toxicity / chest distress');
  const [dispatched, setDispatched] = useState(false);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    onDispatchCaregiverAlert({
      callerName: callerName.trim() || 'Urgent Caller',
      location: callerLocation,
      situation,
    });
    setDispatched(true);
    setTimeout(() => {
      setDispatched(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-rose-300 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0">
        {/* Modal Red Alert Header */}
        <div className="bg-rose-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Emergency SOS & Clinical Dispatch</h3>
              <p className="text-xs text-rose-100">Immediate assistance for acute life-threatening situations.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Direct Hotline Call Grid */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Direct Emergency Hotlines
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <a
                href="tel:999"
                className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-3 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block font-mono">999 / 112</span>
                  <span className="text-[10px] text-slate-500">National Emergency</span>
                </div>
              </a>

              <a
                href="tel:911"
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-3 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block font-mono">911</span>
                  <span className="text-[10px] text-slate-500">Universal Dispatch</span>
                </div>
              </a>

              <a
                href="tel:1199"
                className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-3 text-left col-span-2 sm:col-span-1"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block font-mono">Red Cross</span>
                  <span className="text-[10px] text-slate-500">Ambulance Service</span>
                </div>
              </a>
            </div>
          </div>

          {/* Quick Immediate Dispatch to Caregiver Dashboard */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
              <Radio className="w-4 h-4 text-rose-600" />
              <span>Broadcast Immediate Caregiver SOS Alert</span>
            </div>

            {dispatched ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1 text-emerald-900">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold">Emergency Alert Broadcast Successfully!</p>
                <p className="text-[11px] text-emerald-700">All registered community health caregivers and farm officers notified.</p>
              </div>
            ) : (
              <form onSubmit={handleDispatch} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Patient / Caller Name
                    </label>
                    <input
                      type="text"
                      required
                      value={callerName}
                      onChange={(e) => setCallerName(e.target.value)}
                      placeholder="e.g. Moses Otieno"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Farm Location or Ward
                    </label>
                    <input
                      type="text"
                      required
                      value={callerLocation}
                      onChange={(e) => setCallerLocation(e.target.value)}
                      placeholder="e.g. Greenhouse Sector 2"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Emergency Nature
                  </label>
                  <select
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Agrochemical or pesticide acute poisoning">Agrochemical or pesticide acute poisoning</option>
                    <option value="Chest pain / suspected heart attack">Chest pain / suspected heart attack</option>
                    <option value="Severe breathing difficulty or choking">Severe breathing difficulty or choking</option>
                    <option value="Snakebite / venomous animal attack">Snakebite / venomous animal attack</option>
                    <option value="Severe heat stroke / unconsciousness">Severe heat stroke / unconsciousness</option>
                    <option value="Severe bleeding laceration from machinery">Severe bleeding laceration from machinery</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>Transmit High-Priority Alert to Caregiver Board</span>
                </button>
              </form>
            )}
          </div>

          {/* Immediate Critical First-Aid Directives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl space-y-1">
              <span className="font-bold text-rose-900 block">Pesticide Exposure First Step:</span>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                Immediately strip off contaminated clothes and flush skin/eyes with clean water for 15 minutes. Save the chemical label.
              </p>
            </div>

            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1">
              <span className="font-bold text-amber-900 block">Chest Pain First Step:</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Have patient sit semi-reclined, loosen collar, chew 300mg soluble aspirin if not allergic, and keep completely calm.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
