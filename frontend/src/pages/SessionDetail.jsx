import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  XCircle, 
  CheckCircle, 
  Brain, 
  Volume2, 
  VolumeX,
  Sparkles,
  ArrowRight,
  Heart,
  Activity,
  Wind
} from 'lucide-react';

const SessionDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // FocusSession log document returned by start endpoint
  const [sessionLog, setSessionLog] = useState(location.state?.focusSessionLog || null);
  const [template, setTemplate] = useState(null);
  
  // Timer States
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Breathwork Pacer state: 'Idle' | 'Animating' | 'Paused' | 'Resumed' | 'Completed'
  const [pacerState, setPacerState] = useState('Idle');
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale, Hold, Exhale, PostHold
  const [breathPhaseProgress, setBreathPhaseProgress] = useState(0);
  
  // Audio state
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Completion states
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedMoodAfter, setSelectedMoodAfter] = useState('Peaceful');
  const [exitCalmScore, setExitCalmScore] = useState(8);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState('');

  // Fetch session template if needed
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        let templateId = id;
        if (sessionLog && sessionLog.session) {
          templateId = sessionLog.session;
        }

        const res = await api.get(`/sessions/${templateId}`);
        if (res.data.success) {
          setTemplate(res.data.data);
          
          if (!sessionLog) {
            setSecondsRemaining(res.data.data.duration * 60);
          } else {
            setSecondsRemaining(sessionLog.duration * 60);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch session configurations.');
      }
    };

    fetchTemplate();
  }, [id, sessionLog]);

  // Self-bootstrapping fallback if no log was passed in state
  useEffect(() => {
    const autoStartLog = async () => {
      if (!sessionLog && template) {
        try {
          const res = await api.post(`/sessions/${id}/start`, {
            moodBefore: 'Neutral'
          });
          if (res.data.success) {
            setSessionLog(res.data.data);
            setSecondsRemaining(res.data.data.duration * 60);
          }
        } catch (err) {
          console.error(err);
          setError('Could not auto-start focus log in background.');
        }
      }
    };
    
    if (!sessionLog && template) {
      autoStartLog();
    }
  }, [template, sessionLog, id]);

  // Dynamic Pacer Phase Loop (4s Inhale, 4s Hold, 4s Exhale, 2s Rest)
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      const cycleTime = elapsedSeconds % 14;
      if (cycleTime < 4) {
        setBreathPhase('Inhale');
        setBreathPhaseProgress((cycleTime / 4) * 100);
      } else if (cycleTime < 8) {
        setBreathPhase('Hold');
        setBreathPhaseProgress(((cycleTime - 4) / 4) * 100);
      } else if (cycleTime < 12) {
        setBreathPhase('Exhale');
        setBreathPhaseProgress(((cycleTime - 8) / 4) * 100);
      } else {
        setBreathPhase('Rest');
        setBreathPhaseProgress(((cycleTime - 12) / 2) * 100);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isActive, elapsedSeconds]);

  // Countdown timer loop
  useEffect(() => {
    let interval = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
      setIsCompleted(true);
      setPacerState('Completed');
      stopAmbientAudio();
      setShowCompleteModal(true);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  // Start ambient sound using Web Audio API
  const startAmbientAudio = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      
      const modulator = ctx.createOscillator();
      const modulatorGain = ctx.createGain();
      modulator.frequency.value = 0.25;
      modulatorGain.gain.value = 5;
      
      modulator.connect(modulatorGain);
      modulatorGain.connect(osc.frequency);
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      
      modulator.start();
      osc.start();
      
      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
      setAudioPlaying(true);
    } catch (e) {
      console.warn('Web Audio not supported or blocked by browser policy:', e);
    }
  };

  const stopAmbientAudio = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      setAudioPlaying(false);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAudio = () => {
    if (audioPlaying) {
      stopAmbientAudio();
    } else {
      startAmbientAudio();
    }
  };

  // Toggle active timer
  const handleToggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      if (!hasStarted) {
        setHasStarted(true);
        setPacerState('Animating');
      } else {
        setPacerState('Resumed');
      }
      startAmbientAudio();
    } else {
      setIsActive(false);
      setPacerState('Paused');
      stopAmbientAudio();
    }
  };

  // Skip/Cancel early (completes with elapsed seconds)
  const handleAbortSession = () => {
    setIsActive(false);
    setPacerState('Paused');
    stopAmbientAudio();
    setShowCompleteModal(true);
  };

  // Submit complete session to backend
  const handleCompleteSubmit = async () => {
    if (!sessionLog) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post(`/sessions/${sessionLog._id}/complete`, {
        durationCompleted: elapsedSeconds,
        moodAfter: selectedMoodAfter,
        exitCalmScore,
        notes: notes
      });

      if (res.data.success) {
        setSummaryData(res.data.data);
        setIsCompleted(true);
        setPacerState('Completed');
        setShowCompleteModal(false);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to record session log. Please check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getCurrentInstruction = () => {
    if (!template || !template.guidedInstructions || template.guidedInstructions.length === 0) {
      return 'Maintain steady attention. Observe your breathing pattern with calm detachment.';
    }
    const totalDuration = template.duration * 60;
    const progressPercent = elapsedSeconds / Math.max(1, totalDuration);
    
    const index = Math.min(
      template.guidedInstructions.length - 1,
      Math.floor(progressPercent * template.guidedInstructions.length)
    );
    
    return template.guidedInstructions[index];
  };

  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
    };
  }, []);

  const moodEmojis = {
    'Peaceful': '🧘',
    'Energized': '⚡',
    'Refocused': '🎯',
    'Grateful': '❤️',
    'Restless': '🌀',
    'Tired': '😴'
  };

  // 1. SHOW SUMMARY POST-COMPLETION
  if (summaryData) {
    return (
      <div className="max-w-xl mx-auto glass-card p-8 rounded-3xl text-center space-y-6 animate-scale-up mt-10 selection:bg-limeAccent-400 selection:text-forest-950">
        <div className="w-16 h-16 rounded-full bg-limeAccent-400/20 text-limeAccent-400 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-extrabold text-2xl text-white">Attention Shift Saved</h2>
          <p className="text-xs text-slate-400 font-light">Your session statistics and biomarker shift have been recorded.</p>
        </div>

        {/* Score and streak indicators */}
        <div className="grid grid-cols-2 gap-4 bg-forest-900/40 p-4 rounded-2xl border border-slate-850">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Focus Score</span>
            <p className="text-2xl font-extrabold text-limeAccent-400">{summaryData.focusScore || 90}%</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">New Streak</span>
            <p className="text-2xl font-extrabold text-white">{summaryData.currentStreak || 1} Days</p>
          </div>
        </div>

        {/* Clinical Gemini Assessment Preview if present */}
        {summaryData.focusSession?.summary && (
          <div className="text-left text-xs text-slate-350 bg-forest-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-limeAccent-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Gemini Clinical Evaluation
            </span>
            <p className="leading-relaxed whitespace-pre-line text-slate-300">
              {summaryData.focusSession.summary}
            </p>
          </div>
        )}

        <div className="text-left text-xs text-slate-400 space-y-2 py-2">
          <p className="font-semibold text-slate-300">Practice Log details:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Session: {template?.title}</li>
            <li>Category: {template?.category || 'Meditation'}</li>
            <li>Minutes Completed: {Math.max(1, Math.round(elapsedSeconds / 60))} minutes</li>
            <li>Mood shift: {sessionLog?.moodBefore || 'Neutral'} → {summaryData.focusSession?.moodAfter || selectedMoodAfter}</li>
          </ul>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          id="summary-return-dashboard-button"
          className="w-full bg-limeAccent-400 hover:bg-limeAccent-350 text-forest-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-limeAccent-400/5 flex items-center justify-center gap-2"
        >
          Return to Dashboard
          <ArrowRight className="w-4.5 h-4.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-6 max-w-xl mx-auto space-y-8 animate-fade-in pb-12 selection:bg-limeAccent-400 selection:text-forest-950">
      
      {/* Session Title header */}
      <div className="text-center space-y-2 w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900 border border-slate-800 text-[10px] font-bold text-limeAccent-400 tracking-wider uppercase">
          <Brain className="w-3.5 h-3.5" />
          Active {template?.category || 'Focus'} Training
        </div>
        <h1 className="text-3xl font-extrabold text-white">{template?.title || 'Meditation Flow Session'}</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">{template?.description}</p>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-4 text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      {/* CORE CIRCULAR COUNTDOWN TIMER & BREATH PACER */}
      <div 
        id="breath-pacer-visualizer"
        className="relative w-80 h-80 rounded-full border border-slate-800/40 flex flex-col items-center justify-center bg-forest-900/20 backdrop-blur-md shadow-2xl transition-all duration-700"
      >
        {/* Animated breathing pulse halo */}
        <div 
          className={`absolute inset-0 rounded-full border-4 border-slate-800/50 transition-transform duration-1000 ${
            isActive ? 'glow-timer border-limeAccent-400/30' : ''
          }`}
          style={{
            transform: isActive && breathPhase === 'Inhale' 
              ? 'scale(1.08)' 
              : isActive && breathPhase === 'Exhale' 
              ? 'scale(0.95)' 
              : 'scale(1)'
          }}
        />
        
        {/* Audio Ambient button */}
        <button
          onClick={toggleAudio}
          className={`absolute top-6 p-2 rounded-xl border transition-colors ${
            audioPlaying 
              ? 'bg-limeAccent-400/10 border-limeAccent-400/30 text-limeAccent-400' 
              : 'bg-forest-950/60 border-slate-800/50 text-slate-500 hover:text-slate-300'
          }`}
          title={audioPlaying ? 'Turn off ambient sound' : 'Turn on ambient sound'}
        >
          {audioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Counter digits */}
        <div className="text-5xl font-mono font-extrabold text-white tracking-tight">
          {formatTime(secondsRemaining)}
        </div>
        
        {/* Pacer State Label */}
        <div 
          id="pacer-state-label" 
          className="text-[10px] text-limeAccent-400 font-bold uppercase tracking-widest mt-2"
        >
          {isActive ? 'FLOWING' : 'PAUSED'}
        </div>

        {/* Breath Phase Indicator */}
        <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-300">
          <Wind className="w-3.5 h-3.5 text-limeAccent-400" />
          <span id="breath-phase-text">{breathPhase} Phase</span>
        </div>

        {/* Active percentage progress mini-bar */}
        <div className="absolute bottom-8 w-28 bg-forest-950 rounded-full h-1.5 overflow-hidden border border-slate-800/50">
          <div 
            className="bg-limeAccent-400 h-full transition-all duration-300" 
            style={{ 
              width: `${template ? Math.min(100, ((template.duration * 60 - secondsRemaining) / Math.max(1, template.duration * 60)) * 100) : 0}%` 
            }}
          />
        </div>
      </div>

      {/* GUIDED INSTRUCTIONS CAROUSEL PANEL */}
      <div className="w-full glass-card p-6 rounded-3xl text-center space-y-2 border border-slate-850 relative overflow-hidden min-h-[96px] flex flex-col justify-center">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Vedic Mindfulness Cue</span>
        <p className="text-sm font-medium text-slate-200 transition-all duration-500">
          "{getCurrentInstruction()}"
        </p>
      </div>

      {/* CONTROLS BAR */}
      <div className="flex items-center gap-4 w-full px-6">
        <button
          onClick={handleAbortSession}
          id="timer-abort-button"
          className="flex-1 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 font-bold py-4 rounded-2xl text-sm transition-all border border-red-900/30 flex items-center justify-center gap-2"
        >
          <XCircle className="w-4.5 h-4.5" />
          Abort Early
        </button>

        <button
          onClick={handleToggleTimer}
          id="timer-toggle-button"
          className={`flex-1 font-extrabold py-4 rounded-2xl text-sm transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
            isActive 
              ? 'bg-forest-800 hover:bg-forest-750 text-slate-200 border border-slate-700/50 shadow-black/20' 
              : 'bg-limeAccent-400 hover:bg-limeAccent-350 text-forest-950 shadow-limeAccent-400/5'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-4.5 h-4.5" />
              Pause Timer
            </>
          ) : (
            <>
              <Play className="w-4.5 h-4.5 fill-forest-950" />
              {hasStarted ? 'Resume Timer' : 'Start Timer'}
            </>
          )}
        </button>
      </div>

      {/* POST-SESSION MOOD ASSESSMENT MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-forest-950/85 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl space-y-6 relative border border-slate-700/50">
            <div className="space-y-2">
              <h4 className="font-extrabold text-xl text-white">How do you feel after this session?</h4>
              <p className="text-xs text-slate-400 font-light">
                Assess your mental energy now. Logging your transition tells FocusFlow which sessions align you best.
              </p>
            </div>

            {/* Post mood buttons */}
            <div className="grid grid-cols-3 gap-3">
              {Object.keys(moodEmojis).map((mood) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMoodAfter(mood)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    selectedMoodAfter === mood 
                      ? 'bg-limeAccent-400 text-forest-950 border-limeAccent-400 font-bold shadow-lg shadow-limeAccent-400/10 scale-[1.03]' 
                      : 'bg-forest-900/50 text-slate-300 border-slate-850 hover:bg-forest-800/40 hover:border-slate-850'
                  }`}
                >
                  <div className="text-2xl mb-1">{moodEmojis[mood]}</div>
                  <div className="text-[10px] font-semibold tracking-wider">{moodEmojis[mood]} {mood.toUpperCase()}</div>
                </button>
              ))}
            </div>

            {/* Optional reflection notes */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Reflection notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="Write any thoughts, observations, or tasks you completed..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full glass-input resize-none py-2 px-3 text-xs"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCompleteSubmit}
                id="timer-confirm-complete-button"
                disabled={submitting}
                className="w-full bg-limeAccent-400 hover:bg-limeAccent-350 text-forest-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-limeAccent-400/5 flex items-center justify-center gap-1"
              >
                {submitting ? 'Saving shift details...' : 'Save & Log Session'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SessionDetail;
