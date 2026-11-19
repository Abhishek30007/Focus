const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor(apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY) {
    this.apiKey = apiKey;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    if (this.apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: this.modelName });
      } catch (err) {
        console.warn('Failed to initialize GoogleGenerativeAI client:', err.message);
      }
    }
  }

  /**
   * 1. Orchestrated Prompt Workflow: generatePersonalizedSession
   * Inputs: tradition ('pranayama' | 'yoga_nidra' | 'vipassana' | 'trataka'), mood, stressLevel (1-10), targetDuration (mins)
   * Output: { title: string, breathRatios: { inhale, hold, exhale, postHold }, stages: [{ secondOffset, cue, tone }] }
   */
  async generatePersonalizedSession({ tradition = 'pranayama', mood = 'Neutral', stressLevel = 5, targetDuration = 10 }) {
    const traditionKey = (tradition || 'pranayama').toLowerCase();
    const durationMins = Number(targetDuration) || 10;
    const stress = Math.min(10, Math.max(1, Number(stressLevel) || 5));

    const systemInstruction = 
      `You are an enlightened Vedic Guru and world-class neuro-wellness expert. ` +
      `Design an authentic, science-backed meditation and breathwork script combining ancient Vedic wisdom with modern polyvagal and autonomic nervous system regulation. ` +
      `You MUST respond ONLY with valid, unescaped JSON strictly conforming to the following TypeScript interface without markdown wrappers:\n` +
      `{\n` +
      `  "title": string,\n` +
      `  "breathRatios": { "inhale": number, "hold": number, "exhale": number, "postHold": number },\n` +
      `  "stages": Array<{ "secondOffset": number, "cue": string, "tone": "grounding" | "instructional" | "soothing" | "reflective" }>\n` +
      `}`;

    const userPrompt = 
      `Create a ${durationMins}-minute session for the '${traditionKey}' Vedic tradition. ` +
      `User mood: '${mood}', current stress index: ${stress}/10. ` +
      `Generate chronological cues from secondOffset: 0 to ${durationMins * 60} seconds spaced every 30 to 60 seconds. ` +
      `Ensure breath ratios mathematically reflect the neuro-physiological goal (e.g., prolonged exhale for high stress parasympathetic tone).`;

    if (this.model && this.apiKey) {
      try {
        const result = await this.model.generateContent([
          { text: systemInstruction },
          { text: userPrompt }
        ]);
        const responseText = result.response.text();
        const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.title && parsed.breathRatios && Array.isArray(parsed.stages)) {
          return parsed;
        }
      } catch (err) {
        console.warn('Gemini API request failed or invalid schema, using deterministic Vedic engine:', err.message);
      }
    }

    // Deterministic Vedic neuro-wellness generator fallback
    return this._fallbackPersonalizedSession(traditionKey, mood, stress, durationMins);
  }

  /**
   * 2. Orchestrated Prompt Workflow: generateBreathworkPacer
   * Dynamic interval generation for nervous system regulation based on current heart rate / HRV inputs.
   */
  async generateBreathworkPacer({ heartRate = 72, hrv = 45, targetState = 'parasympathetic_activation' }) {
    const hr = Number(heartRate) || 72;
    const hrvVal = Number(hrv) || 45;

    const systemInstruction =
      `You are an autonomic nervous system and biofeedback pacing algorithm. ` +
      `Calculate dynamic breathing ratios to maximize heart rate variability (HRV) and respiratory sinus arrhythmia (RSA). ` +
      `Return strict JSON with fields: targetState, targetBreathsPerMin, breathRatios: { inhale, hold, exhale, postHold }, vagalToneIndex, instructions.`;

    const userPrompt = `Current Biomarkers: Heart Rate: ${hr} BPM, HRV (RMSSD): ${hrvVal} ms, Desired State: ${targetState}. Provide optimized pacing ratios.`;

    if (this.model && this.apiKey) {
      try {
        const result = await this.model.generateContent([
          { text: systemInstruction },
          { text: userPrompt }
        ]);
        const responseText = result.response.text();
        const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.breathRatios && parsed.targetBreathsPerMin) {
          return parsed;
        }
      } catch (err) {
        console.warn('Gemini API call failed for pacer, using algorithmic pacer:', err.message);
      }
    }

    return this._algorithmicBreathworkPacer(hr, hrvVal, targetState);
  }

  /**
   * 3. Orchestrated Prompt Workflow: generatePostSessionSummary
   * Inputs: Pre/post calm scores, average heart rate delta, HRV delta, breath sync compliance score.
   * Output: Clinical yet compassionate cognitive and physiological summary of their session recovery with positive psychology takeaways.
   */
  async generatePostSessionSummary({
    preCalmScore = 4,
    postCalmScore = 8,
    avgHeartRateDelta = -6,
    hrvDelta = +12,
    breathSyncScore = 90
  }) {
    const calmGain = postCalmScore - preCalmScore;

    const systemInstruction =
      `You are a neuro-somatics clinician and compassionate Vedic recovery guide. ` +
      `Generate a clinical yet deeply affirming post-meditation assessment analyzing the practitioner's autonomic shift, ` +
      `heart rate variability improvements, and respiratory coherence. Conclude with an actionable positive psychology takeaway. ` +
      `Keep length to 2 concise paragraphs.`;

    const userPrompt =
      `Session Biomarker Shifts:\n` +
      `- Pre-session Calm Score: ${preCalmScore}/10\n` +
      `- Post-session Calm Score: ${postCalmScore}/10 (Delta: ${calmGain >= 0 ? '+' : ''}${calmGain})\n` +
      `- Heart Rate Delta: ${avgHeartRateDelta} BPM (Negative indicates vagal slowing)\n` +
      `- HRV Delta: ${hrvDelta >= 0 ? '+' : ''}${hrvDelta} ms (Higher RMSSD indicates parasympathetic dominance)\n` +
      `- Breath Sync Compliance: ${breathSyncScore}%\n` +
      `Provide the comprehensive clinical and compassionate recovery summary.`;

    if (this.model && this.apiKey) {
      try {
        const result = await this.model.generateContent([
          { text: systemInstruction },
          { text: userPrompt }
        ]);
        const summaryText = result.response.text().trim();
        if (summaryText) {
          return summaryText;
        }
      } catch (err) {
        console.warn('Gemini API call failed for post-session summary, using clinical fallback engine:', err.message);
      }
    }

    return this._clinicalSummaryFallback(preCalmScore, postCalmScore, avgHeartRateDelta, hrvDelta, breathSyncScore);
  }

  /* Internal Vedic Generation Engines */

  _fallbackPersonalizedSession(tradition, mood, stress, durationMins) {
    const totalSeconds = durationMins * 60;
    let title = '';
    let breathRatios = { inhale: 4, hold: 4, exhale: 4, postHold: 0 };
    let stages = [];

    switch (tradition) {
      case 'yoga_nidra':
        title = `Soma Nidra: Conscious Relaxation & Nervous Reset (${durationMins}m)`;
        breathRatios = { inhale: 4, hold: 2, exhale: 6, postHold: 0 };
        stages = [
          { secondOffset: 0, cue: 'Lie down in Shavasana. Gently close your eyes and release the weight of your body into the earth.', tone: 'grounding' },
          { secondOffset: 60, cue: 'Plant your Sankalpa (heartfelt resolve). Whisper it inwardly three times with unwavering faith.', tone: 'reflective' },
          { secondOffset: 180, cue: 'Rotate consciousness through the right hand thumb, index finger, palm, wrist, and forearm.', tone: 'soothing' },
          { secondOffset: Math.floor(totalSeconds * 0.5), cue: 'Feel opposite sensations: heavy and weightless, cooling moon energy and warming prana.', tone: 'soothing' },
          { secondOffset: Math.floor(totalSeconds * 0.8), cue: 'Rest in pure awareness at Chidakasha, the screen of the mind.', tone: 'reflective' },
          { secondOffset: Math.max(0, totalSeconds - 30), cue: 'Slowly wiggle your fingers and toes, carrying this profound calmness into waking life.', tone: 'grounding' }
        ];
        break;

      case 'vipassana':
        title = `Vipassana Sakshi: Objective Somatosensory Scan (${durationMins}m)`;
        breathRatios = { inhale: 4, hold: 0, exhale: 4, postHold: 0 };
        stages = [
          { secondOffset: 0, cue: 'Sit erect in a steady posture. Bring laser focus to the natural sensation of breath touching the upper lip.', tone: 'instructional' },
          { secondOffset: 60, cue: 'Observe without judgment. Neither cling to pleasant sensations nor resist uncomfortable ones.', tone: 'instructional' },
          { secondOffset: Math.floor(totalSeconds * 0.3), cue: 'Scan sensations systematically from the crown of your head down to your toes.', tone: 'reflective' },
          { secondOffset: Math.floor(totalSeconds * 0.6), cue: 'Notice Anicca: all physical vibrations, tingling, and warmth arise and pass away.', tone: 'reflective' },
          { secondOffset: Math.max(0, totalSeconds - 45), cue: 'Radiate Metta (loving-kindness) to all living beings. Maintain this unshakeable equanimity.', tone: 'grounding' }
        ];
        break;

      case 'trataka':
        title = `Trataka Bindu: Neural Coherence & Dharana Focus (${durationMins}m)`;
        breathRatios = { inhale: 4, hold: 4, exhale: 4, postHold: 2 };
        stages = [
          { secondOffset: 0, cue: 'Align your spine and fix your unwavering gaze upon the focal center point. Keep blinking to a minimum.', tone: 'instructional' },
          { secondOffset: 90, cue: 'Allow peripheral distractions to dissolve. Merge your ocular nerve pathway with singular intent.', tone: 'instructional' },
          { secondOffset: Math.floor(totalSeconds * 0.5), cue: 'Gently close the eyes and hold the luminous after-image steady in your Ajna chakra.', tone: 'reflective' },
          { secondOffset: Math.max(0, totalSeconds - 30), cue: 'Rub palms together until warm, gently cup the closed eyes, and absorb the rejuvenating prana.', tone: 'soothing' }
        ];
        break;

      case 'pranayama':
      default:
        if (stress >= 6) {
          title = `Nadi Shodhana & Bhramari: Autonomic Reset (${durationMins}m)`;
          breathRatios = { inhale: 4, hold: 4, exhale: 8, postHold: 2 };
          stages = [
            { secondOffset: 0, cue: 'Adopt Vishnu Mudra with your right hand. Inhale smoothly through the left nostril (Ida nadi).', tone: 'instructional' },
            { secondOffset: 60, cue: 'Hold gently at the eyebrow center, observing the tranquil still point of consciousness.', tone: 'soothing' },
            { secondOffset: 120, cue: 'Exhale slowly through the right nostril twice as long as the inhale to engage the vagal brake.', tone: 'instructional' },
            { secondOffset: Math.floor(totalSeconds * 0.6), cue: 'Begin soft humming Bhramari exhalations, vibrating nitric oxide through your cranial sinuses.', tone: 'soothing' },
            { secondOffset: Math.max(0, totalSeconds - 30), cue: 'Release mudra. Rest in the luminous quiet of Sushumna nadi.', tone: 'grounding' }
          ];
        } else {
          title = `Sama Vritti & Ujjayi: Steady Flow Awakening (${durationMins}m)`;
          breathRatios = { inhale: 4, hold: 4, exhale: 4, postHold: 0 };
          stages = [
            { secondOffset: 0, cue: 'Begin rhythmic oceanic Ujjayi breathing with gentle glottic constriction.', tone: 'instructional' },
            { secondOffset: 60, cue: 'Harmonize each four-count inhalation with effortless four-count exhalation.', tone: 'instructional' },
            { secondOffset: Math.floor(totalSeconds * 0.5), cue: 'Feel the internal warmth oxygenate your prefrontal cortex and center your focus.', tone: 'soothing' },
            { secondOffset: Math.max(0, totalSeconds - 30), cue: 'Savor the crystal clarity and mental poise cultivated through this practice.', tone: 'reflective' }
          ];
        }
        break;
    }

    return { title, breathRatios, stages };
  }

  _algorithmicBreathworkPacer(hr, hrv, targetState) {
    if (hr > 85 || targetState === 'parasympathetic_activation') {
      return {
        targetState: 'parasympathetic_activation',
        targetBreathsPerMin: 5.0,
        breathRatios: { inhale: 4, hold: 2, exhale: 6, postHold: 0 },
        vagalToneIndex: hrv < 40 ? 'elevated_sympathetic_strain' : 'rebalancing',
        instructions: `Heart rate is elevated at ${hr} BPM. An extended 1:1.5 inhale-to-exhale ratio stimulates pulmonary stretch receptors and activates acetylcholine release via the vagus nerve.`
      };
    } else if (targetState === 'focus_enhancement') {
      return {
        targetState: 'focus_enhancement',
        targetBreathsPerMin: 6.0,
        breathRatios: { inhale: 4, hold: 4, exhale: 4, postHold: 4 },
        vagalToneIndex: 'resonant_coherence',
        instructions: `Balanced box breathing (Sama Vritti 4-4-4-4) stabilizes blood pressure oscillations and optimizes prefrontal cerebral oxygenation for sustained attention.`
      };
    }

    return {
      targetState: 'vagal_homeostasis',
      targetBreathsPerMin: 5.5,
      breathRatios: { inhale: 4, hold: 1, exhale: 5, postHold: 1 },
      vagalToneIndex: 'optimal',
      instructions: `Resonant 5.5 breaths per minute synchronizes heart rate variability (HRV) with baroreflex oscillations, establishing autonomic harmony.`
    };
  }

  _clinicalSummaryFallback(preCalm, postCalm, hrDelta, hrvDelta, syncScore) {
    const calmShift = postCalm - preCalm;
    const parasympatheticEngaged = hrDelta < 0 || hrvDelta > 0;

    return `Clinical Biomarker Analysis:\n` +
      `Your autonomic nervous system exhibited a marked ${parasympatheticEngaged ? 'parasympathetic transition' : 'stabilization profile'} across the session. ` +
      `With a ${Math.abs(hrDelta)} BPM ${hrDelta <= 0 ? 'reduction' : 'shift'} in resting heart rate and a ${hrvDelta >= 0 ? '+' : ''}${hrvDelta} ms shift in HRV (RMSSD), ` +
      `your vagal brake engaged effectively, lowering sympathetic fight-or-flight signaling. ` +
      `You maintained a high ${syncScore}% breath-pacing synchronization compliance, evidencing strong respiratory-cardiac coupling.\n\n` +
      `Cognitive Recovery & Vedic Takeaway:\n` +
      `Subjective calm improved from ${preCalm}/10 to ${postCalm}/10 (${calmShift >= 0 ? `+${calmShift}` : calmShift} shift), indicating significant down-regulation of the amygdala and mental chatter (chitta vritti). ` +
      `Positive psychology insight: Ground this physiological baseline into your upcoming activities by taking three resonant breaths before switching tasks.`;
  }
}

module.exports = new GeminiService();

