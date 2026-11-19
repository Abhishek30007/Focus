import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Brain, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        resetToken: token,
        password
      });

      if (res.data.success) {
        setSuccess(true);
        // Save new token to local storage
        if (res.data.data && res.data.data.token) {
          localStorage.setItem('token', res.data.data.token);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Password reset failed. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-950 flex flex-col justify-center items-center p-6 relative selection:bg-limeAccent-400 selection:text-forest-950">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full glow-spot-lime opacity-40 z-0" />

      <div className="w-full max-w-md glass-card p-8 rounded-3xl relative z-10 space-y-6">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-limeAccent-400 to-forest-500 flex items-center justify-center shadow-lg shadow-limeAccent-400/20">
            <Brain className="w-6 h-6 text-forest-950" />
          </div>
          <div>
            <h2 className="font-extrabold text-2xl text-white tracking-tight">Set New Password</h2>
            <p className="text-xs text-slate-400 font-light mt-1">Regain secure access to your FocusFlow profile</p>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-4 flex gap-3 text-red-300 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p id="error-message">{error}</p>
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center">
            <div className="bg-forest-800/40 border border-limeAccent-400/30 rounded-xl p-6 flex flex-col items-center gap-3 text-slate-200">
              <CheckCircle2 className="w-12 h-12 text-limeAccent-400 animate-bounce" />
              <h3 className="font-extrabold text-lg text-white">Password Updated</h3>
              <p className="text-xs text-slate-400">
                Your password has been reset. You are now logged in and can access your dashboard.
              </p>
            </div>
            <Link
              to="/dashboard"
              id="reset-success-dashboard-link"
              className="w-full bg-limeAccent-400 hover:bg-limeAccent-350 text-forest-950 font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  id="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input pl-12"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirm-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  id="confirm-password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full glass-input pl-12"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              id="reset-submit-button"
              disabled={loading}
              className="w-full bg-limeAccent-400 hover:bg-limeAccent-350 disabled:opacity-50 text-forest-950 font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? 'Resetting...' : 'Update Password'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
