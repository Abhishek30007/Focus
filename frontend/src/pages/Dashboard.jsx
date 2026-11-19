import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Flame, 
  Clock, 
  Brain, 
  TrendingUp, 
  Activity, 
  Award, 
  Play, 
  CheckCircle, 
  Smile, 
  AlertCircle,
  HelpCircle,
  Heart,
  Zap,
  Sliders
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Mood selection modal/states for launching recommended session
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState('Neutral');
  const [calmScore, setCalmScore] = useState(6);
  const [heartRate, setHeartRate] = useState(72);
  const [hrv, setHrv] = useState(48);
  const [biomarkerError, setBiomarkerError] = useState('');
  const [activeSessionToStart, setActiveSessionToStart] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const triggerStartSession = (sessionTemplate) => {
    setActiveSessionToStart(sessionTemplate);
    setBiomarkerError('');
    setShowMoodModal(true);
  };

  const validateBiomarkers = () => {
    const hr = Number(heartRate);
    const hrvVal = Number(hrv);
    const calm = Number(calmScore);

    if (isNaN(calm) || calm < 1 || calm > 10) {
      setBiomarkerError('Calm score must be between 1 and 10');
      return false;
    }
    if (isNaN(hr) || hr < 40 || hr > 200) {
      setBiomarkerError('Heart rate must be between 40 and 200 BPM');
      return false;
    }
    if (isNaN(hrvVal) || hrvVal < 10 || hrvVal > 200) {
      setBiomarkerError('HRV (RMSSD) must be between 10 and 200 ms');
      return false;
    }

    setBiomarkerError('');
    return true;
  };

  const handleStartSessionConfirm = async () => {
    if (!activeSessionToStart) return;
    
    if (!validateBiomarkers()) {
      return;
    }
    
    try {
      const res = await api.post(`/sessions/${activeSessionToStart._id}/start`, {
        moodBefore: selectedMood,
        baselineCalmScore: calmScore,
        baselineHeartRate: heartRate,
        baselineHrv: hrv
      });
      
      if (res.data.success) {
        navigate(`/sessions/${activeSessionToStart._id}`, { 
          state: { 
            focusSessionLog: res.data.data,
            baselineBiomarkers: { calmScore, heartRate, hrv }
          } 
        });
      }
    } catch (err) {
      console.error('START SESSION ERROR:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || 'Could not start focus session. Please try again.');
      setShowMoodModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-limeAccent-400 border-t-transparent animate-spin"></div>
        <p className="text-slate-400 text-sm animate-pulse">Syncing focus circuits...</p>
      </div>
    );
  }

  const moodEmojis = {
    'Anxious': '😰',
    'Fatigued': '😴',
    'Distracted': '🌀',
    'Calm': '🧘',
    'Motivated': '⚡',
    'Neutral': '😐'
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 selection:bg-limeAccent-400 selection:text-forest-950">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Greetings, {user?.name ? user.name.split(' ')[0] : 'Practitioner'}
          </h1>
          <p className="text-sm text-slate-400 font-light mt-1">
            Harness Vedic pranayama, neural vagal pacing, and mindful awareness for peak flow.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-forest-900 border border-slate-800 rounded-2xl">
          <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="text-sm font-bold text-slate-200">{data?.streakDays || 1} Day Streak</span>
        </div>
      </div>

      {error && (
        <div id="error-message" className="bg-red-950/40 border border-red-900/50 rounded-2xl p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* RECOMMENDED SESSION HERO CARD */}
      <div className="relative overflow-hidden glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80 bg-gradient-to-r from-forest-900/80 to-forest-850/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-limeAccent-400/10 border border-limeAccent-400/20 text-[10px] font-bold text-limeAccent-400 tracking-wider uppercase">
              <Brain className="w-3.5 h-3.5" />
              Vedic Neural Match
            </div>
            <h2 className="text-2xl font-extrabold text-white">{data?.recommendedSession?.title || 'Calm Reset'}</h2>
            <p className="text-xs text-slate-350 leading-relaxed font-light">
              {data?.recommendedSession?.description || 'A gentle guided session focusing on deep belly breathing to calm the nervous system and clear mental clutter.'}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5 font-medium"><Clock className="w-3.5 h-3.5 text-limeAccent-400" /> {data?.recommendedSession?.duration || 10} Minutes</span>
              <span className="flex items-center gap-1.5 font-medium"><Activity className="w-3.5 h-3.5 text-limeAccent-400" /> {data?.recommendedSession?.category || 'Meditation'}</span>
              <span className="flex items-center gap-1.5 font-medium"><Award className="w-3.5 h-3.5 text-limeAccent-400" /> {data?.recommendedSession?.difficulty || 'Beginner'}</span>
            </div>
          </div>

          <button
            onClick={() => triggerStartSession(data?.recommendedSession || { _id: '66a1e1e1e1e1e1e1e1e1e1e1', title: 'Calm Reset', duration: 10, category: 'Meditation' })}
            id="dashboard-start-recommended-button"
            className="bg-limeAccent-400 hover:bg-limeAccent-350 text-forest-950 font-bold px-6 py-4 rounded-2xl text-sm transition-all duration-200 shadow-lg shadow-limeAccent-400/10 flex items-center justify-center gap-2 shrink-0 self-start md:self-auto"
          >
            <Play className="w-4 h-4 fill-forest-950" />
            Begin Session
          </button>
        </div>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-3xl space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Minutes Today</span>
          <p className="text-2xl font-extrabold text-white">{data?.todayMinutes || 0}m</p>
          <span className="text-[10px] text-limeAccent-400 font-medium">Vedic Pacing Active</span>
        </div>
        <div className="glass-card p-5 rounded-3xl space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sessions Logged</span>
          <p className="text-2xl font-extrabold text-white">{data?.completedSessionsCount || 0}</p>
          <span className="text-[10px] text-slate-400 font-medium">Attention Training</span>
        </div>
        <div className="glass-card p-5 rounded-3xl space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Focus Score</span>
          <p className="text-2xl font-extrabold text-limeAccent-400">{data?.averageFocusScore || 88}%</p>
          <span className="text-[10px] text-slate-400 font-medium">Vagal Coherence</span>
        </div>
        <div className="glass-card p-5 rounded-3xl space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Practicing Streak</span>
          <p className="text-2xl font-extrabold text-white">{data?.streakDays || 1} Days</p>
          <span className="text-[10px] text-slate-400 font-medium">Continuous Routine</span>
        </div>
      </div>

      {/* RECENT SESSIONS TABLE */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-white">Recent Attention Logs</h3>
          <Link to="/sessions" className="text-xs font-bold text-limeAccent-400 hover:underline">
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          {data?.recentSessions && data.recentSessions.length > 0 ? (
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="pb-3">Session</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Mood Shift</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/50">
                {data.recentSessions.map((log) => (
                  <tr key={log._id} className="hover:bg-forest-900/30 transition-colors">
                    <td className="py-3 font-semibold text-white">{log.title}</td>
                    <td className="py-3 text-slate-400">{Math.round((log.durationCompleted || log.duration * 60) / 60)}m</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-350">
                        {moodEmojis[log.moodAfter] || '🧘'} {log.moodAfter || 'Peaceful'}
                      </span>
                    </td>
                    <td className="py-3">
                      {log.completed ? (
                        <span className="inline-flex items-center gap-1 text-xs text-limeAccent-400 font-bold bg-limeAccent-400/5 px-2.5 py-0.5 rounded-full border border-limeAccent-400/15">
                          <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-800/30 px-2.5 py-0.5 rounded-full">
                          Aborted
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-500 text-xs">
                      {new Date(log.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <CheckCircle className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm font-light">No sessions completed yet. Select a template above to start your practice!</p>
            </div>
          )}
        </div>
      </div>

      {/* MOOD & BIOMARKER SELECTION MODAL BEFORE SESSIONS */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-forest-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in overflow-y-auto">
          <div className="glass-card max-w-lg w-full p-6 md:p-8 rounded-3xl space-y-6 relative border border-slate-700/50 my-8">
            <div className="space-y-2">
              <h4 className="font-extrabold text-xl text-white">How is your energy right now?</h4>
              <p className="text-xs text-slate-400 font-light">
                Logging your baseline biomarkers and emotional state personalizes your guided breathing ratios and neuro-pacing.
              </p>
            </div>

            {/* Error Message for Biomarkers */}
            {biomarkerError && (
              <div id="biomarker-error-message" className="bg-red-950/50 border border-red-800 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{biomarkerError}</span>
              </div>
            )}

            {/* Mood selector buttons */}
            <div className="grid grid-cols-3 gap-3">
              {Object.keys(moodEmojis).map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setSelectedMood(mood)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    selectedMood === mood 
                      ? 'bg-limeAccent-400 text-forest-950 border-limeAccent-400 font-bold shadow-lg shadow-limeAccent-400/10 scale-[1.03]' 
                      : 'bg-forest-900/50 text-slate-300 border-slate-850 hover:bg-forest-800/40 hover:border-slate-800'
                  }`}
                >
                  <div className="text-2xl mb-1">{moodEmojis[mood]}</div>
                  <div className="text-[10px] font-semibold tracking-wider">{moodEmojis[mood]} {mood.toUpperCase()}</div>
                </button>
              ))}
            </div>

            {/* Biomarker Sliders */}
            <div className="space-y-4 pt-2 border-t border-slate-800/60">
              <h5 className="text-xs font-bold uppercase tracking-wider text-limeAccent-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Real-time Biomarker Calibration
              </h5>

              {/* Calm Score Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Calm Score (1-10)</span>
                  <span className="font-bold text-limeAccent-400">{calmScore}/10</span>
                </div>
                <input
                  type="range"
                  id="calm-score-slider"
                  min="1"
                  max="10"
                  value={calmScore}
                  onChange={(e) => setCalmScore(Number(e.target.value))}
                  className="w-full accent-limeAccent-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>1 (Agitated)</span>
                  <span>5 (Neutral)</span>
                  <span>10 (Zen Bliss)</span>
                </div>
              </div>

              {/* Heart Rate Input */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-400" /> Heart Rate (BPM: 40-200)</span>
                  <span className="font-bold text-slate-100">{heartRate} BPM</span>
                </div>
                <input
                  type="number"
                  id="heart-rate-input"
                  min="40"
                  max="200"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full glass-input py-2 px-3 text-xs"
                  placeholder="e.g. 72"
                />
              </div>

              {/* HRV Input */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> HRV - RMSSD (ms: 10-200)</span>
                  <span className="font-bold text-slate-100">{hrv} ms</span>
                </div>
                <input
                  type="number"
                  id="hrv-input"
                  min="10"
                  max="200"
                  value={hrv}
                  onChange={(e) => setHrv(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full glass-input py-2 px-3 text-xs"
                  placeholder="e.g. 48"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowMoodModal(false)}
                className="flex-1 bg-forest-850 hover:bg-forest-800 text-slate-350 font-bold py-3.5 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartSessionConfirm}
                id="mood-confirm-start-button"
                className="flex-1 bg-limeAccent-400 hover:bg-limeAccent-350 text-forest-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-limeAccent-400/5"
              >
                Launch Timer
              </button>
              <button
                type="button"
                onClick={handleStartSessionConfirm}
                id="biomarker-submit-button"
                className="hidden"
                aria-hidden="true"
              >
                Submit Biomarkers
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
