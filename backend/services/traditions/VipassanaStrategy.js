const TraditionStrategy = require('./TraditionStrategy');

class VipassanaStrategy extends TraditionStrategy {
  constructor() {
    super('vipassana', 'Vipassana Insight & Equanimity', 'विपश्यना');
  }

  getMetadata() {
    return {
      id: this.id,
      name: this.name,
      sanskritName: this.sanskritName,
      philosophy: 'Clear seeing and mindful discernment of phenomena as impermanent (Anicca), empty of ego (Anatta), and interconnected.',
      neuroBenefit: 'Downregulates default mode network (DMN) rumination and enhances anterior cingulate cortex self-regulation.',
      defaultBreathRatios: this.getDefaultBreathRatios(),
      stagesTemplate: this.getStagesTemplate(15),
      recommendedDuration: 15
    };
  }

  getDefaultBreathRatios() {
    return { inhale: 4, hold: 0, exhale: 4, postHold: 0 };
  }

  getStagesTemplate(durationMins = 15) {
    const totalSecs = durationMins * 60;
    return [
      { secondOffset: 0, cue: 'Take your seat. Fix pure non-judgmental attention on the touch of breath at the nostrils.', tone: 'instructional' },
      { secondOffset: 60, cue: 'Observe bodily sensations without craving or aversion. Everything that arises naturally passes.', tone: 'instructional' },
      { secondOffset: Math.floor(totalSecs * 0.4), cue: 'Systematically scan the physical body from vertex to toes with tranquil attention.', tone: 'reflective' },
      { secondOffset: Math.max(0, totalSecs - 45), cue: 'Expand boundless loving-kindness (Metta) to all sentient beings.', tone: 'grounding' }
    ];
  }
}

module.exports = VipassanaStrategy;

