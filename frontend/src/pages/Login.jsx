import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Brain, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password sub-state
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [demoResetUrl, setDemoResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setForgotSuccess('');
    setDemoResetUrl('');

    if (!forgotEmail) {
      setError('Please provide your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      if (res.data.success) {
        setForgotSuccess('A demo password reset link has been generated!');
        // Save the demo link so developers/testers can click it directly
        setDemoResetUrl(res.data.data.resetUrl);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to process forgot password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-950 flex flex-col justify-center items-center p-6 relative selection:bg-limeAccent-400 selection:text-forest-950">
      {/* Decorative Glow Spots */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full glow-spot-lime opacity-40 z-0" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full glow-spot-forest opacity-40 z-0" />

      <div className="w-full max-w-md glass-card p-8 rounded-3xl relative z-10 space-y-6">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-limeAccent-400 to-forest-500 flex items-center justify-center shadow-lg shadow-limeAccent-400/20">
            <Brain className="w-6 h-6 text-forest-950" />
          </Link>
          <div>
            <h2 className="font-extrabold text-2xl text-white tracking-tight">
              {forgotMode ? 'Recover Attention' : 'Welcome back'}
            </h2>
            <p className="text-xs text-slate-400 font-light mt-1">
              {forgotMode ? 'Reset your FocusFlow credentials' : 'Align your mind, access your dashboard'}
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-4 flex gap-3 text-red-300 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p id="error-message">{error}</p>
          </div>
        )}

        {/* Forgot Success Alert with direct link for testing convenience */}
        {forgotSuccess && (
          <div className="bg-forest-800/50 border border-limeAccent-400/30 rounded-xl p-4 space-y-2 text-slate-200 text-sm">
            <div className="flex gap-3 text-limeAccent-400 font-bold">
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>{forgotSuccess}</span>
            </div>
            <p className="text-xs text-slate-400">
              For testing convenience, you can click the generated reset link directly below to load the password reset form:
            </p>
            {demoResetUrl && (
              <a 
                href={demoResetUrl} 
                id="demo-reset-link"
                className="block text-xs font-semibold text-limeAccent-400 underline hover:text-limeAccent-300 truncate"
              >
                {demoResetUrl}
              </a>
            )}
          </div>
        )}

        {/* AUTH FORMS */}
        {!forgotMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  id="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input pl-12"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => { setForgotMode(true); setError(''); }}
                  id="forgot-password-trigger"
                  className="text-xs text-limeAccent-400 hover:text-limeAccent-350 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input pl-12"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-button"
              disabled={loading}
              className="w-full bg-limeAccent-400 hover:bg-limeAccent-350 disabled:opacity-50 text-forest-950 font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-limeAccent-400/5 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  id="forgot-email"
                  placeholder="name@domain.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full glass-input pl-12"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              id="forgot-submit-button"
              disabled={loading}
              className="w-full bg-limeAccent-400 hover:bg-limeAccent-350 disabled:opacity-50 text-forest-950 font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center"
            >
              {loading ? 'Generating link...' : 'Generate Demo Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => { setForgotMode(false); setError(''); setForgotSuccess(''); }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 transition-colors py-1"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Footer links */}
        <p className="text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" id="signup-link" className="text-limeAccent-400 font-semibold hover:text-limeAccent-350 hover:underline transition-all">
            Start free trial
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
