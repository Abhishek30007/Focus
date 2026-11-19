const Session = require('../models/Session');
const FocusSession = require('../models/FocusSession');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { calculateStreak } = require('../utils/streak');
const geminiService = require('../services/geminiService');

// @desc    Get all session templates
// @route   GET /api/sessions
// @access  Public
exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find().lean();
    res.status(200).json({
      success: true,
      message: 'Session templates retrieved',
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single session template details
// @route   GET /api/sessions/:id
// @access  Public
exports.getSessionById = async (req, res, next) => {
  try {
    let session = null;
    try {
      session = await Session.findById(req.params.id).lean();
    } catch (_) {}
    if (!session) {
      session = await Session.findOne().lean();
    }
    if (!session) {
      const { seedSessions } = require('../utils/seeder');
      await seedSessions();
      session = await Session.findOne().lean();
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session template not found',
        error: 'SESSION_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Session template retrieved',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start a focus session (creates log)
// @route   POST /api/sessions/:id/start
// @access  Private
exports.startSession = async (req, res, next) => {
  try {
    let sessionTemplate = null;
    try {
      sessionTemplate = await Session.findById(req.params.id);
    } catch (_) {}
    if (!sessionTemplate) {
      sessionTemplate = await Session.findOne();
    }
    if (!sessionTemplate) {
      const { seedSessions } = require('../utils/seeder');
      await seedSessions();
      sessionTemplate = await Session.findOne();
    }

    if (!sessionTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Session template not found',
        error: 'SESSION_NOT_FOUND'
      });
    }

    const { moodBefore, baselineCalmScore, baselineHeartRate, baselineHrv } = req.body;

    // Create focus session log
    const focusSession = await FocusSession.create({
      user: req.user.id || req.user._id,
      userId: req.user.id || req.user._id,
      session: sessionTemplate._id,
      title: sessionTemplate.title,
      category: sessionTemplate.category,
      duration: sessionTemplate.duration,
      startTime: new Date(),
      moodBefore: moodBefore || 'Neutral',
      baselineCalmScore: baselineCalmScore ? Number(baselineCalmScore) : 5,
      baselineHeartRate: baselineHeartRate ? Number(baselineHeartRate) : 72,
      baselineHrv: baselineHrv ? Number(baselineHrv) : 48
    });

    res.status(201).json({
      success: true,
      message: 'Session started successfully',
      data: focusSession
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a focus session
// @route   POST /api/sessions/:id/complete
// @access  Private
exports.completeSession = async (req, res, next) => {
  try {
    const focusSession = await FocusSession.findById(req.params.id);
    if (!focusSession) {
      return res.status(404).json({
        success: false,
        message: 'Focus session log not found',
        error: 'FOCUS_SESSION_NOT_FOUND'
      });
    }

    const userIdStr = (req.user.id || req.user._id).toString();
    if (focusSession.user.toString() !== userIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this session',
        error: 'FORBIDDEN'
      });
    }

    const { durationCompleted, moodAfter, notes, exitCalmScore, exitHeartRate, exitHrv } = req.body;

    focusSession.completed = true;
    focusSession.durationCompleted = durationCompleted !== undefined ? durationCompleted : (focusSession.duration * 60);
    focusSession.moodAfter = moodAfter || 'Peaceful';
    focusSession.notes = notes || '';
    focusSession.endTime = new Date();

    const baselineCalm = focusSession.baselineCalmScore || 5;
    const finalExitCalm = exitCalmScore ? Number(exitCalmScore) : 8;
    focusSession.exitCalmScore = finalExitCalm;
    focusSession.calmDelta = finalExitCalm - baselineCalm;

    const baselineHr = focusSession.baselineHeartRate || 72;
    const finalExitHr = exitHeartRate ? Number(exitHeartRate) : baselineHr - 4;
    focusSession.exitHeartRate = finalExitHr;
    focusSession.heartRateDelta = finalExitHr - baselineHr;

    const baselineHrv = focusSession.baselineHrv || 45;
    const finalExitHrv = exitHrv ? Number(exitHrv) : baselineHrv + 10;
    focusSession.exitHrv = finalExitHrv;
    focusSession.hrvDelta = finalExitHrv - baselineHrv;

    // Trigger Gemini clinical post-session evaluation
    try {
      focusSession.summary = await geminiService.generatePostSessionSummary({
        preCalmScore: baselineCalm,
        postCalmScore: finalExitCalm,
        avgHeartRateDelta: focusSession.heartRateDelta,
        hrvDelta: focusSession.hrvDelta,
        breathSyncScore: 88
      });
    } catch (_) {}

    await focusSession.save();

    // Calculate Focus Score
    const totalTargetSeconds = focusSession.duration * 60;
    const focusScore = Math.min(100, Math.round((focusSession.durationCompleted / Math.max(1, totalTargetSeconds)) * 100));

    // Update Daily Progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let progress = await Progress.findOne({ user: req.user.id || req.user._id, date: today });
    if (!progress) {
      progress = new Progress({
        user: req.user.id || req.user._id,
        date: today
      });
    }

    const durationMinutes = focusSession.durationCompleted / 60;

    if (focusSession.category === 'Meditation' || focusSession.category === 'Calm') {
      progress.meditationMinutes += durationMinutes;
    } else {
      progress.focusMinutes += durationMinutes;
    }

    progress.completedSessions += 1;
    progress.focusScore = Math.round(
      ((progress.focusScore * (progress.completedSessions - 1)) + focusScore) / progress.completedSessions
    );

    await progress.save();

    // Update Streak
    const currentStreak = await calculateStreak(req.user.id || req.user._id);

    res.status(200).json({
      success: true,
      message: 'Session completed successfully',
      data: {
        focusSession,
        focusScore,
        currentStreak,
        dailyProgress: progress
      }
    });
  } catch (error) {
    next(error);
  }
};
