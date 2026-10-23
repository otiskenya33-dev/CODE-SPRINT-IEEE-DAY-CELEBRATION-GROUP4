import React from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  Heart,
  Brain,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Phone,
  Trees,
} from 'lucide-react';

interface SafetyProtocolsViewProps {
  onOpenEmergency: () => void;
  onSimulateEmergency: (type: string) => void;
}

export const SafetyProtocolsView: React.FC<SafetyProtocolsViewProps> = ({
  onOpenEmergency,
  onSimulateEmergency,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 bg-rose-50 w-fit px-3 py-1 rounded-md mb-1.5">
            <span>Predefined Safety Checks</span>
            <span>·</span>
            <span>Clinical Warning Signs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Safety Triaging Rules & Urgent Red Flags
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            AfyaCheck AI continuously executes rule-based and clinical safety checks to detect life-threatening events early, alerting caregivers and guiding timely clinical intervention.
          </p>
        </div>

        <button
          onClick={onOpenEmergency}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs flex items-center gap-2 w-fit"
        >
          <Phone className="w-4 h-4" />
          <span>Emergency Hotline Hub</span>
        </button>
      </div>

      {/* Safety Protocols Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Protocol 1: Agrochemical Toxicity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Agrochemical & Pesticide Toxicity
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Organophosphate and carbamate sprays inhibit acetylcholinesterase, producing acute cholinergic overload.
            </p>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5 text-xs">
              <span className="font-bold text-rose-900 block text-[11px] uppercase tracking-wider">
                Trigger Criteria (SLUDGE):
              </span>
              <ul className="text-rose-800 space-y-1 text-[11px]">
                <li>• Pinpoint constricted pupils & blurred vision</li>
                <li>• Excessive sweating, drooling, or vomiting</li>
                <li>• Muscle fasciculations (tremors) or confusion</li>
              </ul>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 font-mono">Immediate 15m Flush</span>
            <button
              onClick={() => onSimulateEmergency('pesticide')}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800"
            >
              Simulate Test Alert →
            </button>
          </div>
        </div>

        {/* Protocol 2: Cardiovascular Ischemia */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Cardiovascular & Chest Pain Signs
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Acute coronary syndrome or hypertensive crisis frequently precipitated by heavy lifting in heat.
            </p>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5 text-xs">
              <span className="font-bold text-rose-900 block text-[11px] uppercase tracking-wider">
                Trigger Criteria:
              </span>
              <ul className="text-rose-800 space-y-1 text-[11px]">
                <li>• Central chest pressure radiating to arm or jaw</li>
                <li>• Severe shortness of breath with cold sweat</li>
                <li>• Systolic BP &gt; 170 or Diastolic &gt; 105 mmHg</li>
              </ul>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 font-mono">Aspirin & Ambulance</span>
            <button
              onClick={() => onSimulateEmergency('chest_pain')}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800"
            >
              Simulate Test Alert →
            </button>
          </div>
        </div>

        {/* Protocol 3: Neurological Stroke */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Acute Neurological (F.A.S.T.)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rapid identification of acute cerebrovascular events or acute meningitis/encephalitis.
            </p>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5 text-xs">
              <span className="font-bold text-rose-900 block text-[11px] uppercase tracking-wider">
                Trigger Criteria:
              </span>
              <ul className="text-rose-800 space-y-1 text-[11px]">
                <li>• Facial drooping or asymmetric smile</li>
                <li>• Arm weakness or inability to raise both arms</li>
                <li>• Slurred unintelligible speech or sudden confusion</li>
              </ul>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 font-mono">Golden Hour Triage</span>
            <button
              onClick={() => onSimulateEmergency('neurological')}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800"
            >
              Simulate Test Alert →
            </button>
          </div>
        </div>

        {/* Protocol 4: Heat Stroke vs Exhaustion */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Severe Heat Illness & Hyperthermia
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Distinguishing mild heat exhaustion from life-threatening heat stroke with altered mental status.
            </p>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 text-xs">
              <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">
                Trigger Criteria:
              </span>
              <ul className="text-amber-800 space-y-1 text-[11px]">
                <li>• Body temp &gt; 39.5°C without normal sweating</li>
                <li>• Disorientation, fainting, or staggering gait</li>
                <li>• Heat index exceeding 41°C during field duty</li>
              </ul>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 font-mono">Active Body Cooling</span>
            <button
              onClick={() => onSimulateEmergency('heat_stroke')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              Simulate Test Alert →
            </button>
          </div>
        </div>

        {/* Protocol 5: Zoonotic & Snakebite */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Trees className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Snakebite & Zoonotic Farm Trauma
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Crotaline/Elapid venomous bites or deep animal pen punctures with soil pathogen infection.
            </p>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
              <span className="font-bold text-emerald-900 block text-[11px] uppercase tracking-wider">
                Emergency Steps:
              </span>
              <ul className="text-emerald-900 space-y-1 text-[11px]">
                <li>• Keep victim still and limb splinted below heart</li>
                <li>• DO NOT cut, suck, or apply tight tourniquet</li>
                <li>• Transport immediately to clinic with antivenom</li>
              </ul>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 font-mono">Limb Immobilization</span>
            <button
              onClick={() => onSimulateEmergency('snakebite')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Simulate Test Alert →
            </button>
          </div>
        </div>

        {/* Protocol 6: Pediatric Dehydration */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Pediatric & Infant Red Flags
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rapid clinical decompensation thresholds in children under 5 years old.
            </p>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 text-xs">
              <span className="font-bold text-blue-900 block text-[11px] uppercase tracking-wider">
                Trigger Criteria:
              </span>
              <ul className="text-blue-900 space-y-1 text-[11px]">
                <li>• Sunken fontanelle, no tears when crying, dry mouth</li>
                <li>• High fever &gt; 39.0°C or lethargy / floppy muscle tone</li>
                <li>• Inability to nurse or retain any liquids for &gt;8h</li>
              </ul>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 font-mono">Immediate Caregiver Alert</span>
            <button
              onClick={() => onSimulateEmergency('pediatric')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800"
            >
              Simulate Test Alert →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
