const { generateAIResponse } = require('../services/aiService');

// @desc    Interact with the FocusFlow AI coach
// @route   POST /api/ai/chat
// @access  Private
exports.chatWithAI = async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide messages array',
        error: 'INVALID_INPUT'
      });
    }

    const reply = await generateAIResponse(messages);

    res.status(200).json({
      success: true,
      message: 'AI reply generated',
      data: {
        message: {
          role: 'assistant',
          content: reply
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
