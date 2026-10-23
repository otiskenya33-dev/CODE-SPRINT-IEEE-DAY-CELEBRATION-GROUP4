export type TriageLevel = 'MILD_SELF_CARE' | 'MODERATE_FOLLOW_UP' | 'URGENT_EMERGENCY';

export interface VitalsData {
  temp?: string;
  bp?: string;
  heartRate?: string;
  spO2?: string;
  bloodSugar?: string;
}

export interface FarmContextData {
  isFarmWorker: boolean;
  farmSection?: string;
  recentPesticideHandling: boolean;
  animalContact: boolean;
  dehydrationHeatRisk: boolean;
  ageGroup: 'Child (<12)' | 'Adolescent (13-17)' | 'Adult (18-64)' | 'Elderly (65+)';
  preExistingConditions?: string;
}

export interface TriageResult {
  triageLevel: TriageLevel;
  primaryAssessment: string;
  safetyFlags: string[];
  isEmergency: boolean;
  caregiverAlertNeeded: boolean;
  selfCareSteps: string[];
  farmsteadRemedies: string[];
  redFlagsToSeekCare: string[];
  caregiverTriageNote: string;
  suggestedFollowUpHours: number;
}

export type CaregiverStatus = 'pending_review' | 'under_review' | 'followup_scheduled' | 'resolved';

export interface PatientCheckIn {
  id: string;
  patientName: string;
  patientPhone?: string;
  patientLocation: string; // e.g. "Farm Greenhouse B", "Homestead Ward 4"
  createdAt: string; // ISO timestamp
  symptomDescription: string;
  duration: string;
  severity: number; // 1-10
  vitals: VitalsData;
  context: FarmContextData;
  triage: TriageResult;
  caregiverStatus: CaregiverStatus;
  caregiverNotes?: string[];
  reviewedBy?: string;
  reviewedAt?: string;
  language: 'en' | 'sw';
}

export interface MedicinalCrop {
  id: string;
  commonName: string;
  swahiliName: string;
  botanicalName: string;
  primaryUses: string[];
  farmCultivationZone: string;
  preparationMethod: string;
  safetyPrecautions: string;
  activeProperties: string;
  image?: string;
}

export interface FarmSafetyIncident {
  id: string;
  date: string;
  workerName: string;
  zone: string;
  type: 'Heat Stress' | 'Agrochemical Contact' | 'Livestock Injury' | 'Equipment Strain' | 'Minor Laceration';
  severity: 'Low' | 'Medium' | 'High';
  firstAidApplied: string;
  status: 'Open' | 'Resolved';
}
