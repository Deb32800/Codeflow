import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { ChatMessage, ApiConfig } from '../types';
import { explainCodeSnippet } from '../services/geminiService';

interface ChatPanelProps {
  contextCode: string;
  contextLabel: string;
  onClose: () => void;
  apiConfig?: ApiConfig;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ contextCode, contextLabel, onClose, apiConfig }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial Explanation
    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const explanation = await explainCodeSnippet(contextCode, contextLabel, apiConfig);
        setMessages([
          { role: 'model', text: `Hi! I see you're looking at "${contextLabel}". Here's the scoop:` },
          { role: 'model', text: explanation }
        ]);
      } catch (e: any) {
        setMessages([
          { role: 'model', text: `⚠️ API Error: ${e.message || 'Could not get explanation'}. Try configuring OpenRouter API key.` }
        ]);
      }
      setIsLoading(false);
    };
    if (contextCode) fetchInitial();
  }, [contextCode, contextLabel, apiConfig]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simple echo logic for now, in a real app this would call Gemini again with history
    // Since we only have the single-turn helper, let's just do a generic response or reuse the service
    // For this demo, let's just ask Gemini again with the user question + code context
    try {
      const response = await explainCodeSnippet(contextCode + `\n\nUser Question: ${input}`, contextLabel, apiConfig);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I got disconnected! Check your API configuration." }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="absolute top-0 right-0 h-full w-[400px] bg-white border-l-2 border-black flex flex-col z-[60] shadow-2xl animate-fade-in font-sans">

      {/* Header */}
      <div className="h-14 px-4 bg-comic-yellow border-b-2 border-black flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <span className="font-black text-sm uppercase tracking-wider">Tutor Chat</span>
        </div>
        <button onClick={onClose} className="hover:bg-black/10 p-1.5 rounded-full transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Code Context Preview */}
      <div className="bg-slate-50 border-b-2 border-black p-3">
        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Discussing Code</div>
        <div className="bg-black rounded p-2 overflow-hidden">
          <code className="text-[10px] text-comic-green font-mono whitespace-pre block truncate">
            {contextCode}
          </code>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`
                    w-8 h-8 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0
                    ${msg.role === 'model' ? 'bg-comic-blue' : 'bg-comic-pink'}
                `}>
              {msg.role === 'model' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className={`
                    max-w-[80%] p-3 rounded-xl border-2 border-black text-xs font-medium shadow-comic-sm
                    ${msg.role === 'model' ? 'bg-white' : 'bg-black text-white'}
                `}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-comic-blue rounded-full border-2 border-black flex items-center justify-center">
              <Bot size={14} />
            </div>
            <div className="bg-white px-4 py-3 rounded-xl border-2 border-black flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t-2 border-black">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about this code..."
            className="flex-1 border-2 border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:shadow-comic-sm transition-shadow"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-black text-white p-2 rounded-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
