import React, { useState, useEffect } from 'react';
import {
  Trees,
  Sun,
  Droplets,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  Clock,
  UserCheck,
  Plus,
  Heart,
  Thermometer,
} from 'lucide-react';
import { FarmSafetyIncident } from '../types';
import { getStoredFarmIncidents, addFarmIncident } from '../services/storage';

interface IntegratedFarmHubViewProps {
  onStartFarmCheckIn: (zoneName: string) => void;
  onNavigateToBotanicals: () => void;
}

export const IntegratedFarmHubView: React.FC<IntegratedFarmHubViewProps> = ({
  onStartFarmCheckIn,
  onNavigateToBotanicals,
}) => {
  // Heat Stress Calculator State
  const [ambientTemp, setAmbientTemp] = useState<number>(31);
  const [humidity, setHumidity] = useState<number>(65);

  // Calculate Heat Index (Rothfusz approximation for safety triage)
  const heatIndex = Math.round(
    -8.784695 +
      1.61139411 * ambientTemp +
      2.338549 * humidity -
      0.14611605 * ambientTemp * humidity -
      0.012308094 * ambientTemp * ambientTemp -
      0.016424828 * humidity * humidity +
      0.002211732 * ambientTemp * ambientTemp * humidity +
      0.00072546 * ambientTemp * humidity * humidity -
      0.000003582 * ambientTemp * ambientTemp * humidity * humidity
  );

  let heatRiskLevel = 'Safe / Normal';
  let heatGuidance = 'Drink 500ml of clean water per hour. Normal field work cadence.';
  let heatBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';

  if (heatIndex >= 41) {
    heatRiskLevel = 'Extreme Danger';
    heatGuidance = 'High risk of heat stroke. Suspend strenuous greenhouse and field weeding between 11:00 - 15:00. Mandatory shade breaks: 20 min per 40 min work.';
    heatBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (heatIndex >= 35) {
    heatRiskLevel = 'Danger / High Heat Strain';
    heatGuidance = 'Mandatory shade rest 15 min every 45 min. Field workers must drink at least 1 liter of water or farmstead ORS per hour.';
    heatBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (heatIndex >= 29) {
    heatRiskLevel = 'Caution / Moderate Heat';
    heatGuidance = 'Stay hydrated. Wear broad-brimmed hats and rotate workers out of plastic greenhouses.';
    heatBadgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }

  // Agrochemical Emergency Flush Timer (15-min countdown)
  const [timerSeconds, setTimerSeconds] = useState<number>(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // PPE Checklist State
  const [ppeItems, setPpeItems] = useState([
    { id: 'ppe1', label: 'Particulate / Chemical Respirator Mask', checked: true },
    { id: 'ppe2', label: 'Heavy-Duty Nitrile or Neoprene Chemical Gloves', checked: true },
    { id: 'ppe3', label: 'Splash-Proof Chemical Goggles', checked: false },
    { id: 'ppe4', label: 'Waterproof Apron or Coverall Suit', checked: true },
    { id: 'ppe5', label: 'Rubber Gumboots (Pants worn outside boots)', checked: true },
  ]);

  const togglePpe = (id: string) => {
    setPpeItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const ppeCompliant = ppeItems.every((i) => i.checked);

  // Field Fitness-to-Work Roster
  const [farmShiftWorkers, setFarmShiftWorkers] = useState([
    { id: 'w1', name: 'Moses Otieno', zone: 'Greenhouse Sector 2', status: 'Fit for Light Duty', hydrated: true },
    { id: 'w2', name: 'John Kiprono', zone: 'Maize Tractor Operations', status: 'Fit for Full Duty', hydrated: true },
    { id: 'w3', name: 'Grace Muthoni', zone: 'Nursery Seedlings', status: 'Fit for Full Duty', hydrated: true },
    { id: 'w4', name: 'Amina Abdi', zone: 'Livestock Dairy Unit', status: 'Fit for Full Duty', hydrated: true },
  ]);

  // Incidents log
  const [incidents, setIncidents] = useState<FarmSafetyIncident[]>([]);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newIncidentZone, setNewIncidentZone] = useState('Greenhouse Sector 1');
  const [newIncidentType, setNewIncidentType] = useState<FarmSafetyIncident['type']>('Heat Stress');
  const [newFirstAid, setNewFirstAid] = useState('');

  useEffect(() => {
    setIncidents(getStoredFarmIncidents());
  }, []);

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim() || !newFirstAid.trim()) return;

    const incident: FarmSafetyIncident = {
      id: `inc-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().slice(0, 10),
      workerName: newWorkerName.trim(),
      zone: newIncidentZone,
      type: newIncidentType,
      severity: newIncidentType === 'Agrochemical Contact' ? 'High' : 'Medium',
      firstAidApplied: newFirstAid.trim(),
      status: 'Open',
    };

    const updated = addFarmIncident(incident);
    setIncidents(updated);
    setNewWorkerName('');
    setNewFirstAid('');
    setShowIncidentForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Farm Hub Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="lg:col-span-7 p-6 sm:p-10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 w-fit px-3 py-1 rounded-md">
            <span>Integrated Farm Safety & Occupational Health</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight text-balance">
            Protecting farm worker wellness, crop health, and community safety.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Integrated Farm unites sustainable regenerative agriculture with community health. We track field heat strain, chemical spray safety, zoonotic prevention, and cultivate living medicinal plants for natural recovery.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onStartFarmCheckIn('Farm Greenhouse Sector 1')}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              + Log Worker Health Check
            </button>
            <button
              onClick={onNavigateToBotanicals}
              className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              Explore Farm Medicinal Garden
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 h-64 lg:h-full relative min-h-[260px] bg-slate-100">
          <img
            src="/src/assets/images/integrated_farm_landscape_1792746770234.jpg"
            alt="Integrated Farm showing lush crop fields, water ponds, and organic medicinal gardens"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-4">
            <span className="text-xs text-white/90 font-medium">
              Eco-Regenerative Agropastoral Demonstration Farm
            </span>
          </div>
        </div>
      </div>

      {/* Feature Split: Heat Index vs Agrochemical Safety */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Module 1: Heat Stress & Hydration Calculator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Field Heat Stress & Hydration Index</h3>
                <p className="text-xs text-slate-500">Real-time heat risk calculation for outdoor farm labor.</p>
              </div>
            </div>
          </div>

          {/* Calculator Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700">Ambient Temp</label>
                <span className="font-mono font-bold text-slate-900 text-xs">{ambientTemp}°C</span>
              </div>
              <input
                type="range"
                min="20"
                max="45"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(parseInt(e.target.value, 10))}
                className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 font-mono">Field Weather Station</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700">Relative Humidity</label>
                <span className="font-mono font-bold text-slate-900 text-xs">{humidity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                value={humidity}
                onChange={(e) => setHumidity(parseInt(e.target.value, 10))}
                className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 font-mono">Greenhouse / Field Sensor</span>
            </div>
          </div>

          {/* Output Display */}
          <div className={`p-4 rounded-xl border space-y-2 ${heatBadgeColor}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">
                Heat Index: <span className="font-mono text-sm">{heatIndex}°C</span>
              </span>
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-white/70">
                {heatRiskLevel}
              </span>
            </div>
            <p className="text-xs leading-relaxed font-medium">
              {heatGuidance}
            </p>
          </div>

          {/* Farm Worker Hydration Directive */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-600" />
              <span>Hydration Stations Protocol</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Clean boiled water dispensers positioned every 100 meters across open fields. Farmworkers must take 250ml every 20-30 minutes rather than drinking large volumes infrequently.
            </p>
          </div>
        </div>

        {/* Module 2: Agrochemical & Pesticide Safety Station */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Agrochemical & Spray Safety</h3>
                <p className="text-xs text-slate-500">PPE verification and emergency chemical flush station.</p>
              </div>
            </div>
          </div>

          {/* Emergency 15-Minute Flush Timer */}
          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block">
                  Emergency Dermal / Eye Flush Timer
                </span>
                <span className="text-[11px] text-rose-700">
                  Standard protocol: Flush with clean water for full 15 minutes.
                </span>
              </div>

              <div className="font-mono text-2xl font-bold text-rose-700 tabular-nums">
                {formatTimer(timerSeconds)}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isTimerRunning ? 'Pause Flush' : 'Start 15-Min Flush'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(15 * 60);
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Pre-Spray PPE Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Pre-Spray PPE Compliance
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  ppeCompliant ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {ppeCompliant ? '100% Cleared for Spray' : 'Incomplete PPE'}
              </span>
            </div>

            <div className="space-y-1.5">
              {ppeItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => togglePpe(item.id)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Module 3: Farm Shift Worker Health Clearance & Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Morning Fitness Roster */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Shift Worker Fitness-to-Work Clearance</h3>
              <p className="text-xs text-slate-500">Morning occupational screening before machinery or spraying operations.</p>
            </div>
            <button
              onClick={() => onStartFarmCheckIn('Farm Greenhouse Sector 1')}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              + Quick Worker Screen
            </button>
          </div>

          <div className="space-y-2">
            {farmShiftWorkers.map((worker) => (
              <div
                key={worker.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center font-mono">
                    {worker.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{worker.name}</h4>
                    <span className="text-[11px] text-slate-500">{worker.zone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{worker.status}</span>
                  </span>
                  <button
                    onClick={() => onStartFarmCheckIn(worker.zone)}
                    className="text-xs text-slate-500 hover:text-slate-900 underline"
                  >
                    Check Vitals
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Farm Incident Log */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Farm Safety & First-Aid Log</h3>
              <p className="text-xs text-slate-500">Occupational incidents and immediate responses.</p>
            </div>
            <button
              onClick={() => setShowIncidentForm(!showIncidentForm)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              {showIncidentForm ? 'Cancel' : '+ Log Incident'}
            </button>
          </div>

          {showIncidentForm && (
            <form onSubmit={handleCreateIncident} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Worker Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peter Kamau"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Zone</label>
                  <select
                    value={newIncidentZone}
                    onChange={(e) => setNewIncidentZone(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs"
                  >
                    <option value="Greenhouse Sector 1">Greenhouse Sector 1</option>
                    <option value="Livestock Boma">Livestock Boma</option>
                    <option value="Maize Tractor Zone">Maize Tractor Zone</option>
                    <option value="Sorting Shed">Sorting Shed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Incident Type</label>
                  <select
                    value={newIncidentType}
                    onChange={(e) => setNewIncidentType(e.target.value as any)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs"
                  >
                    <option value="Heat Stress">Heat Stress</option>
                    <option value="Agrochemical Contact">Agrochemical Contact</option>
                    <option value="Livestock Injury">Livestock Injury</option>
                    <option value="Minor Laceration">Minor Laceration</option>
                    <option value="Equipment Strain">Equipment Strain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">First-Aid Applied</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15-min water flush and rest under shaded shelter..."
                  value={newFirstAid}
                  onChange={(e) => setNewFirstAid(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-md"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                Save Incident Log
              </button>
            </form>
          )}

          <div className="space-y-2.5">
            {incidents.slice(0, 4).map((inc) => (
              <div
                key={inc.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{inc.workerName}</span>
                  <span className="text-[11px] font-mono text-slate-400">{inc.date}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    {inc.type}
                  </span>
                  <span className="text-slate-500">· {inc.zone}</span>
                </div>
                <p className="text-[11px] text-slate-600 pt-1 leading-snug">
                  {inc.firstAidApplied}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
