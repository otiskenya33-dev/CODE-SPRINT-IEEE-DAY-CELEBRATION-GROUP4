import { TriageResult, VitalsData, FarmContextData } from '../types';

export function evaluateSymptomTriage(
  symptomText: string,
  duration: string,
  severity: number,
  vitals?: VitalsData,
  context?: FarmContextData,
  language: 'en' | 'sw' = 'en'
): TriageResult {
  const text = (symptomText || '').toLowerCase();
  const tempNum = vitals?.temp ? parseFloat(vitals.temp) : 0;
  const pulseNum = vitals?.heartRate ? parseInt(vitals.heartRate, 10) : 0;
  const spo2Num = vitals?.spO2 ? parseInt(vitals.spO2, 10) : 0;
  const painScore = Number(severity) || 5;

  // Extract BP numbers if provided (e.g. "160/100")
  let systolic = 0;
  let diastolic = 0;
  if (vitals?.bp && vitals.bp.includes('/')) {
    const parts = vitals.bp.split('/');
    systolic = parseInt(parts[0], 10) || 0;
    diastolic = parseInt(parts[1], 10) || 0;
  }

  // --- RED FLAG EMERGENCY CHECKS ---
  const emergencyKeywords = [
    'chest pain',
    'pressure in chest',
    'heart attack',
    'difficulty breathing',
    'shortness of breath',
    'cannot breathe',
    'choking',
    'unconscious',
    'passed out',
    'fainting',
    'slurred speech',
    'paralysis',
    'face drooping',
    'seizure',
    'convulsion',
    'coughing blood',
    'vomiting blood',
    'snake bite',
    'snakebite',
    'pesticide poisoning',
    'swallowed chemical',
    'chemical splash in eyes',
    'anaphylaxis',
    'severe allergic',
    'pinpoint pupils',
    'stiff neck with high fever',
    'severe chest tightness',
  ];

  const hasEmergencyKeyword = emergencyKeywords.some((kw) => text.includes(kw));
  const hasCriticalVitals =
    (tempNum > 0 && tempNum >= 39.5) ||
    (spo2Num > 0 && spo2Num <= 92) ||
    (systolic >= 170 || diastolic >= 105) ||
    (pulseNum >= 125);

  const hasSeverePain = painScore >= 8;

  // Farm-specific emergency check: Pesticide + cholinergic symptoms
  const hasAgrochemicalToxicity =
    context?.recentPesticideHandling &&
    (text.includes('dizzy') ||
      text.includes('sweat') ||
      text.includes('nausea') ||
      text.includes('vomit') ||
      text.includes('blurred') ||
      text.includes('salivat') ||
      text.includes('pupil') ||
      text.includes('tremor'));

  // Heat stroke check: high heat exposure + confusion or fever without sweat
  const hasHeatStrokeSigns =
    context?.dehydrationHeatRisk &&
    (text.includes('confus') || text.includes('faint') || text.includes('disorient') || tempNum >= 39.0);

  // If ANY severe red flag is present: URGENT_EMERGENCY
  if (hasEmergencyKeyword || hasCriticalVitals || hasAgrochemicalToxicity || hasHeatStrokeSigns || (hasSeverePain && painScore >= 9)) {
    const flags: string[] = [];
    if (hasEmergencyKeyword) {
      flags.push('Acute clinical warning signs (respiratory, cardiovascular, or neurological keywords detected).');
    }
    if (hasAgrochemicalToxicity) {
      flags.push('High alert: Possible acute organophosphate or agrochemical toxicity with systemic cholinergic features.');
    }
    if (hasHeatStrokeSigns) {
      flags.push('Severe heat illness warning: Risk of core hyperthermia / heat stroke requiring immediate cooling and IV hydration.');
    }
    if (tempNum >= 39.5) {
      flags.push(`Extreme hyperpyrexia (Body temp: ${tempNum}°C) exceeding safety thresholds.`);
    }
    if (spo2Num > 0 && spo2Num <= 92) {
      flags.push(`Oxygen saturation dangerously low (${spo2Num}%), indicating compromised respiratory reserve.`);
    }
    if (systolic >= 170 || diastolic >= 105) {
      flags.push(`Severe hypertensive reading (${vitals?.bp} mmHg) with organ risk.`);
    }
    if (painScore >= 8) {
      flags.push(`Severe self-reported pain intensity (${painScore}/10).`);
    }

    return {
      triageLevel: 'URGENT_EMERGENCY',
      primaryAssessment:
        language === 'sw'
          ? 'Dalili hizi zinaashiria hali ya dharura ya kiafya inayohitaji tathmini ya haraka hospitalini.'
          : 'The reported symptoms indicate a critical health warning sign that requires immediate medical evaluation and urgent caregiver dispatch.',
      safetyFlags: flags.length > 0 ? flags : ['Predefined safety threshold triggered.'],
      isEmergency: true,
      caregiverAlertNeeded: true,
      selfCareSteps: [
        'Halt all physical labor and farm work immediately; sit or lie down in shaded, quiet, and well-ventilated shelter.',
        context?.recentPesticideHandling
          ? 'If exposed to agrochemicals: Remove all contaminated clothes immediately and wash skin with copious water for 15+ minutes.'
          : 'Maintain open airways; loosen tight clothing around neck and waist.',
        'Do not give solid food or large amounts of liquid if the person is confused or gasping.',
        'Keep a designated caregiver, colleague, or family member at the bedside continuously.',
      ],
      farmsteadRemedies: [
        'Small sips of clean cool water only if fully alert and able to swallow safely.',
        'Apply cool wet cloths to the neck, armpits, and forehead if hyperthermic or overheated.',
      ],
      redFlagsToSeekCare: [
        'Loss of consciousness, delirium, or seizures',
        'Inability to speak in full sentences due to breathlessness',
        'Bluish discoloration of lips, fingernails, or tongue',
        'Severe chest crushing pain or cold clammy sweat',
      ],
      caregiverTriageNote: `URGENT RED FLAG: Patient reports "${symptomText}". Vitals: ${vitals?.temp || 'N/A'}°C, ${vitals?.bp || 'N/A'}, HR: ${vitals?.heartRate || 'N/A'} bpm. Immediate clinical evaluation or ambulance transfer advised.`,
      suggestedFollowUpHours: 0,
    };
  }

  // --- MODERATE FOLLOW-UP CHECKS ---
  const moderateKeywords = [
    'fever',
    'vomit',
    'diarrhea',
    'stomach ache',
    'abdominal pain',
    'wound',
    'puncture',
    'scratch',
    'animal bite',
    'sprain',
    'swollen joint',
    'cough',
    'burn',
    'rash',
    'dizziness',
    'burning urine',
    'migraine',
  ];

  const hasModerateKeyword = moderateKeywords.some((kw) => text.includes(kw));
  const hasModerateVitals =
    (tempNum >= 38.0 && tempNum < 39.5) ||
    (pulseNum >= 100 && pulseNum < 125) ||
    (systolic >= 140 && systolic < 170) ||
    (diastolic >= 90 && diastolic < 105);

  const isFarmAnimalScratch = context?.animalContact && (text.includes('scratch') || text.includes('bite') || text.includes('wound'));

  if (hasModerateKeyword || hasModerateVitals || isFarmAnimalScratch || painScore >= 5) {
    const flags: string[] = [];
    if (isFarmAnimalScratch) {
      flags.push('Animal contact wound: Tetanus immunization status and zoonotic pathogen exposure must be evaluated.');
    }
    if (tempNum >= 38.0) {
      flags.push(`Active fever detected (${tempNum}°C), suggestive of acute infection or inflammatory response.`);
    }
    if (context?.isFarmWorker) {
      flags.push('Occupational field duty: Recommended temporary light duties or sick leave pending clinical check.');
    }

    return {
      triageLevel: 'MODERATE_FOLLOW_UP',
      primaryAssessment:
        language === 'sw'
          ? 'Dalili zako zinaonyesha ugonjwa unaohitaji uchunguzi wa mhudumu wa afya au daktari wa zahanati ndani ya masaa 24.'
          : 'Your symptoms suggest an illness or localized injury that warrants direct evaluation by a community healthcare worker or dispensary nurse within 24 hours.',
      safetyFlags: flags.length > 0 ? flags : ['Moderate clinical concern requiring follow-up.'],
      isEmergency: false,
      caregiverAlertNeeded: true,
      selfCareSteps: [
        'Rest away from direct sunlight, heavy machinery, or strenuous farm tasks.',
        'Drink adequate clean boiled fluids (broths, electrolyte solution, or clean water).',
        'Record body temperature and symptoms every 4 to 6 hours in your companion log.',
        'Clean any minor skin wounds with clean boiled water and antiseptic soap; cover with clean gauze.',
      ],
      farmsteadRemedies: [
        'Fresh ginger (tangawizi) and lemon tea with a spoonful of honey for respiratory and gastric relief.',
        'Moringa leaf infusion to provide convalescent vitamins and natural antioxidant support.',
        'Farmstead ORS Solution (for diarrhea/vomiting): 1 liter clean boiled water + 6 level teaspoons sugar + 1/2 level teaspoon salt.',
      ],
      redFlagsToSeekCare: [
        'Fever exceeding 39°C or lasting longer than 48 hours without decrease',
        'Spreading redness, heat, or throbbing red lines extending from any wound',
        'Inability to drink or retain fluids for over 12 hours',
        'Development of severe lethargy, confusion, or stiff neck',
      ],
      caregiverTriageNote: `MODERATE: Patient reports ${symptomText}. Duration: ${duration}. Reported pain: ${painScore}/10. Follow-up visit or dispensary consultation recommended within 12-24 hours.`,
      suggestedFollowUpHours: 24,
    };
  }

  // --- MILD SELF-CARE CHECKS ---
  return {
    triageLevel: 'MILD_SELF_CARE',
    primaryAssessment:
      language === 'sw'
        ? 'Dalili zako ni ndogo na zinaweza kutibiwa kwa mapumziko, unywaji wa maji ya kutosha, na tiba asili za nyumbani.'
        : 'Your symptoms are mild and appear consistent with routine fatigue, mild dehydration, seasonal dust irritation, or minor muscle strain suitable for home self-care.',
    safetyFlags: ['No acute or pre-defined red-flag safety triggers identified at this time.'],
    isEmergency: false,
    caregiverAlertNeeded: false,
    selfCareSteps: [
      'Ensure 8 hours of restful sleep and avoid heavy lifting or prolonged midday heat.',
      'Maintain steady hydration by drinking at least 2.5 to 3 liters of clean water throughout the day.',
      'Practice gentle stretching for tension in back, neck, and shoulders from field duties.',
      'Eat light, nourishing meals rich in farm greens, whole grains, and warm soups.',
    ],
    farmsteadRemedies: [
      'Warm lemongrass (mchaichai) infusion or peppermint tea to soothe digestion and relax muscles.',
      'Topical fresh Aloe vera inner gel for minor dry skin, mild chafing, or sunburn.',
      'Warm salt water gargle (1/2 tsp salt in 1 cup warm water) for throat tickle.',
    ],
    redFlagsToSeekCare: [
      'Symptoms worsening or persisting for more than 3-4 days without relief',
      'Sudden onset of fever above 38.5°C, breathing difficulty, or severe sharp pain',
    ],
    caregiverTriageNote: `LOW / SELF-CARE: Baseline check-in logged for ${symptomText}. Mild discomfort managed with home hydration and rest. No active clinical alert dispatched.`,
    suggestedFollowUpHours: 48,
  };
}
