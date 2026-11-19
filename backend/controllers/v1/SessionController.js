const sessionService = require('../../services/sessionService');
const SessionDTO = require('../../dtos/sessionDto');

class SessionController {
  constructor(service = sessionService) {
    this.service = service;
  }

  generate = async (req, res, next) => {
    try {
      const { tradition, mood, stressLevel, targetDuration } = req.body;
      const script = await this.service.generateSession({
        tradition,
        mood,
        stressLevel,
        targetDuration
      });

      res.status(200).json({
        success: true,
        data: script
      });
    } catch (error) {
      next(error);
    }
  };

  start = async (req, res, next) => {
    try {
      const userId = req.user._id || req.user.id;
      const session = await this.service.startSession(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Session initiated successfully',
        data: SessionDTO.toDetail(session)
      });
    } catch (error) {
      next(error);
    }
  };

  complete = async (req, res, next) => {
    try {
      const userId = req.user._id || req.user.id;
      const sessionId = req.params.id;

      const completedSession = await this.service.completeSession(sessionId, userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Session completed and evaluated',
        data: SessionDTO.toDetail(completedSession)
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const userId = req.user._id || req.user.id;
      const { page = 1, limit = 10, tradition, completed } = req.query;

      const { items, total } = await this.service.getSessions(userId, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        tradition,
        completed
      });

      res.status(200).json({
        success: true,
        data: SessionDTO.toPaginatedList(items, {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total
        })
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const userId = req.user._id || req.user.id;
      const sessionId = req.params.id;

      const session = await this.service.getSessionById(sessionId, userId);

      res.status(200).json({
        success: true,
        data: SessionDTO.toDetail(session)
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new SessionController();

