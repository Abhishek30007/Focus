import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Brain, 
  Clock, 
  Sparkles, 
  HelpCircle, 
  Activity,
  Award,
  Play, 
  ArrowRight,
  Info
} from 'lucide-react';

const SessionList = () => {
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Custom recommendation search inputs
  const [availableTime, setAvailableTime] = useState(25);
  const [currentMood, setCurrentMood] = useState('Neutral');
  const [focusGoal, setFocusGoal] = useState('Deep Work');
  const [recoLoading, setRecoLoading] = useState(false);

  // Mood confirmation modal
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState('Neutral');
  const [activeSessionToStart, setActiveSessionToStart] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch session templates
      const sessionRes = await api.get('/sessions');
      if (sessionRes.data.success) {
        setSessions(sessionRes.data.data);
      }

      // Fetch default recommendations
      const recoRes = await api.get('/recommendations');
      if (recoRes.data.success) {
        // Just extract stress reduction/quick reset defaults
        const cats = recoRes.data.data.categories;
        setRecommendations(cats.productivityBoost || cats.quickReset || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load session details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGeneratePersonalized = async (e) => {
    e.preventDefault();
    setRecoLoading(true);
    setError('');

    try {
      const res = await api.post('/recommendations', {
        availableTime: Number(availableTime),
        currentMood,
        focusGoal
      });

      if (res.data.success) {
        setRecommendations(res.data.data.recommendations);
      }
    } catch (err) {
      console.error(err);
      setError('Could not generate custom suggestions.');
    } finally {
      setRecoLoading(false);
    }
  };

  const triggerStartSession = (sessionTemplate) => {
    setActiveSessionToStart(sessionTemplate);
    setSelectedMood(currentMood); // default to selected mood in search
    setShowMoodModal(true);
  };

  const handleStartSessionConfirm = async () => {
    if (!activeSessionToStart) return;
    
    try {
      const res = await api.post(`/sessions/${activeSessionToStart._id}/start`, {
        moodBefore: selectedMood
      });
      
      if (res.data.success) {
        navigate(`/sessions/${activeSessionToStart._id}`, { 
          state: { focusSessionLog: res.data.data } 
        });
      }
    } catch (err) {
      console.error(err);
      setError('Could not start focus session. Please try again.');
      setShowMoodModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-limeAccent-400 border-t-transparent animate-spin"></div>
        <p className="text-slate-400 text-sm">Aligning cognitive pacing templates...</p>
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
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Focus & Meditation Sessions</h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Explore structured mental training programs. Use the cognitive matcher below to suggest the perfect session.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-900/50 rounded-2xl p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* COGNITIVE RECO FORM PANEL */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Matcher Form */}
        <div className="glass-card p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-limeAccent-400" />
            <h3 className="font-extrabold text-lg text-white">Cognitive Matcher</h3>
          </div>
          
          <form onSubmit={handleGeneratePersonalized} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider">Available time (minutes)</label>
              <select
                value={availableTime}
                onChange={(e) => setAvailableTime(e.target.value)}
                className="w-full glass-input"
              >
                <option value={5}>5 Minutes (Quick Focus)</option>
                <option value={10}>10 Minutes (Calm Reset)</option>
                <option value={15}>15 Minutes (Flow Starter)</option>
                <option value={25}>25 Minutes (Deep Focus)</option>
                <option value={50}>50 Minutes (Double Cycle)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider">Current Mental Mood</label>
              <select
                value={currentMood}
                onChange={(e) => setCurrentMood(e.target.value)}
                className="w-full glass-input"
              >
                <option value="Neutral">Neutral / Steady</option>
                <option value="Anxious">Anxious / Stressed</option>
                <option value="Fatigued">Fatigued / Sleepy</option>
                <option value="Distracted">Scattered / Distracted</option>
                <option value="Calm">Calm / Peaceful</option>
                <option value="Motivated">Energized / Motivated</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider">Focus Target Goal</label>
              <select
                value={focusGoal}
                onChange={(e) => setFocusGoal(e.target.value)}
                className="w-full glass-input"
              >
                <option value="Deep Work">Deep Work Sprint</option>
                <option value="Reduce Stress">Stress Reduction & Calm</option>
                <option value="Attention Training">Attention Restoration</option>
                <option value="Energy Boost">Energy & Motivation Reset</option>
              </select>
            </div>

            <button
              type="submit"
              id="matcher-submit-button"
              disabled={recoLoading}
              className="w-full bg-limeAccent-400 hover:bg-limeAccent-350 disabled:opacity-50 text-forest-950 font-bold py-3 rounded-xl text-sm transition-all duration-200 shadow-md shadow-limeAccent-400/5 hover:-translate-y-0.5"
            >
              {recoLoading ? 'Matching templates...' : 'Generate Suggestion'}
            </button>
          </form>

          {/* Fictional Disclaimer */}
          <div className="flex gap-2 p-3 rounded-xl bg-forest-900/30 border border-slate-800/40 text-[10px] text-slate-500">
            <Info className="w-4 h-4 shrink-0 text-slate-500" />
            <p>
              Recommendations are structured wellness exercises for productivity and relaxation. They are not medical diagnostics or treatments.
            </p>
          </div>
        </div>

        {/* Personalized Recommendations output */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-white">Suggested Sessions</h3>
              <span className="text-xs text-slate-500 font-semibold">Matched for you</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {recommendations && recommendations.length > 0 ? (
                recommendations.slice(0, 2).map((item) => (
                  <div key={item._id} className="bg-forest-900/40 p-4 rounded-2xl border border-slate-800/50 flex flex-col justify-between h-44">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 rounded bg-limeAccent-400/10 text-limeAccent-400 text-[9px] font-bold uppercase tracking-wider">
                          {item.category}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{item.duration} mins</span>
                      </div>
                      <h4 className="font-bold text-white text-base truncate">{item.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-light">{item.description}</p>
                    </div>

                    <button
                      onClick={() => triggerStartSession(item)}
                      className="w-full mt-3 bg-forest-800 hover:bg-forest-700 text-limeAccent-400 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-limeAccent-400" />
                      Quick Start
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-12 text-center text-slate-500 space-y-2">
                  <HelpCircle className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-sm">Use the matcher on the left to show suggestions.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ALL AVAILABLE SESSIONS SPRINT GRID */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-xl text-white">All Focus templates</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sessions.map((session) => (
            <div 
              key={session._id} 
              className="glass-card glass-card-hover p-5 rounded-3xl flex flex-col justify-between h-64 border border-slate-850"
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                    session.category === 'Meditation' 
                      ? 'bg-emerald-950/40 text-emerald-400' 
                      : 'bg-limeAccent-400/10 text-limeAccent-400'
                  }`}>
                    {session.category}
                  </span>
                  <span className="text-xs text-slate-550 font-semibold">{session.duration} min</span>
                </div>
                
                <h4 className="font-extrabold text-lg text-slate-100">{session.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-light">{session.description}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800/20">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                  <span>Level: {session.difficulty}</span>
                  <span>{session.guidedInstructions?.length || 0} Steps</span>
                </div>
                <button
                  onClick={() => triggerStartSession(session)}
                  className="w-full bg-limeAccent-400 hover:bg-limeAccent-350 text-forest-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-forest-950" />
                  Launch Session
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOOD SELECTION MODAL BEFORE SESSIONS */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-forest-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl space-y-6 relative border border-slate-700/50">
            <div className="space-y-2">
              <h4 className="font-extrabold text-xl text-white">How is your energy right now?</h4>
              <p className="text-xs text-slate-400 font-light">
                Logging your initial emotional state helps FocusFlow's cognitive training models personalize your guided breathing instructions.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {Object.keys(moodEmojis).map((mood) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    selectedMood === mood 
                      ? 'bg-limeAccent-400 text-forest-950 border-limeAccent-400 font-bold shadow-lg shadow-limeAccent-400/10 scale-[1.03]' 
                      : 'bg-forest-900/50 text-slate-300 border-slate-850 hover:bg-forest-800/40 hover:border-slate-800'
                  }`}
                >
                  <div className="text-2xl mb-1">{moodEmojis[mood]}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider">{mood}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowMoodModal(false)}
                className="flex-1 bg-forest-850 hover:bg-forest-800 text-slate-350 font-bold py-3.5 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartSessionConfirm}
                id="mood-confirm-start-button"
                className="flex-1 bg-limeAccent-400 hover:bg-limeAccent-350 text-forest-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-limeAccent-400/5"
              >
                Launch Timer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SessionList;
