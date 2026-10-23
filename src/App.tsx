/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MedicalDisclaimer } from './components/MedicalDisclaimer';
import { SymptomCheckView } from './components/SymptomCheckView';
import { CaregiverDashboardView } from './components/CaregiverDashboardView';
import { IntegratedFarmHubView } from './components/IntegratedFarmHubView';
import { MedicinalGardenView } from './components/MedicinalGardenView';
import { SafetyProtocolsView } from './components/SafetyProtocolsView';
import { CheckInDetailModal } from './components/CheckInDetailModal';
import { EmergencyModal } from './components/EmergencyModal';
import { PatientCheckIn, CaregiverStatus } from './types';
import { getStoredCheckIns, updateCheckInStatus, saveCheckIn } from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'symptom-check' | 'caregiver-dashboard' | 'integrated-farm' | 'medicinal-garden' | 'safety-protocols'
  >('symptom-check');

  const [checkIns, setCheckIns] = useState<PatientCheckIn[]>([]);
  const [selectedCheckIn, setSelectedCheckIn] = useState<PatientCheckIn | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);

  // Load stored check-ins on mount
  useEffect(() => {
    const data = getStoredCheckIns();
    setCheckIns(data);
  }, []);

  const urgentCount = checkIns.filter((c) => c.triage.triageLevel === 'URGENT_EMERGENCY').length;

  const handleCheckInCompleted = (newCheckIn: PatientCheckIn) => {
    setCheckIns((prev) => [newCheckIn, ...prev.filter((c) => c.id !== newCheckIn.id)]);
    if (newCheckIn.triage.triageLevel === 'URGENT_EMERGENCY') {
      setBannerAlert(`Urgent Alert: ${newCheckIn.patientName} triggered predefined safety checks. Logged on Caregiver Dashboard.`);
      setTimeout(() => setBannerAlert(null), 6000);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: CaregiverStatus, note?: string) => {
    const updated = updateCheckInStatus(id, newStatus, 'Caregiver Officer', note);
    setCheckIns(updated);
    if (selectedCheckIn && selectedCheckIn.id === id) {
      const currentUpdated = updated.find((c) => c.id === id);
      if (currentUpdated) setSelectedCheckIn(currentUpdated);
    }
  };

  const handleDispatchCaregiverAlert = (details: { callerName: string; location: string; situation: string }) => {
    const newEmergencyCheckIn: PatientCheckIn = {
      id: `sos-${Date.now().toString().slice(-4)}`,
      patientName: details.callerName,
      patientLocation: details.location,
      createdAt: new Date().toISOString(),
      symptomDescription: `EMERGENCY SOS DISPATCH: ${details.situation}`,
      duration: 'Immediate',
      severity: 10,
      vitals: {},
      context: {
        isFarmWorker: true,
        farmSection: details.location,
        recentPesticideHandling: details.situation.toLowerCase().includes('pesticide'),
        animalContact: details.situation.toLowerCase().includes('snake') || details.situation.toLowerCase().includes('animal'),
        dehydrationHeatRisk: details.situation.toLowerCase().includes('heat'),
        ageGroup: 'Adult (18-64)',
      },
      triage: {
        triageLevel: 'URGENT_EMERGENCY',
        primaryAssessment: `Direct emergency broadcast triggered for ${details.situation}. Immediate clinical response required.`,
        safetyFlags: [
          'High-priority emergency SOS broadcast received directly from user.',
          details.situation,
        ],
        isEmergency: true,
        caregiverAlertNeeded: true,
        selfCareSteps: [
          'Ensure scene safety before assisting.',
          'Keep patient still, warm, and conscious.',
          'Verify emergency dispatcher has received exact farm sector coordinates.',
        ],
        farmsteadRemedies: ['Clean water sips if conscious.'],
        redFlagsToSeekCare: ['Immediate clinic transport in progress.'],
        caregiverTriageNote: `URGENT RED FLAG: Emergency broadcast initiated at ${details.location} by ${details.callerName}. Situation: ${details.situation}.`,
        suggestedFollowUpHours: 0,
      },
      caregiverStatus: 'under_review',
      caregiverNotes: [`Emergency SOS broadcast triggered at ${new Date().toLocaleTimeString()}`],
      language: 'en',
    };

    saveCheckIn(newEmergencyCheckIn);
    setCheckIns((prev) => [newEmergencyCheckIn, ...prev]);
    setActiveTab('caregiver-dashboard');
  };

  const handleSimulateEmergency = (type: string) => {
    let name = 'Worker John K.';
    let desc = 'Chemical splash in face and severe eye burning during tomato spraying';
    let flags = ['Severe chemical eye burns and systemic absorption risk.'];
    let location = 'Farm Greenhouse Sector 1';

    if (type === 'chest_pain') {
      name = 'David Omondi';
      desc = 'Sudden intense squeezing chest pressure radiating to left shoulder and jaw with cold sweat';
      flags = ['Acute myocardial ischemia warning signs with radiating pain and diaphoresis.'];
      location = 'Open Maize Field West';
    } else if (type === 'neurological') {
      name = 'Agnes Wanjiku';
      desc = 'Sudden left side arm weakness and slurred speech during lunch break';
      flags = ['Acute neurological deficit (F.A.S.T.) suggestive of cerebrovascular event.'];
      location = 'Farm Homestead Ward 2';
    } else if (type === 'snakebite') {
      name = 'Peter Kipruto';
      desc = 'Puncture bite on ankle while clearing irrigation canal near pond with local swelling';
      flags = ['Venomous snakebite risk requiring immediate limb immobilization and antivenom triage.'];
      location = 'Irrigation Canal & Pond';
    } else if (type === 'heat_stroke') {
      name = 'Erick Mutua';
      desc = 'Collapse with hot dry skin, body temperature 40.2C, and confusion in midday heat';
      flags = ['Life-threatening core hyperthermia / heat stroke with altered consciousness.'];
      location = 'Maize Harvesting Tractors';
    } else if (type === 'pediatric') {
      name = 'Baby Faith (14 months)';
      desc = 'Sunken fontanelle, dry tongue, no tears, lethargic after 8 hours of watery diarrhea';
      flags = ['Severe pediatric dehydration with hemodynamic decompensation risk.'];
      location = 'Farm Homestead Ward 1';
    }

    const simCheckIn: PatientCheckIn = {
      id: `sim-${Date.now().toString().slice(-4)}`,
      patientName: name,
      patientLocation: location,
      createdAt: new Date().toISOString(),
      symptomDescription: desc,
      duration: '< 1 hour',
      severity: 9,
      vitals: { temp: type === 'heat_stroke' ? '40.2' : '37.6' },
      context: {
        isFarmWorker: true,
        farmSection: location,
        recentPesticideHandling: type === 'pesticide',
        animalContact: type === 'snakebite',
        dehydrationHeatRisk: type === 'heat_stroke',
        ageGroup: type === 'pediatric' ? 'Child (<12)' : 'Adult (18-64)',
      },
      triage: {
        triageLevel: 'URGENT_EMERGENCY',
        primaryAssessment: `Simulated clinical emergency: ${desc}. Safety thresholds triggered.`,
        safetyFlags: flags,
        isEmergency: true,
        caregiverAlertNeeded: true,
        selfCareSteps: [
          'Cease all activity immediately.',
          'Provide initial stabilization per emergency first-aid protocols.',
          'Do not leave patient unattended.',
        ],
        farmsteadRemedies: ['Clean water or cooling compress as appropriate.'],
        redFlagsToSeekCare: ['Immediate hospital evacuation required.'],
        caregiverTriageNote: `URGENT SAFETY TRIGGER: ${name} at ${location}. Red flag: ${flags[0]}`,
        suggestedFollowUpHours: 0,
      },
      caregiverStatus: 'under_review',
      caregiverNotes: [`Simulated emergency safety trigger activated at ${new Date().toLocaleTimeString()}`],
      language: 'en',
    };

    saveCheckIn(simCheckIn);
    setCheckIns((prev) => [simCheckIn, ...prev]);
    setSelectedCheckIn(simCheckIn);
    setActiveTab('caregiver-dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        urgentCount={urgentCount}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onStartNewCheckIn={() => {
          setActiveTab('symptom-check');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Clinical Medical Safety Notice Strip */}
      <MedicalDisclaimer />

      {/* High-priority Banner Notification */}
      {bannerAlert && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
            <span>{bannerAlert}</span>
            <button
              onClick={() => setActiveTab('caregiver-dashboard')}
              className="ml-4 underline hover:text-rose-100"
            >
              View Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'symptom-check' && (
          <SymptomCheckView
            onCheckInCompleted={handleCheckInCompleted}
            onOpenEmergency={() => setIsEmergencyModalOpen(true)}
            onNavigateToCaregiver={() => setActiveTab('caregiver-dashboard')}
            onNavigateToFarm={() => setActiveTab('integrated-farm')}
          />
        )}

        {activeTab === 'caregiver-dashboard' && (
          <CaregiverDashboardView
            checkIns={checkIns}
            onSelectCheckIn={(checkIn) => setSelectedCheckIn(checkIn)}
            onOpenEmergency={() => setIsEmergencyModalOpen(true)}
          />
        )}

        {activeTab === 'integrated-farm' && (
          <IntegratedFarmHubView
            onStartFarmCheckIn={(zoneName) => {
              setActiveTab('symptom-check');
            }}
            onNavigateToBotanicals={() => setActiveTab('medicinal-garden')}
          />
        )}

        {activeTab === 'medicinal-garden' && <MedicinalGardenView />}

        {activeTab === 'safety-protocols' && (
          <SafetyProtocolsView
            onOpenEmergency={() => setIsEmergencyModalOpen(true)}
            onSimulateEmergency={handleSimulateEmergency}
          />
        )}
      </main>

      {/* Caregiver Check-in Detailed Modal */}
      <CheckInDetailModal
        checkIn={selectedCheckIn}
        onClose={() => setSelectedCheckIn(null)}
        onUpdateStatus={handleUpdateStatus}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
      />

      {/* Emergency SOS Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onDispatchCaregiverAlert={handleDispatchCaregiverAlert}
      />

      {/* Restrained Anti-Slop Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">AfyaCheck AI</span>
            <span>·</span>
            <span>Integrated Farm Health & Caregiver Companion</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('safety-protocols')}
              className="hover:text-slate-900 transition-colors"
            >
              Predefined Safety Rules
            </button>
            <button
              onClick={() => setActiveTab('medicinal-garden')}
              className="hover:text-slate-900 transition-colors"
            >
              Botanical Dispensary
            </button>
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="hover:text-rose-600 transition-colors font-medium"
            >
              Emergency SOS (999/911)
            </button>
          </div>

          <p className="text-slate-400">
            For clinical decision support & community wellness.
          </p>
        </div>
      </footer>
    </div>
  );
}
