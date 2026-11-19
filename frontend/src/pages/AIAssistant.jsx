import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Info, 
  HelpCircle, 
  User, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your FocusFlow AI coach. I can help you select a meditation or focus session, explain focus techniques like Pomodoro, or offer mindfulness tips. How is your attention feeling today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    setError('');
    const userMessage = { role: 'user', content: text };
    
    // Optimistically update conversation
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const currentConversation = [...messages, userMessage];
      const res = await api.post('/ai/chat', { messages: currentConversation });

      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data.message]);
      }
    } catch (err) {
      console.error(err);
      setError('AI service is currently busy. Please try asking again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetText) => {
    handleSendMessage(presetText);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! Chat reset. Tell me what you are working on or what mood you are in, and I can suggest a cognitive re-centering exercise.'
      }
    ]);
    setError('');
  };

  const presets = [
    { label: 'Suggest a focus session', query: 'Suggest a focus session for me right now.' },
    { label: 'Explain Pomodoro technique', query: 'How does the Pomodoro technique train attention?' },
    { label: 'Give a reflection prompt', query: 'Give me a mindfulness reflection prompt to write down.' },
    { label: 'Explain attention residue', query: 'What is attention residue and how do I avoid it?' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] space-y-4 animate-fade-in selection:bg-limeAccent-400 selection:text-forest-950">
      
      {/* Header and disclaimer */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            AI Focus Coach
            <span className="px-2 py-0.5 rounded bg-limeAccent-400/10 text-limeAccent-400 text-[9px] font-extrabold uppercase tracking-wider">Beta</span>
          </h1>
          <p className="text-xs text-slate-400 font-light mt-1">
            Personalised productivity suggestions, technique tutorials, and meditative guidance.
          </p>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-slate-200 hover:bg-forest-800/20 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Chat
        </button>
      </div>

      {/* Fictional Disclaimer */}
      <div className="flex gap-3 p-4 rounded-2xl bg-forest-900/30 border border-slate-800/40 text-xs text-slate-450 leading-relaxed font-light">
        <Info className="w-5 h-5 shrink-0 text-limeAccent-400 mt-0.5" />
        <div>
          <p className="font-bold text-slate-300">Wellness Guidance Disclaimer</p>
          <p>
            FocusFlow AI Coach provides cognitive coaching and mindfulness strategies. It does not provide medical diagnoses, psychiatric therapy, or clinical treatment.
          </p>
        </div>
      </div>

      {/* CHAT DISPLAY PANELS */}
      <div className="flex-1 glass-card rounded-3xl p-5 overflow-y-auto flex flex-col gap-4 border border-slate-850">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div 
              key={idx} 
              className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                isUser 
                  ? 'bg-limeAccent-400 border-limeAccent-400/20 text-forest-950' 
                  : 'bg-forest-800 border-slate-700/50 text-limeAccent-400'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                isUser 
                  ? 'bg-forest-800 text-slate-100 rounded-tr-none border border-slate-700/30' 
                  : 'bg-forest-900/40 text-slate-250 rounded-tl-none border border-slate-850/50'
              }`}>
                {m.content}
              </div>
            </div>
          );
        })}

        {/* Typing loading bubble */}
        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-lg bg-forest-800 border border-slate-700/50 flex items-center justify-center text-limeAccent-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-forest-900/40 border border-slate-850/50 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-limeAccent-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-limeAccent-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-limeAccent-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-2 text-xs text-red-400 bg-red-950/20 rounded-xl border border-red-900/20 max-w-sm mx-auto">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK PRESET CHIPS BAR */}
      {messages.length === 1 && !loading && (
        <div className="flex flex-wrap gap-2 py-1">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(p.query)}
              className="text-xs font-medium text-slate-350 bg-forest-900/40 border border-slate-800 hover:border-limeAccent-400/45 hover:text-slate-100 px-3.5 py-2 rounded-xl transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* INPUT FORM BLOCK */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
        className="flex gap-2 relative"
      >
        <input
          type="text"
          placeholder="Ask about Pomodoro, flow states, or request a session suggestion..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 glass-input pl-4 pr-14"
          disabled={loading}
          id="chat-input-field"
        />
        <button
          type="submit"
          id="chat-submit-button"
          disabled={loading || !input.trim()}
          className="absolute right-2 top-2 p-2 rounded-lg bg-limeAccent-400 hover:bg-limeAccent-350 disabled:opacity-40 disabled:hover:bg-limeAccent-400 text-forest-950 transition-all"
        >
          <Send className="w-4 h-4 fill-forest-950" />
        </button>
      </form>

    </div>
  );
};

export default AIAssistant;
