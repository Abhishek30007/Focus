const TraditionStrategy = require('./TraditionStrategy');

class TratakaStrategy extends TraditionStrategy {
  constructor() {
    super('trataka', 'Trataka Fixed-Gaze Concentration', 'त्राटक');
  }

  getMetadata() {
    return {
      id: this.id,
      name: this.name,
      sanskritName: this.sanskritName,
      philosophy: 'Single-pointed optical stillness (Ekagrata) cleansing the third-eye chakra (Ajna) and quieting wandering thoughts.',
      neuroBenefit: 'Calms saccadic eye jitter, activating gamma wave synchrony and heightened attentional endurance.',
      defaultBreathRatios: this.getDefaultBreathRatios(),
      stagesTemplate: this.getStagesTemplate(10),
      recommendedDuration: 10
    };
  }

  getDefaultBreathRatios() {
    return { inhale: 4, hold: 4, exhale: 4, postHold: 2 };
  }

  getStagesTemplate(durationMins = 10) {
    const totalSecs = durationMins * 60;
    return [
      { secondOffset: 0, cue: 'Fix your steady gaze at eye level on the target point without blinking.', tone: 'instructional' },
      { secondOffset: 90, cue: 'Dissolve peripheral distractions. Merge attention into the central bindu.', tone: 'instructional' },
      { secondOffset: Math.floor(totalSecs * 0.5), cue: 'Close your eyes. Maintain the luminous mental afterimage at the eyebrow center.', tone: 'reflective' },
      { secondOffset: Math.max(0, totalSecs - 30), cue: 'Warm your palms together, gently cup closed eyes, and rest in internal silence.', tone: 'soothing' }
    ];
  }
}

module.exports = TratakaStrategy;

