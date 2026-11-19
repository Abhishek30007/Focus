const sessionRepository = require('../repositories/sessionRepository');
const geminiService = require('./geminiService');
const traditionContext = require('./traditions/TraditionContext');

class SessionService {
  constructor(sessionRepo = sessionRepository, aiService = geminiService, traditions = traditionContext) {
    this.sessionRepo = sessionRepo;
    this.aiService = aiService;
    this.traditions = traditions;
  }

  async generateSession({ tradition = 'pranayama', mood = 'Neutral', stressLevel = 5, targetDuration = 10 }) {
    const strategy = this.traditions.getStrategy(tradition);
    const aiScript = await this.aiService.generatePersonalizedSession({
      tradition: strategy.id,
      mood,
      stressLevel,
      targetDuration
    });

    return {
      tradition: strategy.id,
      traditionMetadata: strategy.getMetadata(),
      title: aiScript.title,
      targetDuration,
      breathRatios: aiScript.breathRatios || strategy.getDefaultBreathRatios(),
      stages: aiScript.stages && aiScript.stages.length > 0 ? aiScript.stages : strategy.getStagesTemplate(targetDuration)
    };
  }

  async startSession(userId, {
    title,
    tradition = 'pranayama',
    category = 'Meditation',
    duration = 10,
    baselineHeartRate = null,
    baselineHrv = null,
    baselineCalmScore = 5,
    moodBefore = '',
    breathRatios,
    stages
  }) {
    const strategy = this.traditions.getStrategy(tradition);

    const sessionData = {
      user: userId,
      userId,
      title: title || `${strategy.name} Session`,
      tradition: strategy.id,
      category,
      duration,
      durationCompleted: 0,
      completed: false,
      startTime: new Date(),
      baselineHeartRate: baselineHeartRate ? Number(baselineHeartRate) : null,
      baselineHrv: baselineHrv ? Number(baselineHrv) : null,
      baselineCalmScore: baselineCalmScore ? Number(baselineCalmScore) : 5,
      moodBefore: moodBefore || '',
      breathRatios: breathRatios || strategy.getDefaultBreathRatios(),
      stages: stages || strategy.getStagesTemplate(duration)
    };

    return this.sessionRepo.create(sessionData);
  }

  async completeSession(sessionId, userId, {
    durationCompleted,
    exitHeartRate = null,
    exitHrv = null,
    exitCalmScore = 5,
    moodAfter = '',
    notes = '',
    breathSyncScore = 85
  }) {
    const existing = await this.sessionRepo.findUserSessionById(sessionId, userId);
    if (!existing) {
      const error = new Error('Session not found or unauthorized');
      error.statusCode = 404;
      error.code = 'SESSION_NOT_FOUND';
      throw error;
    }

    const baselineHr = existing.baselineHeartRate || (exitHeartRate ? exitHeartRate + 5 : 72);
    const resolvedExitHr = exitHeartRate ? Number(exitHeartRate) : baselineHr - 4;
    const hrDelta = resolvedExitHr - baselineHr;

    const baselineHrvVal = existing.baselineHrv || 45;
    const resolvedExitHrv = exitHrv ? Number(exitHrv) : baselineHrvVal + 10;
    const hrvDelta = resolvedExitHrv - baselineHrvVal;

    const baselineCalm = existing.baselineCalmScore || 5;
    const resolvedExitCalm = exitCalmScore ? Number(exitCalmScore) : 8;
    const calmDelta = resolvedExitCalm - baselineCalm;

    // Generate clinical yet compassionate summary via Gemini
    const summary = await this.aiService.generatePostSessionSummary({
      preCalmScore: baselineCalm,
      postCalmScore: resolvedExitCalm,
      avgHeartRateDelta: hrDelta,
      hrvDelta,
      breathSyncScore: Number(breathSyncScore) || 85
    });

    const updatePayload = {
      completed: true,
      endTime: new Date(),
      durationCompleted: typeof durationCompleted === 'number' ? durationCompleted : existing.duration * 60,
      exitHeartRate: resolvedExitHr,
      exitHrv: resolvedExitHrv,
      exitCalmScore: resolvedExitCalm,
      moodAfter: moodAfter || existing.moodAfter || '',
      notes: notes || existing.notes || '',
      heartRateDelta: hrDelta,
      hrvDelta,
      calmDelta,
      breathSyncScore: Number(breathSyncScore) || 85,
      summary
    };

    return this.sessionRepo.updateById(sessionId, updatePayload);
  }

  async getSessions(userId, { page = 1, limit = 10, tradition, completed }) {
    return this.sessionRepo.findPaginated(userId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      tradition,
      completed: completed === 'true' ? true : completed === 'false' ? false : undefined
    });
  }

  async getSessionById(sessionId, userId) {
    const session = await this.sessionRepo.findUserSessionById(sessionId, userId);
    if (!session) {
      const error = new Error('Session not found');
      error.statusCode = 404;
      error.code = 'SESSION_NOT_FOUND';
      throw error;
    }
    return session;
  }
}

module.exports = new SessionService();

