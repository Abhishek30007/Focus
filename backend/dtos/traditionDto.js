class TraditionDTO {
  static toResponse(tradition) {
    return {
      id: tradition.id,
      name: tradition.name,
      sanskritName: tradition.sanskritName,
      philosophy: tradition.philosophy,
      neuroBenefit: tradition.neuroBenefit,
      defaultBreathRatios: tradition.defaultBreathRatios,
      stagesTemplate: tradition.stagesTemplate,
      recommendedDuration: tradition.recommendedDuration
    };
  }
}

module.exports = TraditionDTO;

