const metricsService = require('../../services/metricsService');
const geminiService = require('../../services/geminiService');
const MetricsDTO = require('../../dtos/metricsDto');

class MetricsController {
  constructor(service = metricsService, aiService = geminiService) {
    this.service = service;
    this.aiService = aiService;
  }

  getTrends = async (req, res, next) => {
    try {
      const userId = req.user._id || req.user.id;
      const { period = 'weekly' } = req.query;

      const rawTrends = await this.service.getTrends(userId, period);

      res.status(200).json({
        success: true,
        data: MetricsDTO.toTrends(rawTrends)
      });
    } catch (error) {
      next(error);
    }
  };

  getPacer = async (req, res, next) => {
    try {
      const { heartRate, hrv, targetState } = req.body;
      const pacer = await this.aiService.generateBreathworkPacer({
        heartRate,
        hrv,
        targetState
      });

      res.status(200).json({
        success: true,
        data: pacer
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new MetricsController();

