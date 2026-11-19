// modular AI service supporting Gemini and Mock fallbacks
const generateAIResponse = async (messages) => {
  const provider = process.env.AI_PROVIDER || 'mock';
  const apiKey = process.env.AI_API_KEY;

  const latestMessage = messages[messages.length - 1]?.content || '';

  const systemInstruction = 
    `You are FocusFlow AI, a virtual mindfulness and productivity coach. ` +
    `Your goal is to help users train their brain, improve focus, and reach a flow state. ` +
    `You combine therapy-inspired mindfulness and structured productivity techniques. ` +
    `IMPORTANT: You are a wellness coach, NOT a medical professional or therapist. ` +
    `Always keep responses wellness-oriented and focus-driven. Do NOT offer diagnostic or medical advice.`;

  // 1. Gemini Provider
  if (provider === 'gemini' && apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemInstruction}\n\nUser Question: ${latestMessage}` }]
              }
            ]
          })
        }
      );

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.warn('Gemini response structure mismatch:', data);
        throw new Error('Invalid response structure from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API call failed, falling back to mock response:', error);
    }
  }

  // 2. Mock Fallback Response (For testing, out-of-the-box verification, and offline usage)
  const input = latestMessage.toLowerCase();
  let responseText = '';

  if (input.includes('stress') || input.includes('anxious') || input.includes('anxiety') || input.includes('calm')) {
    responseText = 
      `It sounds like you're dealing with some stress or tension right now. In FocusFlow, we combine therapy-based mindfulness with focus training to calm the autonomic nervous system.\n\n` +
      `I recommend starting our **Calm Reset** session. It's a 10-minute guided meditation that focuses on slow diaphragmatic breathing. This reduces cortisol and resets your attention span.\n\n` +
      `*Disclaimer: I am an AI wellness guide, not a licensed mental health professional. If you are experiencing persistent anxiety, please consult a specialist.*`;
  } else if (input.includes('pomodoro') || input.includes('technique') || input.includes('method')) {
    responseText = 
      `The Pomodoro Technique is one of the most effective focus exercises. You work intensely for 25 minutes, then take a 5-minute break. This prevents mental fatigue and keeps you in a high cognitive state.\n\n` +
      `Our **Deep Focus** session template uses a 25-minute structure. I recommend starting a session and putting your devices on Do Not Disturb. During the break, stand up and stretch to restore physiological energy.`;
  } else if (input.includes('distracted') || input.includes('focus') || input.includes('attention') || input.includes('productivity')) {
    responseText = 
      `To train your attention, we need to minimize "attention residue"—the cognitive lag that happens when you switch tasks. Here's a quick flow-state checklist:\n` +
      `1. Close all browser tabs unrelated to your current task.\n` +
      `2. Work in a single, dedicated window.\n` +
      `3. Launch our **Flow Starter** or **Deep Focus** session to lock in your timer.\n\n` +
      `Start with a 15-minute goal if 25 minutes feels too long. Attention is like a muscle: it strengthens with repetitive, uninterrupted focus intervals. Let's start a session together!`;
  } else if (input.includes('meditation') || input.includes('session') || input.includes('suggest') || input.includes('recommend')) {
    responseText = 
      `Based on cognitive pacing, I suggest a 15-minute **Flow Starter** session. It uses light ambient audio guidance to help bridge the transition from chaotic multitasking to deep focus.\n\n` +
      `Would you like to try starting that session now? You can log your mood before and after to track how it shifts your mental clarity.`;
  } else {
    responseText = 
      `Hello! I am your FocusFlow AI coach. I'm here to help you design focus sessions, explore productivity techniques (like Time Blocking and Pomodoro), and develop a sustainable mindfulness habit.\n\n` +
      `How are you feeling today? Try telling me about your current energy levels or what you are working on, and I can suggest the perfect session template to get you in the zone.`;
  }

  return responseText;
};

module.exports = { generateAIResponse };
