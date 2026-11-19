const Session = require('../models/Session');
const FocusSession = require('../models/FocusSession');

// @desc    Get recommendations overview
// @route   GET /api/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
  try {
    const templates = await Session.find();
    
    // Default recommendations categorised by user states
    const categories = {
      stressReduction: templates.filter(s => s.category === 'Meditation' || s.category === 'Calm'),
      productivityBoost: templates.filter(s => s.category === 'Focus' || s.category === 'Flow'),
      quickReset: templates.filter(s => s.duration <= 15)
    };

    res.status(200).json({
      success: true,
      message: 'Mindfulness recommendations loaded',
      disclaimer: 'FocusFlow recommendations are for general productivity, mindfulness, and cognitive training. They are not intended as medical advice or therapy.',
      data: {
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized session recommendations based on user mood, available time, and goals
// @route   POST /api/recommendations
// @access  Private
exports.createPersonalizedRecommendations = async (req, res, next) => {
  try {
    const { availableTime, currentMood, focusGoal } = req.body;

    const templates = await Session.find();
    if (templates.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No sessions templates found',
        data: []
      });
    }

    // Score sessions based on inputs
    const scoredSessions = templates.map(session => {
      let score = 50; // base score

      // 1. Time matching (strictly penalise templates longer than available time, if specified)
      if (availableTime) {
        const timeDiff = Math.abs(session.duration - availableTime);
        if (session.duration > availableTime) {
          score -= 30; // heavy penalty if it exceeds available time
        } else {
          score += (10 - timeDiff); // closer time gets a small bonus
        }
      }

      // 2. Mood matching
      if (currentMood) {
        const mood = currentMood.toLowerCase();
        if (mood === 'anxious' || mood === 'stressed') {
          // Boost meditation and calm resets
          if (session.category === 'Meditation' || session.category === 'Calm') score += 30;
        } else if (mood === 'fatigued' || mood === 'tired') {
          // Boost quick resets or beginner meditations
          if (session.duration <= 15) score += 20;
          if (session.difficulty === 'Beginner') score += 10;
        } else if (mood === 'distracted' || mood === 'scattered') {
          // Boost Focus or Calm starter sessions
          if (session.category === 'Focus' && session.duration <= 25) score += 25;
        } else if (mood === 'motivated' || mood === 'focused') {
          // Boost flow starter or deep focus
          if (session.category === 'Flow' || session.category === 'Focus') score += 25;
        }
      }

      // 3. Focus Goal matching
      if (focusGoal) {
        const goal = focusGoal.toLowerCase();
        if (goal.includes('stress') || goal.includes('anxiety') || goal.includes('calm')) {
          if (session.category === 'Meditation' || session.category === 'Calm') score += 20;
        } else if (goal.includes('productivity') || goal.includes('deep work') || goal.includes('focus')) {
          if (session.category === 'Focus' || session.category === 'Flow') score += 20;
        } else if (goal.includes('flow') || goal.includes('attention')) {
          if (session.category === 'Flow') score += 25;
        }
      }

      return {
        session,
        score
      };
    });

    // Sort by score descending
    const recommendations = scoredSessions
      .sort((a, b) => b.score - a.score)
      .map(item => item.session);

    res.status(200).json({
      success: true,
      message: 'Personalized wellness recommendations generated successfully',
      disclaimer: 'These suggestions are generated for productivity and mindfulness coaching. FocusFlow is not a medical application.',
      data: {
        recommendations: recommendations.slice(0, 3), // return top 3 matches
        allScores: scoredSessions.slice(0, 5) // return top 5 scores for transparency
      }
    });
  } catch (error) {
    next(error);
  }
};
