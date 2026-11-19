const Session = require('../models/Session');

const seedSessions = async () => {
  try {
    const count = await Session.countDocuments();
    if (count > 0) {
      console.log('Database already has session templates seeded.');
      return;
    }

    const defaultSessions = [
      {
        title: 'Calm Reset',
        description: 'A gentle guided session focusing on deep belly breathing to calm the nervous system and clear mental clutter.',
        category: 'Meditation',
        difficulty: 'Beginner',
        duration: 10,
        guidedInstructions: [
          'Find a comfortable seated position with your back straight.',
          'Close your eyes and take a slow, deep breath in through your nose...',
          'Exhale slowly through your mouth, letting go of any physical tension.',
          'Observe the physical sensation of your breath rising and falling naturally.',
          'If your mind wanders, gently note the thought and let it float away like a cloud.',
          'You are doing great. Keep resting your attention on the breath.',
          'Slowly begin to bring your awareness back to the physical room.',
          'Open your eyes gently when the chime sounds. You are calm and ready.'
        ]
      },
      {
        title: 'Deep Focus',
        description: 'A structured Pomodoro-style sprint. Minimize distraction, block out noise, and lock into a single complex task.',
        category: 'Focus',
        difficulty: 'Intermediate',
        duration: 25,
        guidedInstructions: [
          'Choose a single primary task to work on. Write it down.',
          'Close all background browser tabs and put your phone on Do Not Disturb.',
          'Begin working. Maintain focus strictly on your chosen task.',
          'If you get tempted to check email or social media, take a breath and refocus.',
          'You are halfway there. Keep breathing deeply and check your posture.',
          'Maintain your concentration. You are building powerful attention muscles.',
          'Excellent work. The session is complete. Take a 5-minute break now.'
        ]
      },
      {
        title: 'Flow Starter',
        description: 'A transition session designed to bridge the gap between chaotic multitasking and deep, creative flow state.',
        category: 'Flow',
        difficulty: 'Beginner',
        duration: 15,
        guidedInstructions: [
          'Clear your desk of any clutter. Set a clean physical space.',
          'Take three deep breaths to transition from your previous activity.',
          'Define the immediate, tiny next step of your project.',
          'Start working with a sense of light, effortless engagement.',
          'Sink into the rhythm of your activity. Let yourself get absorbed.',
          'You are in the flow state. Keep moving forward step by step.',
          'Session complete. You have established a strong focus foundation.'
        ]
      },
      {
        title: 'Quick Focus',
        description: 'A rapid concentration exercise to re-center your attention during busy workdays or before an important meeting.',
        category: 'Focus',
        difficulty: 'Beginner',
        duration: 5,
        guidedInstructions: [
          'Sit up straight and plant your feet firmly on the floor.',
          'Fix your gaze gently on a single point in front of you.',
          'Count your breaths silently: inhale 1, exhale 2, up to 10.',
          'If you lose count or thoughts intrude, simply return to 1.',
          'Take one final deep breath, feeling your mind sharpen.',
          'Ready. Proceed into your day with total clarity and presence.'
        ]
      }
    ];

    await Session.create(defaultSessions);
    console.log('Successfully seeded database with default session templates.');
  } catch (error) {
    console.error('Error seeding session templates:', error);
  }
};

module.exports = { seedSessions };
