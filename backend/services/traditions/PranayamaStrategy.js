const TraditionStrategy = require('./TraditionStrategy');

class PranayamaStrategy extends TraditionStrategy {
  constructor() {
    super('pranayama', 'Pranayama Breath Mastery', 'प्राणायाम');
  }

  getMetadata() {
    return {
      id: this.id,
      name: this.name,
      sanskritName: this.sanskritName,
      philosophy: 'Conscious expansion and regulation of Prana (vital life force) through energetic channels (Ida, Pingala, and Sushumna).',
      neuroBenefit: 'Regulates the autonomic nervous system via the vagus nerve, balancing sympathetic fight-or-flight with parasympathetic relaxation.',
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
      { secondOffset: 0, cue: 'Center yourself in Sukhasana. Establish smooth abdominal breathing.', tone: 'grounding' },
      { secondOffset: 60, cue: 'Initiate Nadi Shodhana alternate nostril pacing to harmonize cerebral hemispheres.', tone: 'instructional' },
      { secondOffset: Math.floor(totalSecs * 0.5), cue: 'Elongate the exhale phase to deepen acetylcholine release.', tone: 'soothing' },
      { secondOffset: Math.max(0, totalSecs - 30), cue: 'Release all control. Rest in spontaneous breath and pure stillness.', tone: 'reflective' }
    ];
  }
}

module.exports = PranayamaStrategy;

