export interface BreathRatios {
  inhale: number;
  hold: number;
  exhale: number;
  postHold: number;
}

export interface SessionStage {
  secondOffset: number;
  cue: string;
  tone: 'grounding' | 'instructional' | 'soothing' | 'reflective';
}

export interface PersonalizedSessionParams {
  tradition: 'pranayama' | 'yoga_nidra' | 'vipassana' | 'trataka';
  mood?: string;
  stressLevel?: number;
  targetDuration?: number;
}

export interface PersonalizedSessionResult {
  title: string;
  breathRatios: BreathRatios;
  stages: SessionStage[];
}

export interface BreathworkPacerParams {
  heartRate: number;
  hrv: number;
  targetState?: 'parasympathetic_activation' | 'focus_enhancement' | 'vagal_homeostasis';
}

export interface BreathworkPacerResult {
  targetState: string;
  targetBreathsPerMin: number;
  breathRatios: BreathRatios;
  vagalToneIndex: string;
  instructions: string;
}

export interface PostSessionSummaryParams {
  preCalmScore: number;
  postCalmScore: number;
  avgHeartRateDelta: number;
  hrvDelta: number;
  breathSyncScore: number;
}

// Re-export JavaScript implementation
const geminiService = require('./geminiService');
export default geminiService;

