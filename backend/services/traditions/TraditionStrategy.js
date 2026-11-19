/**
 * Base abstract strategy for Vedic traditions
 */
class TraditionStrategy {
  constructor(id, name, sanskritName) {
    if (this.constructor === TraditionStrategy) {
      throw new Error('Abstract class TraditionStrategy cannot be instantiated directly.');
    }
    this.id = id;
    this.name = name;
    this.sanskritName = sanskritName;
  }

  getMetadata() {
    throw new Error('Method getMetadata() must be implemented by concrete strategy.');
  }

  getDefaultBreathRatios() {
    throw new Error('Method getDefaultBreathRatios() must be implemented by concrete strategy.');
  }

  getStagesTemplate(durationMins) {
    throw new Error('Method getStagesTemplate() must be implemented by concrete strategy.');
  }
}

module.exports = TraditionStrategy;

