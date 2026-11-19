const FocusSession = require('../models/FocusSession');
const Progress = require('../models/Progress');
const Session = require('../models/Session');
const User = require('../models/User');
const { calculateStreak } = require('../utils/streak');

// @desc    Get dashboard metrics summary
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Get today's progress
    const todayProgress = await Progress.findOne({ user: userId, date: today });
    const todayScore = todayProgress ? todayProgress.focusScore : 0;
    const todayFocusMin = todayProgress ? todayProgress.focusMinutes : 0;
    const todayMeditationMin = todayProgress ? todayProgress.meditationMinutes : 0;

    // 2. Get current streak
    const currentStreak = await calculateStreak(userId);

    // 3. Get lifetime metrics
    const sessions = await FocusSession.find({ user: userId, completed: true });
    
    let totalFocusMinutes = 0;
    let totalMeditationMinutes = 0;
    
    sessions.forEach(s => {
      const mins = (s.durationCompleted || 0) / 60;
      if (s.category === 'Meditation' || s.category === 'Calm') {
        totalMeditationMinutes += mins;
      } else {
        totalFocusMinutes += mins;
      }
    });

    const completedCount = sessions.length;

    // 4. Get weekly trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      const prog = await Progress.findOne({ user: userId, date: d });
      weeklyTrend.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        rawDate: d.toISOString().split('T')[0],
        focusMinutes: prog ? Math.round(prog.focusMinutes) : 0,
        meditationMinutes: prog ? Math.round(prog.meditationMinutes) : 0,
        focusScore: prog ? prog.focusScore : 0
      });
    }

    // 5. Get recommended session (based on user's preferred duration, or default)
    const user = await User.findById(userId);
    const prefDuration = user.preferredFocusDuration || 25;
    
    const { seedSessions } = require('../utils/seeder');
    let templates = await Session.find();
    if (templates.length === 0) {
      await seedSessions();
      templates = await Session.find();
    }
    let recommendedSession = null;
    if (templates.length > 0) {
      recommendedSession = templates.reduce((prev, curr) => {
        return Math.abs(curr.duration - prefDuration) < Math.abs(prev.duration - prefDuration) ? curr : prev;
      });
    }

    // 6. Get recent sessions (last 5)
    const recentSessions = await FocusSession.find({ user: userId })
      .sort({ startTime: -1 })
      .limit(5)
      .populate('session');

    res.status(200).json({
      success: true,
      message: 'Dashboard stats loaded',
      data: {
        today: {
          focusScore: todayScore,
          focusMinutes: Math.round(todayFocusMin * 10) / 10,
          meditationMinutes: Math.round(todayMeditationMin * 10) / 10,
          completedSessions: todayProgress ? todayProgress.completedSessions : 0
        },
        streak: currentStreak,
        lifetime: {
          focusMinutes: Math.round(totalFocusMinutes),
          meditationMinutes: Math.round(totalMeditationMinutes),
          completedSessions: completedCount
        },
        weeklyTrend,
        recommendedSession,
        recentSessions
      }
    });
  } catch (error) {
    next(error);
  }
};
