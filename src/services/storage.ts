import { PatientCheckIn, CaregiverStatus, FarmSafetyIncident } from '../types';
import { INITIAL_CHECKINS, FARM_SAFETY_INCIDENTS } from '../data/mockData';

const STORAGE_KEY_CHECKINS = 'afyacheck_checkins_v1';
const STORAGE_KEY_INCIDENTS = 'afyacheck_farm_incidents_v1';

export function getStoredCheckIns(): PatientCheckIn[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHECKINS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(INITIAL_CHECKINS));
      return INITIAL_CHECKINS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading check-ins from storage:', e);
    return INITIAL_CHECKINS;
  }
}

export function saveCheckIn(checkIn: PatientCheckIn): PatientCheckIn[] {
  const current = getStoredCheckIns();
  const updated = [checkIn, ...current];
  try {
    localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving check-in:', e);
  }
  return updated;
}

export function updateCheckInStatus(
  id: string,
  newStatus: CaregiverStatus,
  reviewerName?: string,
  newNote?: string
): PatientCheckIn[] {
  const current = getStoredCheckIns();
  const updated = current.map((item) => {
    if (item.id === id) {
      const existingNotes = item.caregiverNotes || [];
      const updatedNotes = newNote ? [...existingNotes, newNote] : existingNotes;
      return {
        ...item,
        caregiverStatus: newStatus,
        reviewedBy: reviewerName || item.reviewedBy || 'Caregiver Duty Officer',
        reviewedAt: new Date().toISOString(),
        caregiverNotes: updatedNotes,
      };
    }
    return item;
  });

  try {
    localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error updating check-in:', e);
  }
  return updated;
}

export function getStoredFarmIncidents(): FarmSafetyIncident[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INCIDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(FARM_SAFETY_INCIDENTS));
      return FARM_SAFETY_INCIDENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading farm incidents:', e);
    return FARM_SAFETY_INCIDENTS;
  }
}

export function addFarmIncident(incident: FarmSafetyIncident): FarmSafetyIncident[] {
  const current = getStoredFarmIncidents();
  const updated = [incident, ...current];
  try {
    localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving incident:', e);
  }
  return updated;
}
