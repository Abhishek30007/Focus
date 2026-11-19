const traditionContext = require('../../services/traditions/TraditionContext');
const TraditionDTO = require('../../dtos/traditionDto');

class TraditionController {
  constructor(context = traditionContext) {
    this.context = context;
  }

  getAll = async (req, res, next) => {
    try {
      const traditions = this.context.getAllTraditions();
      res.status(200).json({
        success: true,
        data: traditions.map(TraditionDTO.toResponse)
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const strategy = this.context.getStrategy(req.params.id);
      res.status(200).json({
        success: true,
        data: TraditionDTO.toResponse(strategy.getMetadata())
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new TraditionController();

