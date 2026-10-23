import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Heart,
  Mic,
  MicOff,
  Phone,
  Shield,
  Sparkles,
  Thermometer,
  Trees,
  User,
  Volume2,
  AlertOctagon,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { PatientCheckIn, TriageResult, VitalsData, FarmContextData } from '../types';
import { evaluateSymptomTriage } from '../services/triageEngine';
import { saveCheckIn } from '../services/storage';

interface SymptomCheckViewProps {
  onCheckInCompleted: (checkIn: PatientCheckIn) => void;
  onOpenEmergency: () => void;
  onNavigateToCaregiver: () => void;
  onNavigateToFarm: () => void;
}

export const SymptomCheckView: React.FC<SymptomCheckViewProps> = ({
  onCheckInCompleted,
  onOpenEmergency,
  onNavigateToCaregiver,
  onNavigateToFarm,
}) => {
  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientLocation, setPatientLocation] = useState('Farm Greenhouse Sector 2');
  const [symptomDescription, setSymptomDescription] = useState('');
  const [duration, setDuration] = useState('1-2 days');
  const [severity, setSeverity] = useState<number>(4);
  const [language, setLanguage] = useState<'en' | 'sw'>('en');

  // Vitals State
  const [showVitals, setShowVitals] = useState(false);
  const [temp, setTemp] = useState('');
  const [bp, setBp] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [spO2, setSpO2] = useState('');

  // Farm Context State
  const [isFarmWorker, setIsFarmWorker] = useState(true);
  const [recentPesticideHandling, setRecentPesticideHandling] = useState(false);
  const [animalContact, setAnimalContact] = useState(false);
  const [dehydrationHeatRisk, setDehydrationHeatRisk] = useState(false);
  const [ageGroup, setAgeGroup] = useState<'Child (<12)' | 'Adolescent (13-17)' | 'Adult (18-64)' | 'Elderly (65+)'>('Adult (18-64)');

  // Voice recording state
  const [isListening, setIsListening] = useState(false);

  // Result state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [savedCheckIn, setSavedCheckIn] = useState<PatientCheckIn | null>(null);
  const [copiedNote, setCopiedNote] = useState(false);

  // Quick preset chips
  const quickSymptoms = [
    { label: 'Heat Fatigue & Headache', text: 'Throbbing headache and dizziness after 4 hours weeding in hot sun', heat: true },
    { label: 'Pesticide Mist Inhalation', text: 'Chest tightness, eye stinging, nausea, and dizziness after spraying crop pesticide', pesticide: true },
    { label: 'Farm Animal Scratch', text: 'Deep scratch from livestock pen barbed wire with throbbing pain and redness', animal: true },
    { label: 'Severe Chest Pressure', text: 'Crushing heavy pressure in center of chest radiating to left arm and shortness of breath' },
    { label: 'Dust Cough & Throat Tickle', text: 'Dry tickly throat and coughing from dry grain dust during maize threshing' },
    { label: 'Stomach Cramps & Nausea', text: 'Abdominal cramps, watery diarrhea, and mild dehydration after drinking untreated field water' },
  ];

  const handleApplyPreset = (preset: typeof quickSymptoms[0]) => {
    setSymptomDescription(preset.text);
    if (preset.pesticide) {
      setRecentPesticideHandling(true);
      setIsFarmWorker(true);
      setSeverity(8);
    } else if (preset.animal) {
      setAnimalContact(true);
      setIsFarmWorker(true);
      setSeverity(6);
    } else if (preset.heat) {
      setDehydrationHeatRisk(true);
      setIsFarmWorker(true);
      setSeverity(4);
    }
  };

  // Web Speech API handler
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your symptoms.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'sw' ? 'sw-KE' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSymptomDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleRunTriage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomDescription.trim()) return;

    setIsAnalyzing(true);

    const vitals: VitalsData = {
      temp: temp || undefined,
      bp: bp || undefined,
      heartRate: heartRate || undefined,
      spO2: spO2 || undefined,
    };

    const context: FarmContextData = {
      isFarmWorker,
      farmSection: patientLocation,
      recentPesticideHandling,
      animalContact,
      dehydrationHeatRisk,
      ageGroup,
    };

    setTimeout(() => {
      const result = evaluateSymptomTriage(symptomDescription, duration, severity, vitals, context, language);
      setTriageResult(result);

      // Create new check-in object
      const newCheckIn: PatientCheckIn = {
        id: `chk-${Date.now().toString().slice(-6)}`,
        patientName: patientName.trim() || 'Anonymous Patient',
        patientPhone: patientPhone.trim() || undefined,
        patientLocation,
        createdAt: new Date().toISOString(),
        symptomDescription: symptomDescription.trim(),
        duration,
        severity,
        vitals,
        context,
        triage: result,
        caregiverStatus: result.isEmergency ? 'under_review' : 'pending_review',
        caregiverNotes: result.isEmergency
          ? ['System auto-alert: Urgent triage safety thresholds triggered. Assigned for immediate review.']
          : [],
        language,
      };

      saveCheckIn(newCheckIn);
      setSavedCheckIn(newCheckIn);
      onCheckInCompleted(newCheckIn);
      setIsAnalyzing(false);

      // Scroll to result
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }, 450);
  };

  const handleReset = () => {
    setTriageResult(null);
    setSavedCheckIn(null);
    setSymptomDescription('');
    setSeverity(4);
    setTemp('');
    setBp('');
    setHeartRate('');
    setSpO2('');
    setRecentPesticideHandling(false);
    setAnimalContact(false);
    setDehydrationHeatRisk(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Banner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="lg:col-span-7 p-6 sm:p-10 space-y-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 w-fit px-3 py-1 rounded-md">
            <span>AfyaCheck AI Companion</span>
            <span>·</span>
            <span>Integrated Farm Health</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight text-balance">
            Understand your symptoms, get self-care advice, and alert caregivers.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            AfyaCheck AI connects patients and farm workers with clinical safety triage. Mild symptoms receive actionable home care and farm botanical relief; serious warning signs immediately alert the caregiver dashboard.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div>
              <p className="text-lg font-bold text-slate-900 font-mono">100%</p>
              <p className="text-slate-500">Predefined Safety Checks</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 font-mono">Instant</p>
              <p className="text-slate-500">Caregiver Dashboard Sync</p>
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-700 font-mono">Farm-Grown</p>
              <p className="text-slate-500">Botanical & ORS Guidance</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 h-64 lg:h-full relative min-h-[260px] bg-slate-100">
          <img
            src="/src/assets/images/afyacheck_health_hero_1792746757295.jpg"
            alt="Community healthcare worker assisting patient in rural health clinic"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-4">
            <span className="text-xs text-white/90 font-medium">
              Community Health Station & Farm Wellness Hub
            </span>
          </div>
        </div>
      </div>

      {/* Main Intake Form & Live Triage Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Intake Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Patient & Worker Health Check-in</h2>
              <p className="text-xs text-slate-500">Describe what you are experiencing to receive guidance.</p>
            </div>

            {/* Language toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  language === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('sw')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  language === 'sw' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Kiswahili
              </button>
            </div>
          </div>

          <form onSubmit={handleRunTriage} className="space-y-6">
            {/* Patient Identity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Patient or Worker Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Moses Otieno"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Phone Number (for SMS Alerts)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+254 7XX XXX XXX"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Farm Zone or Location */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Farm Unit or Residential Location
              </label>
              <select
                value={patientLocation}
                onChange={(e) => setPatientLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              >
                <option value="Farm Greenhouse Sector 1">Farm Greenhouse Sector 1</option>
                <option value="Farm Greenhouse Sector 2">Farm Greenhouse Sector 2</option>
                <option value="Livestock & Dairy Boma">Livestock & Dairy Boma</option>
                <option value="Open Maize & Sorghum Fields">Open Maize & Sorghum Fields</option>
                <option value="Farm Nursery & Herb Garden">Farm Nursery & Herb Garden</option>
                <option value="Post-Harvest Sorting Shed">Post-Harvest Sorting Shed</option>
                <option value="Farm Homestead Ward 1">Farm Homestead Ward 1</option>
                <option value="Community Residence">Community Residence</option>
              </select>
            </div>

            {/* Symptom Description & Voice input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700">
                  {language === 'sw' ? 'Eleza dalili unazohisi' : 'Describe your symptoms in detail *'}
                </label>
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${
                    isListening
                      ? 'bg-rose-100 text-rose-700 animate-pulse'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Speak symptoms using microphone"
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-rose-600" />
                      <span>Listening...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-slate-600" />
                      <span>Voice Input</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={3}
                required
                value={symptomDescription}
                onChange={(e) => setSymptomDescription(e.target.value)}
                placeholder={
                  language === 'sw'
                    ? 'Mfano: Maumivu ya kichwa, kizunguzungu baada ya kupulizia dawa shambani...'
                    : 'e.g., Severe throbbing headache, feeling dizzy and nauseous after spraying greenhouse crops...'
                }
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors placeholder:text-slate-400"
              />

              {/* Quick Preset Chips */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] text-slate-500 py-0.5">Quick examples:</span>
                {quickSymptoms.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(chip)}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 rounded border border-slate-200 transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration and Severity Slider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Duration of Symptoms
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {['< 6 hours', '1-2 days', '3-7 days', '> 1 week'].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDuration(dur)}
                      className={`py-1.5 px-1 rounded-md text-center transition-colors font-medium ${
                        duration === dur
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Discomfort / Pain Level: <span className="font-mono font-bold text-slate-900">{severity}/10</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {severity <= 3 ? 'Mild' : severity <= 6 ? 'Moderate' : 'Severe'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>1 (Noticeable)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Unbearable)</span>
                </div>
              </div>
            </div>

            {/* Integrated Farm Context Checklist */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                <Trees className="w-4 h-4 text-emerald-700" />
                <span>Integrated Farm Occupational Checks</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFarmWorker}
                    onChange={(e) => setIsFarmWorker(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Agricultural field or farm duty</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={recentPesticideHandling}
                    onChange={(e) => setRecentPesticideHandling(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={recentPesticideHandling ? 'text-amber-900 font-semibold' : ''}>
                    Agrochemical or pesticide spray in 48h
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={animalContact}
                    onChange={(e) => setAnimalContact(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Livestock handling or animal scratch</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dehydrationHeatRisk}
                    onChange={(e) => setDehydrationHeatRisk(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>High midday sun or heat exposure &gt;4h</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-emerald-100 text-xs">
                <span className="text-slate-500">Age Bracket:</span>
                {(['Child (<12)', 'Adolescent (13-17)', 'Adult (18-64)', 'Elderly (65+)'] as const).map((ag) => (
                  <button
                    key={ag}
                    type="button"
                    onClick={() => setAgeGroup(ag)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      ageGroup === ag ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {ag.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Vitals Toggle */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowVitals(!showVitals)}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-emerald-600" />
                  <span>Clinical Vital Signs (Optional but Recommended)</span>
                </div>
                <span className="text-slate-500 font-normal">
                  {showVitals ? 'Hide Vitals' : '+ Add Readings (Temp, BP, Pulse)'}
                </span>
              </button>

              {showVitals && (
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white text-xs border-t border-slate-200">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Body Temp (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 37.5"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
                    />
                    <span className="text-[10px] text-slate-400">&gt;38.0 = Fever</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Blood Pressure
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 120/80"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
                    />
                    <span className="text-[10px] text-slate-400">Systolic/Diastolic</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Heart Rate (BPM)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 78"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
                    />
                    <span className="text-[10px] text-slate-400">Normal 60-100</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Blood Oxygen (SpO2 %)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 98"
                      value={spO2}
                      onChange={(e) => setSpO2(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
                    />
                    <span className="text-[10px] text-slate-400">&lt;93% = Alert</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isAnalyzing || !symptomDescription.trim()}
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Symptoms & Running Safety Checks...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Safety Check & Clinical Triage</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Triage Result Card or Guidance Preview */}
        <div className="lg:col-span-5 space-y-6">
          {triageResult ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              {/* Triage Level Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  triageResult.triageLevel === 'URGENT_EMERGENCY'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : triageResult.triageLevel === 'MODERATE_FOLLOW_UP'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                {triageResult.triageLevel === 'URGENT_EMERGENCY' ? (
                  <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                ) : triageResult.triageLevel === 'MODERATE_FOLLOW_UP' ? (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {triageResult.triageLevel === 'URGENT_EMERGENCY'
                        ? 'Urgent Medical Attention Required'
                        : triageResult.triageLevel === 'MODERATE_FOLLOW_UP'
                        ? 'Caregiver Follow-Up Recommended'
                        : 'Mild Symptoms — Home Self-Care Guidance'}
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed font-medium">
                    {triageResult.primaryAssessment}
                  </p>
                </div>
              </div>

              {/* Predefined Safety Warning Flags */}
              {triageResult.safetyFlags && triageResult.safetyFlags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-600" />
                    <span>Safety Check Flags</span>
                  </h3>
                  <div className="space-y-1.5">
                    {triageResult.safetyFlags.map((flag, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-2"
                      >
                        <span className="text-rose-500 font-bold shrink-0">!</span>
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step-by-Step Self-Care Steps */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Immediate Self-Care & Recovery Steps</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  {triageResult.selfCareSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 font-mono">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Farmstead Botanical & Hydration Support */}
              {triageResult.farmsteadRemedies && triageResult.farmsteadRemedies.length > 0 && (
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <Trees className="w-4 h-4 text-emerald-700" />
                      Integrated Farm Botanical & ORS Care
                    </span>
                    <button
                      onClick={onNavigateToFarm}
                      className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      View Dispensary <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {triageResult.farmsteadRemedies.map((rem, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">·</span>
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Red Flags to Seek Medical Care */}
              <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-xl space-y-2">
                <h3 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Seek Immediate Hospital Attention If You Experience:</span>
                </h3>
                <ul className="space-y-1 text-xs text-rose-800">
                  {triageResult.redFlagsToSeekCare.map((rf, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">×</span>
                      <span>{rf}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Caregiver Clinical Handover Note */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">
                    Caregiver Dashboard Note
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(triageResult.caregiverTriageNote);
                      setCopiedNote(true);
                      setTimeout(() => setCopiedNote(false), 2000);
                    }}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>{copiedNote ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600 font-mono leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                  {triageResult.caregiverTriageNote}
                </p>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    Suggested follow-up window:{' '}
                    <strong>
                      {triageResult.suggestedFollowUpHours === 0
                        ? 'Immediate'
                        : `${triageResult.suggestedFollowUpHours} hours`}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onNavigateToCaregiver}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors text-center"
                >
                  View on Caregiver Board
                </button>

                {triageResult.isEmergency ? (
                  <button
                    type="button"
                    onClick={onOpenEmergency}
                    className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Emergency Services</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
                  >
                    + Check Another Symptom
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Standby Card with Quick Guidance */
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">How AfyaCheck AI Protects You</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every check-in is instantly cross-referenced against clinically validated triage standards and farm occupational risk indicators.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Mild Symptoms & Self-Care</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Receive verified home remedies, hydration protocols, and farmstead botanical guidance like Moringa or ginger infusions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Caregiver Triage Dashboard</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Community health workers and farm managers monitor patient rosters in real time to schedule clinic visits or home check-ups.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Predefined Safety Flags</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Chest pain, breathing distress, snakebites, and acute agrochemical exposure immediately trigger urgent emergency protocols.
                    </p>
                  </div>
                </div>
              </div>

              {/* Integrated Farm Highlight Box */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Trees className="w-4 h-4 text-emerald-700" />
                  <span>Integrated Farm Occupational Health</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Working in agriculture carries unique risks like agrochemical exposure, field heat stress, and zoonotic animal scratches. AfyaCheck AI monitors your farm units and provides safe botanical comfort.
                </p>
                <div className="pt-1">
                  <button
                    onClick={onNavigateToFarm}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
                  >
                    Open Integrated Farm Hub <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
