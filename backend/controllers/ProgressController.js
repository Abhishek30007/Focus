const Progress = require('../models/Progress');

// Helper to get progress range
const getProgressForRange = async (userId, daysLimit) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (daysLimit - 1));

  // Find all progress entries in the date range
  const entries = await Progress.find({
    user: userId,
    date: { $gte: startDate, $lte: today }
  }).sort({ date: 1 });

  // Map entries into a complete list for the calendar days (filling in missing days with zeros)
  const entryMap = new Map();
  entries.forEach(e => {
    const dateStr = e.date.toISOString().split('T')[0];
    entryMap.set(dateStr, e);
  });

  const list = [];
  for (let i = daysLimit - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    if (entryMap.has(dateStr)) {
      const e = entryMap.get(dateStr);
      list.push({
        date: dateStr,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        focusMinutes: Math.round(e.focusMinutes),
        meditationMinutes: Math.round(e.meditationMinutes),
        completedSessions: e.completedSessions,
        focusScore: e.focusScore
      });
    } else {
      list.push({
        date: dateStr,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        focusMinutes: 0,
        meditationMinutes: 0,
        completedSessions: 0,
        focusScore: 0
      });
    }
  }

  return list;
};

// @desc    Get daily progress (today)
// @route   GET /api/progress/daily
// @access  Private
exports.getDailyProgress = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let progress = await Progress.findOne({ user: req.user.id, date: today });
    if (!progress) {
      progress = {
        focusMinutes: 0,
        meditationMinutes: 0,
        completedSessions: 0,
        focusScore: 0
      };
    }

    res.status(200).json({
      success: true,
      message: 'Daily progress retrieved',
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly progress (last 7 days)
// @route   GET /api/progress/weekly
// @access  Private
exports.getWeeklyProgress = async (req, res, next) => {
  try {
    const data = await getProgressForRange(req.user.id, 7);
    res.status(200).json({
      success: true,
      message: 'Weekly progress retrieved',
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly progress (last 30 days)
// @route   GET /api/progress/monthly
// @access  Private
exports.getMonthlyProgress = async (req, res, next) => {
  try {
    const data = await getProgressForRange(req.user.id, 30);
    res.status(200).json({
      success: true,
      message: 'Monthly progress retrieved',
      data
    });
  } catch (error) {
    next(error);
  }
};
