import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Bell, 
  ShieldAlert, 
  Check, 
  Trash2, 
  AlertTriangle,
  Image,
  Clock,
  Sparkles
} from 'lucide-react';

const UserSettings = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile forms
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [preferredFocusDuration, setPreferredFocusDuration] = useState(25);
  const [meditationPreferences, setMeditationPreferences] = useState([]);
  
  // Settings forms
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [privacyShareProgress, setPrivacyShareProgress] = useState(false);

  // States
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Account delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const fetchSettingsAndProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      // Populate from User context
      if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
        setProfileImage(user.profileImage || '');
        setPreferredFocusDuration(user.preferredFocusDuration || 25);
        setMeditationPreferences(user.meditationPreferences || []);
      }

      // Fetch settings
      const settingsRes = await api.get('/settings');
      if (settingsRes.data.success) {
        const s = settingsRes.data.data;
        setEmailNotifications(s.notifications?.email ?? true);
        setReminders(s.sessionReminders ?? true);
        setTheme(s.theme || 'dark');
        setPrivacyShareProgress(s.privacyPreferences?.shareProgress ?? false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to sync profile settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndProfile();
  }, [user]);

  // Handle profile patch
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.patch('/users/me', {
        name,
        email,
        profileImage,
        preferredFocusDuration: Number(preferredFocusDuration),
        meditationPreferences
      });

      if (res.data.success) {
        setSuccessMsg('User profile updated successfully!');
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Could not update profile details.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle settings patch
  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.patch('/settings', {
        notifications: { email: emailNotifications, reminders: reminders },
        sessionReminders: reminders,
        theme,
        privacyPreferences: { shareProgress: privacyShareProgress }
      });

      if (res.data.success) {
        setSuccessMsg('Application preferences updated successfully!');
        await fetchSettingsAndProfile();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not update application preferences.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle account delete
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeletingAccount(true);
    setErrorMsg('');

    try {
      const res = await api.delete('/users/me');
      if (res.data.success) {
        // Log out immediately
        await logout();
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete account. Please try again.');
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  // Toggle meditation preference tag
  const toggleMeditationPref = (pref) => {
    if (meditationPreferences.includes(pref)) {
      setMeditationPreferences(prev => prev.filter(p => p !== pref));
    } else {
      setMeditationPreferences(prev => [...prev, pref]);
    }
  };

  const presetPrefs = ['Anxiety Reset', 'Binaural Sprints', 'Zen Breathing', 'Vipassana Hum', 'Pomodoro Core'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-limeAccent-400 border-t-transparent animate-spin"></div>
        <p className="text-slate-400 text-sm">Opening settings module...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 selection:bg-limeAccent-400 selection:text-forest-950">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Profile & Preferences</h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Customise your focus durations, toggle reminders, and edit your meditation training options.
        </p>
      </div>

      {successMsg && (
        <div className="bg-forest-900/60 border border-limeAccent-400/40 text-limeAccent-400 rounded-2xl p-4 flex gap-3 text-sm animate-fade-in">
          <Check className="w-5 h-5 shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-950/40 border border-red-900/50 text-red-300 rounded-2xl p-4 flex gap-3 text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* 1. PROFILE DETAILS FORM */}
        <div className="glass-card p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800/40 pb-3">
            <User className="w-5 h-5 text-limeAccent-400" />
            <h3 className="font-extrabold text-lg text-white">Profile Details</h3>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass-input"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider">Profile Image URL</label>
              <div className="relative">
                <Image className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="w-full glass-input pl-11"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-455 uppercase tracking-wider">Preferred Focus Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <select
                  value={preferredFocusDuration}
                  onChange={(e) => setPreferredFocusDuration(e.target.value)}
                  className="w-full glass-input pl-11"
                >
                  <option value={5}>5 mins (Quick center)</option>
                  <option value={10}>10 mins</option>
                  <option value={15}>15 mins</option>
                  <option value={25}>25 mins (Pomodoro Sprint)</option>
                  <option value={50}>50 mins (Flow deep block)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-455 uppercase tracking-wider">Meditation Styles</label>
              <div className="flex flex-wrap gap-2">
                {presetPrefs.map((pref) => {
                  const isSelected = meditationPreferences.includes(pref);
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => toggleMeditationPref(pref)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected 
                          ? 'bg-limeAccent-400 text-forest-950 border-limeAccent-400' 
                          : 'bg-forest-900/40 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              id="profile-save-button"
              disabled={savingProfile}
              className="w-full bg-limeAccent-400 hover:bg-limeAccent-350 disabled:opacity-50 text-forest-950 font-bold py-3.5 rounded-xl text-sm transition-all"
            >
              {savingProfile ? 'Updating Profile...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* 2. APP SETTINGS & SAFETY CONTROLS */}
        <div className="space-y-8">
          {/* Settings Form */}
          <div className="glass-card p-6 rounded-3xl space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800/40 pb-3">
              <Settings className="w-5 h-5 text-limeAccent-400" />
              <h3 className="font-extrabold text-lg text-white">App Configurations</h3>
            </div>

            <form onSubmit={handleSettingsSave} className="space-y-6">
              {/* Email list checkbox */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-slate-200">Email Notifications</span>
                  <p className="text-xs text-slate-500">Receive summaries of focus achievements and streaks.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-5 h-5 accent-limeAccent-400 bg-forest-900 rounded border-slate-850 mt-1 cursor-pointer"
                />
              </div>

              {/* Reminders checkbox */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-slate-200">Daily Session Reminders</span>
                  <p className="text-xs text-slate-500">Alert to log breathing resets when streak is at risk.</p>
                </div>
                <input
                  type="checkbox"
                  checked={reminders}
                  onChange={(e) => setReminders(e.target.checked)}
                  className="w-5 h-5 accent-limeAccent-400 bg-forest-900 rounded border-slate-850 mt-1 cursor-pointer"
                />
              </div>

              {/* Theme selector */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-slate-200">Color Palette Theme</span>
                  <p className="text-xs text-slate-500">Choose display mode for the meditation app.</p>
                </div>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="glass-input text-xs py-2"
                >
                  <option value="dark">Varanasi Dark Green</option>
                  <option value="light">Varanasi Light (Contrast)</option>
                </select>
              </div>

              {/* Privacy checkbox */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-slate-200">Progress Sharing</span>
                  <p className="text-xs text-slate-500">Allow community tracking of completed attention minutes.</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacyShareProgress}
                  onChange={(e) => setPrivacyShareProgress(e.target.checked)}
                  className="w-5 h-5 accent-limeAccent-400 bg-forest-900 rounded border-slate-850 mt-1 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                id="settings-save-button"
                disabled={savingSettings}
                className="w-full bg-limeAccent-400 hover:bg-limeAccent-350 disabled:opacity-50 text-forest-950 font-bold py-3.5 rounded-xl text-sm transition-all"
              >
                {savingSettings ? 'Saving Settings...' : 'Save App Preferences'}
              </button>
            </form>
          </div>

          {/* DANGER ZONE - ACCOUNT DELETION */}
          <div className="glass-card p-6 rounded-3xl border border-red-950/40 space-y-4">
            <h4 className="font-extrabold text-sm text-red-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </h4>
            <p className="text-xs text-slate-450 leading-relaxed font-light">
              Deleting your account is permanent. It cascades and immediately wipes your Varanasi profile details, focus streak records, historical analytics, and settings.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              id="account-delete-trigger"
              className="bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Delete FocusFlow Account
            </button>
          </div>
        </div>

      </div>

      {/* ACCOUNT DELETION CONFIRM MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl space-y-6 border border-red-900/30">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-full bg-red-950/40 text-red-400 border border-red-900/30 flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-xl text-white">Permanently delete account?</h4>
              <p className="text-xs text-slate-400 font-light">
                This will destroy all your accumulated streaks and session progress history. This action is irreversible.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-center text-xs text-slate-450 uppercase font-semibold">Type "DELETE" below to confirm</label>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full glass-input text-center text-red-400 uppercase tracking-widest font-mono font-bold"
                id="delete-confirm-input"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="flex-1 bg-forest-850 text-slate-350 py-3 rounded-xl font-bold text-sm hover:bg-forest-800 transition-colors"
              >
                Keep Account
              </button>
              <button
                onClick={handleDeleteAccount}
                id="delete-confirm-button"
                disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                className="flex-1 bg-red-650 hover:bg-red-550 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-all"
              >
                {deletingAccount ? 'Purging data...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserSettings;
