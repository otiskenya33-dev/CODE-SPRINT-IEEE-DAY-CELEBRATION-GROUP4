import React, { useState } from 'react';
import {
  Trees,
  Search,
  BookOpen,
  AlertTriangle,
  Droplets,
  Sparkles,
  Info,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
} from 'lucide-react';
import { MEDICINAL_CROPS } from '../data/mockData';
import { MedicinalCrop } from '../types';

export const MedicinalGardenView: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState<MedicinalCrop | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orsLitres, setOrsLitres] = useState<number>(1);

  const filteredCrops = MEDICINAL_CROPS.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.commonName.toLowerCase().includes(q) ||
      c.swahiliName.toLowerCase().includes(q) ||
      c.botanicalName.toLowerCase().includes(q) ||
      c.primaryUses.some((u) => u.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 w-fit px-3 py-1 rounded-md">
          <span>Integrated Farm Botanical Dispensary</span>
          <span>·</span>
          <span>Living Herbal Garden</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Evidence-Informed Botanical Remedies & Hydration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Cultivated organically on the Integrated Farm. These botanical remedies provide gentle comfort for mild symptoms, fatigue, respiratory dust irritation, and dehydration under strict clinical safety boundaries.
        </p>
      </div>

      {/* Interactive Oral Rehydration Salt (ORS) Calculator */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>WHO-Standard Farmstead Oral Rehydration Salts (ORS)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Rapid Dehydration & Diarrhea Recovery Formula
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              When working in hot fields or suffering from gastroenteritis, proper sodium-glucose co-transport restores cellular hydration far faster than plain water alone.
            </p>

            {/* Litres Selector */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-medium text-emerald-200">Prepare Batch Size:</span>
              {[1, 2, 5, 10].map((litres) => (
                <button
                  key={litres}
                  onClick={() => setOrsLitres(litres)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
                    orsLitres === litres
                      ? 'bg-white text-emerald-950 shadow-sm'
                      : 'bg-emerald-800/60 text-emerald-200 hover:bg-emerald-800'
                  }`}
                >
                  {litres} Liter{litres > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 space-y-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200 block">
              Calculated Ingredients for {orsLitres}L Clean Water
            </span>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-white/10 rounded-lg border border-white/10">
                <span className="text-2xl font-bold font-mono text-cyan-300 block">
                  {6 * orsLitres}
                </span>
                <span className="text-[11px] text-emerald-100">Level Teaspoons Sugar</span>
              </div>

              <div className="p-3 bg-white/10 rounded-lg border border-white/10">
                <span className="text-2xl font-bold font-mono text-amber-300 block">
                  {orsLitres * 0.5}
                </span>
                <span className="text-[11px] text-emerald-100">Level Teaspoons Salt</span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              Dissolve completely in cooled boiled clean water. Taste should be no saltier than tears. Administer in small continuous sips throughout recovery.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop by name, symptom (e.g. cough, burn, nausea)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Showing {filteredCrops.length} verified farm botanicals
        </span>
      </div>

      {/* Crops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrops.map((crop) => (
          <div
            key={crop.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-emerald-300 transition-colors flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{crop.commonName}</h3>
                  <div className="text-xs text-emerald-700 font-medium">
                    {crop.swahiliName} · <span className="italic text-slate-500 font-serif">{crop.botanicalName}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Trees className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Primary Uses:
                </span>
                <div className="flex flex-wrap gap-1">
                  {crop.primaryUses.map((use, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {use}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
                <span className="font-semibold text-slate-900 block text-[11px]">
                  Preparation Method:
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {crop.preparationMethod}
                </p>
              </div>

              <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{crop.safetyPrecautions}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-mono truncate max-w-[170px]">
                {crop.farmCultivationZone.split('-')[0]}
              </span>
              <button
                onClick={() => setSelectedCrop(crop)}
                className="font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Full Recipe & Science</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Crop Detail Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedCrop.commonName}</h3>
                <p className="text-xs text-emerald-700 font-medium">
                  {selectedCrop.swahiliName} · <span className="italic text-slate-500">{selectedCrop.botanicalName}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCrop(null)}
                className="text-slate-400 hover:text-slate-700 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Farm Cultivation Location
                </h4>
                <p className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono">
                  {selectedCrop.farmCultivationZone}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Active Phytochemical Properties
                </h4>
                <p className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 text-emerald-900 leading-relaxed">
                  {selectedCrop.activeProperties}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Step-by-Step Home Preparation
                </h4>
                <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed text-slate-800">
                  {selectedCrop.preparationMethod}
                </p>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
                <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Clinical Safety & Contraindications</span>
                </h4>
                <p className="text-rose-800 leading-relaxed">
                  {selectedCrop.safetyPrecautions}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCrop(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close Guidance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
