const FocusSession = require('../models/FocusSession');

const calculateStreak = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Find all completed focus sessions for the user sorted by startTime descending
    const sessions = await FocusSession.find({
      user: userId,
      completed: true
    }).sort({ startTime: -1 });

    if (sessions.length === 0) {
      return 0;
    }

    // Get unique days user completed sessions
    const uniqueDays = [];
    sessions.forEach(s => {
      const sDate = new Date(s.startTime);
      sDate.setHours(0, 0, 0, 0);
      const timeVal = sDate.getTime();
      if (!uniqueDays.includes(timeVal)) {
        uniqueDays.push(timeVal);
      }
    });

    let currentStreak = 0;
    const todayTime = today.getTime();
    const yesterdayTime = yesterday.getTime();

    // Check if the most recent completion was today or yesterday
    if (uniqueDays[0] === todayTime || uniqueDays[0] === yesterdayTime) {
      currentStreak = 1;
      // Loop backwards and see how many consecutive days there are
      for (let i = 0; i < uniqueDays.length - 1; i++) {
        const diffDays = (uniqueDays[i] - uniqueDays[i + 1]) / (24 * 60 * 60 * 1000);
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          break; // streak broken
        }
      }
    }

    return currentStreak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
};

module.exports = { calculateStreak };
