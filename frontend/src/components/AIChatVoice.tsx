import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, MessageSquare, Compass } from 'lucide-react';
import { sendChatMessage } from '../api';

interface AIChatVoiceProps {
  role: 'fan' | 'organizer';
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIChatVoice: React.FC<AIChatVoiceProps> = ({ role }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Welcome to Dallas Arena! I'm your MatchMate AI assistant. Ask me anything about transit, parking, concessions, washrooms, or safety.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'en-US';
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      rec.onerror = (err: any) => {
        console.error('Speech Recognition Error:', err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Voice toggle: start/stop listening
  const toggleListening = () => {
    if (!speechSupported) {
      // Simulate Speech Input with quick commands if browser doesn't support it
      const queries = [
        "Which gate is least busy right now?",
        "Where is the nearest food stall?",
        "How's the weather look for the next hour?",
        "Emergency guidance: where is medical station 2?"
      ];
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      handleSendMessage(randomQuery);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Text-To-Speech reader
  const speakText = (text: string) => {
    if (!ttsEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('TTS failed:', e);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // Add user message
    const userMsg: Message = {
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Fetch response from FastAPI proxy
      const data = await sendChatMessage(trimmed, role);
      const aiMsg: Message = {
        sender: 'ai',
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText(data.response);
    } catch (e) {
      const errorMsg: Message = {
        sender: 'ai',
        text: "I'm having trouble connecting to the stadium network. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel w-full h-[520px] rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="font-bold text-slate-200">MatchMate Assistant</h3>
            <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Gemini 1.5 Flash Connected
            </p>
          </div>
        </div>

        {/* TTS Toggle */}
        <button
          onClick={() => {
            if (!ttsEnabled) {
              setTtsEnabled(true);
            } else {
              setTtsEnabled(false);
              window.speechSynthesis.cancel();
            }
          }}
          className={`p-2 rounded-xl border transition-all ${
            ttsEnabled
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-350'
          }`}
          title={ttsEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}
        >
          {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-950/20">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto items-end animate-slide-up' : 'mr-auto items-start animate-slide-up'
            }`}
          >
            <div
              className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-500 text-white rounded-br-none shadow-md shadow-emerald-500/10'
                  : 'glass-panel text-slate-200 rounded-bl-none border-slate-800/80 shadow-md'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 mr-auto bg-slate-900/60 p-3 rounded-2xl rounded-bl-none border border-slate-800 animate-pulse text-xs text-slate-400 font-semibold">
            <Compass className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            Analyzing telemetry & drafting response...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Waveform Indicator */}
      {isListening && (
        <div className="px-5 py-2.5 bg-emerald-500/10 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Listening to voice query...</span>
          </div>
          {/* Waves animation */}
          <div className="flex gap-0.5 items-end h-3">
            <span className="w-0.5 bg-emerald-400 animate-bounce h-2" style={{ animationDelay: '0.1s' }} />
            <span className="w-0.5 bg-emerald-400 animate-bounce h-3" style={{ animationDelay: '0.3s' }} />
            <span className="w-0.5 bg-emerald-400 animate-bounce h-1" style={{ animationDelay: '0.5s' }} />
            <span className="w-0.5 bg-emerald-400 animate-bounce h-2.5" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      )}

      {/* Preset Action Recommendations */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-850 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          "Which gate is shortest wait?",
          "Are there Zone B parking spots?",
          "What food is available?",
          "Show me lost items"
        ].map((rec, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(rec)}
            className="whitespace-nowrap px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full text-xs border border-slate-800 font-medium transition-all"
          >
            {rec}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center gap-3"
      >
        <button
          type="button"
          onClick={toggleListening}
          className={`p-3.5 rounded-xl border transition-all ${
            isListening
              ? 'bg-red-500 text-white border-red-400 glow-red animate-pulse'
              : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
          title={isListening ? "Stop Listening" : "Ask by Voice"}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the stadium..."
          className="flex-1 bg-slate-900/80 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
        />

        <button
          type="submit"
          disabled={!input.trim()}
          className="p-3.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 border border-emerald-400/20 hover:bg-emerald-600 active:scale-95 disabled:bg-slate-900 disabled:border-slate-850 disabled:text-slate-600 disabled:shadow-none transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
