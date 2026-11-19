import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const result = await signup(name, email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-forest-950 flex flex-col justify-center items-center p-6 relative selection:bg-limeAccent-400 selection:text-forest-950">
      {/* Decorative Glow Spots */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full glow-spot-lime opacity-45 z-0" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full glow-spot-forest opacity-45 z-0" />

      <div className="w-full max-w-md glass-card p-8 rounded-3xl relative z-10 space-y-6">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-limeAccent-400 to-forest-500 flex items-center justify-center shadow-lg shadow-limeAccent-400/20">
            <Brain className="w-6 h-6 text-forest-950" />
          </Link>
          <div>
            <h2 className="font-extrabold text-2xl text-white tracking-tight">Create Focus Account</h2>
            <p className="text-xs text-slate-400 font-light mt-1">Begin personalising your cognitive meditation sessions</p>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-4 flex gap-3 text-red-300 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p id="error-message">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                id="name"
                placeholder="Aarav Raj"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass-input pl-12"
                disabled={loading}
              />
            </div>
          </div>

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
            <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
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

          <button
            type="submit"
            id="signup-submit-button"
            disabled={loading}
            className="w-full bg-limeAccent-400 hover:bg-limeAccent-350 disabled:opacity-50 text-forest-950 font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-limeAccent-400/5 flex items-center justify-center gap-2"
          >
            {loading ? 'Registering...' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer links */}
        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" id="login-link" className="text-limeAccent-400 font-semibold hover:text-limeAccent-350 hover:underline transition-all">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;
