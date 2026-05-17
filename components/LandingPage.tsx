import React from 'react';
import { ArrowRight, Box, Layers, Code, Cpu, Sparkles, FileText, Settings } from 'lucide-react';
import { Button } from './Button';

interface LandingPageProps {
  onStartProject: () => void;
  onStartAlgo: () => void;
  onOpenSettings?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartProject, onStartAlgo, onOpenSettings }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-50 overflow-hidden font-sans">

      {/* Background Doodles */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none bg-grid"></div>

      {/* Settings Button - Top Right */}
      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          className="absolute top-6 right-6 z-20 p-3 bg-white border-2 border-black rounded-xl shadow-comic-sm hover:shadow-comic hover:-translate-y-1 transition-all group"
          title="Configure API (OpenRouter)"
        >
          <Settings size={20} className="text-black group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center text-center max-w-6xl px-6 animate-fade-in-up">

        {/* Badge */}
        <div className="mb-8 px-4 py-2 bg-comic-yellow border-2 border-black rounded-full shadow-comic-sm flex items-center gap-2 transform -rotate-2 hover:rotate-0 transition-transform">
          <Sparkles size={16} className="text-black" />
          <span className="text-xs font-bold uppercase tracking-widest text-black">New: Automated Reports</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-black mb-6 drop-shadow-sm">
          Code<span className="text-blue-500">Flow</span>
        </h1>

        <p className="text-xl text-slate-600 max-w-3xl font-medium mb-12 leading-relaxed">
          Analyze your entire codebase instantly with <span className="bg-comic-purple px-1 border border-black rounded shadow-[2px_2px_0px_black] text-black -rotate-1 inline-block mx-1 font-bold">Gemini AI</span>.
          Upload a ZIP to visualize complex logic with <span className="bg-comic-blue px-1 border border-black rounded shadow-[2px_2px_0px_black] text-black rotate-1 inline-block mx-1 font-bold">Interactive Flowcharts</span> 
          and generate deep architectural insights.
        </p>

        {/* Split Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-16">
          {/* Card 1: Project Viz */}
          <div
            onClick={onStartProject}
            className="group relative h-80 bg-white border-2 border-black rounded-2xl p-8 cursor-pointer shadow-comic transition-all duration-300 hover:shadow-comic-hover hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-32 bg-comic-blue rounded-full blur-2xl -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform"></div>

            <div className="relative z-10 text-left">
              <div className="w-14 h-14 bg-black text-white rounded-xl flex items-center justify-center mb-6 shadow-md rotate-3 group-hover:rotate-6 transition-transform">
                <FileText size={28} />
              </div>
              <h2 className="text-3xl font-black text-black mb-2 uppercase italic tracking-tighter">AI Report</h2>
              <p className="text-sm text-slate-500 font-bold leading-tight">Extract a ZIP archive and let Gemini analyze your files, connections, and logic flow automatically.</p>
            </div>

            <div className="flex items-center text-black text-sm font-bold group-hover:translate-x-2 transition-transform bg-white w-fit px-4 py-2 rounded-full border-2 border-black shadow-comic-sm">
              ANALYZE CODE <ArrowRight size={14} className="ml-2" />
            </div>
          </div>

          {/* Card 2: Algo Viz */}
          <div
            onClick={onStartAlgo}
            className="group relative h-80 bg-white border-2 border-black rounded-2xl p-8 cursor-pointer shadow-comic transition-all duration-300 hover:shadow-comic-hover hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 p-32 bg-comic-pink rounded-full blur-2xl -ml-10 -mb-10 opacity-50 group-hover:scale-110 transition-transform"></div>

            <div className="relative z-10 text-left">
              <div className="w-14 h-14 bg-white border-2 border-black text-black rounded-xl flex items-center justify-center mb-6 shadow-md -rotate-3 group-hover:-rotate-6 transition-transform">
                <Cpu size={28} />
              </div>
              <h2 className="text-3xl font-black text-black mb-2 uppercase italic tracking-tighter">Algo Lab</h2>
              <p className="text-sm text-slate-500 font-bold leading-tight">Master CS fundamentals with interactive visualizations for sorting, graphs, and search algorithms.</p>
            </div>

            <div className="flex items-center text-black text-sm font-bold group-hover:translate-x-2 transition-transform bg-white w-fit px-4 py-2 rounded-full border-2 border-black shadow-comic-sm">
              EXPLORE ALGORITHMS <ArrowRight size={14} className="ml-2" />
            </div>
          </div>
        </div>

        {/* Attribution Footer */}
        <div className="flex flex-col items-center gap-2 mb-8 animate-bounce-in">
          <div className="h-[2px] w-12 bg-black mb-2"></div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Built on</span>
          <span className="text-sm font-black uppercase tracking-[0.1em] text-black">Google AI Studio</span>
        </div>

      </div>
    </div>
  );
};