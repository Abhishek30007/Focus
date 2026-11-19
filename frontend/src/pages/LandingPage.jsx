import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Clock, 
  Shield, 
  CheckCircle2, 
  ChevronRight, 
  TrendingUp, 
  Volume2, 
  Heart 
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-forest-950 text-slate-100 selection:bg-limeAccent-400 selection:text-forest-950">
      
      {/* HEADER / NAV */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-800/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-limeAccent-400 to-forest-500 flex items-center justify-center shadow-lg shadow-limeAccent-400/20">
            <Brain className="w-5.5 h-5.5 text-forest-950" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white">FocusFlow</span>
            <span className="block text-[8px] tracking-widest uppercase font-semibold text-limeAccent-400 -mt-1">AI Meditation</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            id="landing-login-button"
            className="text-sm font-semibold text-slate-350 hover:text-white transition-colors"
          >
            Log In
          </Link>
          <Link 
            to="/signup" 
            id="landing-signup-button"
            className="bg-limeAccent-400 hover:bg-limeAccent-300 text-forest-950 font-bold px-4 py-2 rounded-xl text-sm transition-all duration-200 shadow-md shadow-limeAccent-400/10 hover:shadow-limeAccent-400/25 hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-24 md:py-32 px-6">
        {/* Glow Spots */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full glow-spot-lime z-0" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full glow-spot-forest z-0" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800/80 border border-slate-700/40 text-[11px] font-bold text-limeAccent-400 tracking-wider uppercase shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            Empowered by Cognitive Neuroscience
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
            Turn inner chaos <br />
            <span className="bg-gradient-to-r from-limeAccent-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">into Focus.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Train your attention, create calm and build productive flow through personalized meditation and focus sessions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link
              to="/signup"
              id="hero-cta-button"
              className="w-full sm:w-auto bg-gradient-to-r from-limeAccent-400 to-emerald-400 hover:from-limeAccent-300 hover:to-emerald-300 text-forest-950 font-extrabold px-8 py-4 rounded-2xl text-base shadow-xl shadow-limeAccent-400/10 hover:shadow-limeAccent-400/20 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Start a Focus Session
              <ChevronRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              id="hero-secondary-button"
              className="w-full sm:w-auto glass-card hover:bg-forest-800/40 border border-slate-800 text-slate-200 hover:text-white font-bold px-8 py-4 rounded-2xl text-base transition-all duration-200 flex items-center justify-center"
            >
              Explore FocusFlow
            </a>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES (FEATURES) */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/10 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Engineered for Mental Precision</h2>
          <p className="text-slate-400 font-light">Combining physiological breathing triggers with high-performance focus blocks to align your cognitive state.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Personalized Focus */}
          <div className="glass-card glass-card-hover p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-forest-800 border border-slate-700/35 flex items-center justify-center text-limeAccent-400 mb-6 shadow-inner">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Personalized Focus</h3>
              <p className="text-sm text-slate-450 leading-relaxed font-light">
                Tailored sessions matching your immediate schedule and attention span. Progress from 5-minute re-centers to 50-minute deep flows.
              </p>
            </div>
            <div className="mt-8 text-xs font-semibold text-limeAccent-400 uppercase tracking-widest">Time-Paced</div>
          </div>

          {/* Card 2: AI Guided Meditation */}
          <div className="glass-card glass-card-hover p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-forest-800 border border-slate-700/35 flex items-center justify-center text-limeAccent-400 mb-6 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI-Guided Meditation</h3>
              <p className="text-sm text-slate-450 leading-relaxed font-light">
                Our Wellness Coach analyzes your emotional and physiological feedback to offer breathing pacing, focus suggestions, and technique details.
              </p>
            </div>
            <div className="mt-8 text-xs font-semibold text-limeAccent-400 uppercase tracking-widest">Smart Coaching</div>
          </div>

          {/* Card 3: Focus & Productivity */}
          <div className="glass-card glass-card-hover p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-forest-800 border border-slate-700/35 flex items-center justify-center text-limeAccent-400 mb-6 shadow-inner">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Attention Shield</h3>
              <p className="text-sm text-slate-450 leading-relaxed font-light">
                Eliminate "attention residue." Our structured blocks provide clear prompts during focus sprints to actively train cognitive restraint.
              </p>
            </div>
            <div className="mt-8 text-xs font-semibold text-limeAccent-400 uppercase tracking-widest">Pomodoro Core</div>
          </div>

          {/* Card 4: Flow-State Training */}
          <div className="glass-card glass-card-hover p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-forest-800 border border-slate-700/35 flex items-center justify-center text-limeAccent-400 mb-6 shadow-inner">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Flow State Training</h3>
              <p className="text-sm text-slate-450 leading-relaxed font-light">
                Integrate clinical therapy techniques with mindfulness. Actively lower stress levels to trigger dopamine-fueled states of absorption.
              </p>
            </div>
            <div className="mt-8 text-xs font-semibold text-limeAccent-400 uppercase tracking-widest">Peak Performance</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-limeAccent-400">Pacing and Habituation</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">How FocusFlow Trains Your Brain</h2>
            <p className="text-slate-400 font-light leading-relaxed">
              Achieving focus isn't about raw willpower—it's a physiological state. FocusFlow establishes a structured 4-step loop to train your neural circuits over time.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-forest-800 text-limeAccent-400 font-bold flex items-center justify-center text-xs shrink-0 mt-1">1</div>
                <div>
                  <h4 className="font-bold text-white">Log Initial Mood</h4>
                  <p className="text-sm text-slate-450 font-light">Identify stressors or distraction levels before beginning your daily session.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-forest-800 text-limeAccent-400 font-bold flex items-center justify-center text-xs shrink-0 mt-1">2</div>
                <div>
                  <h4 className="font-bold text-white">Interactive Countdown Sprints</h4>
                  <p className="text-sm text-slate-450 font-light">A clear visual timer with dynamic prompts reminding you to re-center attention.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-forest-800 text-limeAccent-400 font-bold flex items-center justify-center text-xs shrink-0 mt-1">3</div>
                <div>
                  <h4 className="font-bold text-white">Reflection and Re-Assessment</h4>
                  <p className="text-sm text-slate-450 font-light">Log your emotional status post-session to visualize immediate focus shift.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-forest-800 text-limeAccent-400 font-bold flex items-center justify-center text-xs shrink-0 mt-1">4</div>
                <div>
                  <h4 className="font-bold text-white">Unlock Live Analytics & Streaks</h4>
                  <p className="text-sm text-slate-450 font-light">Accumulate focus minutes, grow your streak, and view weekly attention score trends.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Preview Mock */}
          <div className="glass-card p-6 rounded-3xl shadow-2xl relative overflow-hidden border border-slate-700/30">
            <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded bg-limeAccent-400/10 text-limeAccent-400 font-semibold text-[10px] uppercase tracking-wider">Interface Demo</div>
            
            <div className="space-y-4">
              {/* Header mockup */}
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Focus Dashboard</div>
              </div>

              {/* Grid preview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-forest-900/50 p-4 rounded-2xl border border-slate-800/40">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Streak</span>
                  <p className="text-2xl font-extrabold text-limeAccent-400">12 Days</p>
                </div>
                <div className="bg-forest-900/50 p-4 rounded-2xl border border-slate-800/40">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Focus Score</span>
                  <p className="text-2xl font-extrabold text-white">88%</p>
                </div>
              </div>

              {/* Timer Preview */}
              <div className="py-8 flex flex-col items-center justify-center bg-forest-950/40 rounded-2xl border border-slate-800/30 relative">
                <div className="w-32 h-32 rounded-full border-4 border-slate-850 flex items-center justify-center relative glow-timer">
                  <span className="text-3xl font-mono font-bold text-white">24:59</span>
                  <span className="absolute bottom-4 text-[9px] uppercase tracking-widest font-bold text-limeAccent-400">Deep Focus</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-4 italic">"Maintain attention strictly on this one task."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECREATIONAL CONCEPT NOTICE & TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-limeAccent-400">Concept Recreation Disclaimer</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">What Our Concept Users Say</h2>
          <p className="text-slate-400 font-light mt-1 text-sm">
            Please note: FocusFlow is a concept recreation based on the public company profile of FocusFlow (previously MPYG) in Varanasi, UP. The feedback below reflects fictional demo profiles designed to demonstrate user-journey states.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <p className="text-sm text-slate-350 italic font-light">
              "The structured Pomodoro timer combined with pre-session breathing exercises drastically reduced my daily mental fatigue. I can lock into coding for hours."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-forest-800 flex items-center justify-center font-bold text-xs text-limeAccent-400">AR</div>
              <div>
                <h4 className="text-xs font-bold text-white">Aarav Raj</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Software Developer (Fictional User)</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <p className="text-sm text-slate-350 italic font-light">
              "I love the wellness AI coach. Whenever I feel scattered, it suggests a Calm Reset session or guides me through grounding techniques without being intrusive."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-forest-800 flex items-center justify-center font-bold text-xs text-limeAccent-400">SM</div>
              <div>
                <h4 className="text-xs font-bold text-white">Sneha Mishra</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Product Designer (Fictional User)</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <p className="text-sm text-slate-350 italic font-light">
              "Tracking my streaks and focus scores has gamified my daily mindfulness practices. FocusFlow makes brain training feel concrete and rewarding."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-forest-800 flex items-center justify-center font-bold text-xs text-limeAccent-400">VP</div>
              <div>
                <h4 className="text-xs font-bold text-white">Vikram Pandey</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Creative Lead (Fictional User)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden py-24 text-center px-6 border-t border-slate-800/10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full glow-spot-lime z-0" />
        
        <div className="max-w-2xl mx-auto relative z-10 space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Ready to Master Your Attention?</h2>
          <p className="text-slate-400 font-light max-w-lg mx-auto">
            Take control of your focus, increase your flow state, and experience premium mindfulness exercises tailored just for you.
          </p>
          <div className="pt-4">
            <Link
              to="/signup"
              id="footer-cta-button"
              className="inline-flex items-center gap-2 bg-limeAccent-400 hover:bg-limeAccent-300 text-forest-950 font-extrabold px-8 py-4 rounded-2xl text-base shadow-lg shadow-limeAccent-400/10 hover:shadow-limeAccent-400/20 transition-all duration-200 hover:-translate-y-0.5"
            >
              Start Free Focus Trial
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-forest-950 border-t border-slate-800/20 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-limeAccent-400 to-forest-500 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-forest-950" />
            </div>
            <div>
              <span className="font-bold text-slate-100">FocusFlow</span>
              <span className="block text-[8px] uppercase tracking-wider text-limeAccent-400 font-semibold -mt-1">Concept Recreation</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 max-w-md text-center md:text-right">
            Designed as a high-fidelity wellness portfolio concept inspired by wellness services in Varanasi, Uttar Pradesh. Fictional data model for demonstration. All rights reserved &copy; {new Date().getFullYear()}.
          </p>
        </div>
      </footer>
      
    </div>
  );
};

export default LandingPage;
