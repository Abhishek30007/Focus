const PranayamaStrategy = require('./PranayamaStrategy');
const VipassanaStrategy = require('./VipassanaStrategy');
const YogaNidraStrategy = require('./YogaNidraStrategy');
const TratakaStrategy = require('./TratakaStrategy');

class TraditionContext {
  constructor() {
    this.strategies = new Map();
    this.register(new PranayamaStrategy());
    this.register(new VipassanaStrategy());
    this.register(new YogaNidraStrategy());
    this.register(new TratakaStrategy());
  }

  register(strategy) {
    this.strategies.set(strategy.id.toLowerCase(), strategy);
  }

  getStrategy(traditionId) {
    const key = (traditionId || 'pranayama').toLowerCase();
    const strategy = this.strategies.get(key);
    if (!strategy) {
      return this.strategies.get('pranayama');
    }
    return strategy;
  }

  getAllTraditions() {
    return Array.from(this.strategies.values()).map(strategy => strategy.getMetadata());
  }
}

module.exports = new TraditionContext();

