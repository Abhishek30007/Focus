const TraditionStrategy = require('./TraditionStrategy');

class YogaNidraStrategy extends TraditionStrategy {
  constructor() {
    super('yoga_nidra', 'Yoga Nidra Psychic Sleep', 'योग निद्रा');
  }

  getMetadata() {
    return {
      id: this.id,
      name: this.name,
      sanskritName: this.sanskritName,
      philosophy: 'The sublime borderland between waking and sleeping, accessing the causal body (Karana Sharira) for restorative healing.',
      neuroBenefit: 'Induces theta and delta brainwave coherence, facilitating neuroplasticity and cortisol clearance.',
      defaultBreathRatios: this.getDefaultBreathRatios(),
      stagesTemplate: this.getStagesTemplate(20),
      recommendedDuration: 20
    };
  }

  getDefaultBreathRatios() {
    return { inhale: 4, hold: 2, exhale: 6, postHold: 0 };
  }

  getStagesTemplate(durationMins = 20) {
    const totalSecs = durationMins * 60;
    return [
      { secondOffset: 0, cue: 'Recline into Shavasana. Surrender all muscular effort to gravity.', tone: 'grounding' },
      { secondOffset: 90, cue: 'State your Sankalpa (short positive resolve) with mental conviction.', tone: 'reflective' },
      { secondOffset: Math.floor(totalSecs * 0.25), cue: 'Rotate sensory awareness through the 61 Marma points starting at the brow.', tone: 'soothing' },
      { secondOffset: Math.floor(totalSecs * 0.6), cue: 'Evoke dual sensations: profound heaviness followed by weightless levity.', tone: 'soothing' },
      { secondOffset: Math.max(0, totalSecs - 30), cue: 'Slowly return to the physical plane, deeply replenished and whole.', tone: 'grounding' }
    ];
  }
}

module.exports = YogaNidraStrategy;

