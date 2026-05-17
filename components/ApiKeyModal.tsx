import React, { useState, useEffect } from 'react';
import { ApiConfig, OpenRouterModel } from '../types';
import { OPENROUTER_MODELS as FALLBACK_MODELS } from '../constants';
import { fetchOpenRouterModels } from '../services/openRouterService';
import { Key, AlertTriangle, Check, ExternalLink, Sparkles, Zap, Brain, Settings, RefreshCw, Server } from 'lucide-react';

interface ApiKeyModalProps {
  onSave: (config: ApiConfig) => void;
  onCancel: () => void;
  isSetup?: boolean; // true = upfront setup, false = quota exceeded
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onCancel, isSetup = false }) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadModels = async () => {
        setIsLoadingModels(true);
        setError(null);
        try {
            const fetched = await fetchOpenRouterModels();
            if (mounted) {
                if (fetched.length > 0) {
                    setModels(fetched);
                    setSelectedModel(fetched[0].id);
                } else {
                    // Fallback to constants if API returns nothing but doesn't throw
                    setFallback();
                }
            }
        } catch (e) {
            if (mounted) setFallback();
        } finally {
            if (mounted) setIsLoadingModels(false);
        }
    };

    const setFallback = () => {
         // Convert constants to OpenRouterModel shape for compatibility
         const mapped = FALLBACK_MODELS.map(m => ({
             id: m.id,
             name: m.name,
             description: (m as any).desc,
             pricing: { prompt: '0', completion: '0' },
             context_length: 0
         }));
         setModels(mapped);
         setSelectedModel(mapped[0].id);
    };

    loadModels();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSave({
        provider: 'openrouter',
        apiKey: apiKey.trim(),
        model: selectedModel
      });
    }
  };

  const getModelTierIcon = (id: string) => {
      if (id.includes('gemini') || id.includes('flash')) return <Sparkles size={14} className="text-yellow-600"/>;
      if (id.includes('deepseek') || id.includes('r1') || id.includes('llama')) return <Brain size={14} className="text-purple-600"/>;
      return <Zap size={14} className="text-blue-600"/>;
  };

  const getModelTierColor = (id: string) => {
      if (id.includes('gemini') || id.includes('flash')) return 'bg-yellow-100 text-yellow-700';
      if (id.includes('deepseek') || id.includes('r1') || id.includes('llama')) return 'bg-purple-100 text-purple-700';
      return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg border-2 border-black rounded-2xl shadow-comic p-8 relative max-h-[90vh] flex flex-col">

        {/* Header Icon */}
        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 border-2 border-black rounded-full flex items-center justify-center shadow-md ${isSetup ? 'bg-comic-blue' : 'bg-comic-yellow animate-bounce'}`}>
          {isSetup ? <Settings size={32} className="text-black" /> : <AlertTriangle size={32} className="text-black" />}
        </div>

        <div className="mt-8 text-center shrink-0">
          <h2 className="text-2xl font-black text-black mb-2">
            {isSetup ? 'Configure API' : 'Quota Exceeded!'}
          </h2>
          <p className="text-sm text-gray-500 font-medium mb-6">
            {isSetup
              ? <>Use <span className="font-bold text-black">OpenRouter</span> to access free AI models.</>
              : <>The Gemini API hit its limit. Switch to <span className="font-bold text-black">OpenRouter</span> to continue.</>
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col min-h-0">
          <div className="shrink-0">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">OpenRouter API Key</label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-..."
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>
            <div className="mt-1 text-[10px] text-right">
              <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center justify-end gap-1">
                Get a Free Key <ExternalLink size={10} />
              </a>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Free Model</label>
                {isLoadingModels && <div className="flex items-center gap-1 text-[10px] text-blue-500"><RefreshCw size={10} className="animate-spin"/> Fetching...</div>}
            </div>
            
            <div className="grid gap-2 overflow-y-auto pr-1 custom-scrollbar border-2 border-slate-100 rounded-lg p-1">
              {isLoadingModels && models.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                      <Server size={24} className="opacity-20"/>
                      <span>Fetching available models...</span>
                  </div>
              ) : (
                models.map(m => (
                    <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`w-full text-left p-3 rounded-md border-2 transition-all flex items-start gap-3 ${selectedModel === m.id
                        ? 'border-black bg-slate-50 shadow-comic-sm'
                        : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                        }`}
                    >
                    <div className={`p-1.5 rounded-lg shrink-0 ${getModelTierColor(m.id)}`}>
                        {getModelTierIcon(m.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-black flex items-center gap-2">
                        <span className="truncate">{m.name}</span>
                        {m.context_length > 0 && (
                            <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                                {(m.context_length / 1024).toFixed(0)}k
                            </span>
                        )}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate">{m.id}</div>
                    </div>
                    {selectedModel === m.id && (
                        <Check size={16} className="text-black flex-shrink-0 mt-1" />
                    )}
                    </button>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 font-bold text-sm text-gray-500 hover:bg-slate-100 rounded-xl transition-colors border-2 border-transparent hover:border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!apiKey || !selectedModel}
              className="flex-1 py-3 bg-black text-white font-bold text-sm rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.2)] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check size={16} /> {isSetup ? 'Save' : 'Save & Retry'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};