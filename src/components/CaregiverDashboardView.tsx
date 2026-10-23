import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Search,
  Filter,
  Eye,
  Phone,
  Trees,
  Clock,
  UserCheck,
  ShieldAlert,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { PatientCheckIn, TriageLevel, CaregiverStatus } from '../types';

interface CaregiverDashboardViewProps {
  checkIns: PatientCheckIn[];
  onSelectCheckIn: (checkIn: PatientCheckIn) => void;
  onOpenEmergency: () => void;
}

export const CaregiverDashboardView: React.FC<CaregiverDashboardViewProps> = ({
  checkIns,
  onSelectCheckIn,
  onOpenEmergency,
}) => {
  const [filterLevel, setFilterLevel] = useState<'ALL' | TriageLevel | 'FARM_WORKERS' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');

  // KPI calculations
  const totalCount = checkIns.length;
  const urgentCount = checkIns.filter((c) => c.triage.triageLevel === 'URGENT_EMERGENCY').length;
  const moderateCount = checkIns.filter((c) => c.triage.triageLevel === 'MODERATE_FOLLOW_UP').length;
  const mildCount = checkIns.filter((c) => c.triage.triageLevel === 'MILD_SELF_CARE').length;
  const farmWorkerCount = checkIns.filter((c) => c.context.isFarmWorker).length;
  const resolvedCount = checkIns.filter((c) => c.caregiverStatus === 'resolved').length;

  // Filtered checkins
  const filteredCheckIns = useMemo(() => {
    return checkIns.filter((item) => {
      // Filter by level/category
      if (filterLevel === 'URGENT_EMERGENCY' && item.triage.triageLevel !== 'URGENT_EMERGENCY') return false;
      if (filterLevel === 'MODERATE_FOLLOW_UP' && item.triage.triageLevel !== 'MODERATE_FOLLOW_UP') return false;
      if (filterLevel === 'MILD_SELF_CARE' && item.triage.triageLevel !== 'MILD_SELF_CARE') return false;
      if (filterLevel === 'FARM_WORKERS' && !item.context.isFarmWorker) return false;
      if (filterLevel === 'RESOLVED' && item.caregiverStatus !== 'resolved') return false;

      // Filter by farm zone
      if (selectedZone !== 'ALL' && item.patientLocation !== selectedZone) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.patientName.toLowerCase().includes(query);
        const matchesLocation = item.patientLocation.toLowerCase().includes(query);
        const matchesSymptoms = item.symptomDescription.toLowerCase().includes(query);
        const matchesFlags = item.triage.safetyFlags.some((f) => f.toLowerCase().includes(query));
        return matchesName || matchesLocation || matchesSymptoms || matchesFlags;
      }

      return true;
    });
  }, [checkIns, filterLevel, selectedZone, searchQuery]);

  // Unique zones
  const uniqueZones = useMemo(() => {
    const set = new Set(checkIns.map((c) => c.patientLocation));
    return Array.from(set);
  }, [checkIns]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Patient Name', 'Location', 'Timestamp', 'Triage Level', 'Pain Severity', 'Vitals', 'Safety Flags', 'Status'];
    const rows = filteredCheckIns.map((c) => [
      c.id,
      `"${c.patientName}"`,
      `"${c.patientLocation}"`,
      c.createdAt,
      c.triage.triageLevel,
      c.severity,
      `"Temp: ${c.vitals.temp || '-'}, BP: ${c.vitals.bp || '-'}"`,
      `"${c.triage.safetyFlags.join('; ')}"`,
      c.caregiverStatus,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `afyacheck_triage_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 w-fit px-3 py-1 rounded-md mb-1.5">
            <span>Caregiver & Health Worker Dashboard</span>
            <span>·</span>
            <span>Live Triage Roster</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Patient & Farm Worker Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review incoming symptom logs, evaluate predefined safety flags, and dispatch in-person clinic follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Roster CSV</span>
          </button>

          <button
            onClick={onOpenEmergency}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Emergency Dispatch</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Check-ins</span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
            {totalCount}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Active across all zones</span>
        </div>

        <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-800 font-medium">Urgent Red Flags</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-rose-700 mt-1 block tabular-nums">
            {urgentCount}
          </span>
          <span className="text-[11px] text-rose-600 mt-1 block">Immediate clinical action</span>
        </div>

        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-800 font-medium">Moderate Follow-up</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-700 mt-1 block tabular-nums">
            {moderateCount}
          </span>
          <span className="text-[11px] text-amber-600 mt-1 block">Visit within 24-48h</span>
        </div>

        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-800 font-medium">Mild Self-Care</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block tabular-nums">
            {mildCount}
          </span>
          <span className="text-[11px] text-emerald-600 mt-1 block">Home hydration & rest</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Farm Workers</span>
            <Trees className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
            {farmWorkerCount}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">{resolvedCount} cases resolved</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto text-xs no-scrollbar">
            <button
              onClick={() => setFilterLevel('ALL')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
                filterLevel === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalCount})
            </button>

            <button
              onClick={() => setFilterLevel('URGENT_EMERGENCY')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
                filterLevel === 'URGENT_EMERGENCY'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-100/50'
              }`}
            >
              Urgent ({urgentCount})
            </button>

            <button
              onClick={() => setFilterLevel('MODERATE_FOLLOW_UP')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
                filterLevel === 'MODERATE_FOLLOW_UP'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 hover:bg-amber-100/50'
              }`}
            >
              Moderate ({moderateCount})
            </button>

            <button
              onClick={() => setFilterLevel('MILD_SELF_CARE')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
                filterLevel === 'MILD_SELF_CARE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-100/50'
              }`}
            >
              Mild ({mildCount})
            </button>

            <button
              onClick={() => setFilterLevel('FARM_WORKERS')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
                filterLevel === 'FARM_WORKERS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Farm Workers ({farmWorkerCount})
            </button>
          </div>

          {/* Search box & zone dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, symptom, or flags..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
              />
            </div>

            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Zones</option>
              {uniqueZones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Patients High-Density Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Patient / Worker</th>
                <th className="py-3 px-4">Zone / Unit</th>
                <th className="py-3 px-4">Symptom Summary & Pain</th>
                <th className="py-3 px-4">Key Vitals</th>
                <th className="py-3 px-4">Safety Flags</th>
                <th className="py-3 px-4">Triage Priority</th>
                <th className="py-3 px-4">Caregiver Disposition</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCheckIns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No check-ins match the selected filter.</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting the search query or status filter.</p>
                  </td>
                </tr>
              ) : (
                filteredCheckIns.map((item) => {
                  const isUrgent = item.triage.triageLevel === 'URGENT_EMERGENCY';
                  const isModerate = item.triage.triageLevel === 'MODERATE_FOLLOW_UP';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isUrgent ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Patient Name & phone */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{item.patientName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.patientPhone || 'No direct phone'}
                        </div>
                      </td>

                      {/* Zone */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          {item.context.isFarmWorker && <Trees className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          <span className="truncate max-w-[140px]">{item.patientLocation}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Symptoms & Pain */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="line-clamp-2 text-slate-900 leading-snug">
                          {item.symptomDescription}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span>Duration: {item.duration}</span>
                          <span>·</span>
                          <span className="font-mono font-semibold text-slate-700">
                            Pain: {item.severity}/10
                          </span>
                        </div>
                      </td>

                      {/* Vitals */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                        <div>
                          Temp:{' '}
                          <span
                            className={
                              item.vitals.temp && parseFloat(item.vitals.temp) >= 38.0
                                ? 'text-rose-600 font-bold'
                                : 'text-slate-800'
                            }
                          >
                            {item.vitals.temp ? `${item.vitals.temp}°C` : '—'}
                          </span>
                        </div>
                        <div className="text-slate-500">
                          BP: {item.vitals.bp || '—'} · HR: {item.vitals.heartRate ? `${item.vitals.heartRate} bpm` : '—'}
                        </div>
                      </td>

                      {/* Safety Flags */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {item.triage.safetyFlags && item.triage.safetyFlags.length > 0 ? (
                          <div className="space-y-1">
                            {item.triage.safetyFlags.slice(0, 2).map((fl, idx) => (
                              <div
                                key={idx}
                                className="text-[11px] text-rose-700 leading-tight line-clamp-1"
                              >
                                ! {fl}
                              </div>
                            ))}
                            {item.triage.safetyFlags.length > 2 && (
                              <span className="text-[10px] text-slate-400">
                                +{item.triage.safetyFlags.length - 2} more flags
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Nominal</span>
                        )}
                      </td>

                      {/* Triage Priority Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                            isUrgent
                              ? 'bg-rose-100 text-rose-800'
                              : isModerate
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isUrgent && <AlertOctagon className="w-3.5 h-3.5" />}
                          {isModerate && <AlertTriangle className="w-3.5 h-3.5" />}
                          {!isUrgent && !isModerate && <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>{item.triage.triageLevel.replace('_', ' ')}</span>
                        </span>
                      </td>

                      {/* Caregiver Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-800 capitalize">
                          {item.caregiverStatus.replace('_', ' ')}
                        </span>
                        {item.reviewedBy && (
                          <div className="text-[10px] text-slate-400">
                            By {item.reviewedBy.split(' ')[0]}
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectCheckIn(item)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Caregiver Clinical Support Protocol Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span>Red Flag Escalation Standard</span>
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            For urgent cases (pesticide toxicity, acute chest distress, severe dehydration), verify immediate evacuation to the dispensary or sub-county hospital. Ensure contaminated clothes are decontaminated.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>24-Hour Follow-Up Cadence</span>
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Moderate cases (fever 38-39°C, localized punctures, farm worker fatigue) must receive a phone or in-person check-in within 24 hours to check wound healing and vital stabilization.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Community Reassurance & Education</span>
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Empower patients with verified home self-care, farm-grown botanical comfort (Moringa, ginger, mint), and clear guidance on exactly when to return if symptoms escalate.
          </p>
        </div>
      </div>
    </div>
  );
};
