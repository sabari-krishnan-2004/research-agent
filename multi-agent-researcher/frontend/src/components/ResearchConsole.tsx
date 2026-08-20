import React, { useState } from 'react';
import { 
  Search, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  Terminal, 
  LockKeyhole, 
  Flame, 
  Atom, 
  ChevronRight 
} from 'lucide-react';
import type { AgentNodeName } from '../types/agent';

interface ResearchConsoleProps {
  onSearch: (query: string) => void;
  isGenerating: boolean;
  activeNode: AgentNodeName | null;
  error: string | null;
  hasReport: boolean;
}

const PRESETS = [
  {
    title: "Post-Quantum Cryptography",
    desc: "NIST standards, lattice-based algorithms, and commercial developments in 2026.",
    query: "Post-Quantum Cryptography standards & developments (2026)",
    icon: LockKeyhole
  },
  {
    title: "Room-Temp Superconductors",
    desc: "Recent breakthrough claims, peer reviews, materials syntax, and verified labs.",
    query: "Breakthroughs in room-temperature superconducting materials",
    icon: Atom
  },
  {
    title: "Commercial Fusion Energy",
    desc: "Investments, magnetic confinement advances, helium-3 physics, and prototype timelines.",
    query: "State of commercial Fusion energy reactors & investments",
    icon: Flame
  }
];

export const ResearchConsole: React.FC<ResearchConsoleProps> = ({
  onSearch,
  isGenerating,
  activeNode,
  error,
  hasReport,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isGenerating) return;
    onSearch(query);
  };

  const selectPreset = (presetQuery: string) => {
    if (isGenerating) return;
    setQuery(presetQuery);
    onSearch(presetQuery);
  };

  // Determine system status text & colors (restrained monochrome and subtle silver badges)
  let statusBadge = (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] text-slate-400 text-[10px] font-bold border border-white/5 shadow-inner uppercase tracking-wider">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
      System Idle
    </div>
  );

  if (isGenerating) {
    statusBadge = (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-white text-[10px] font-bold border border-white/20 shadow-md animate-pulse uppercase tracking-wider">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
        <span className="h-1.5 w-1.5 rounded-full bg-white absolute"></span>
        <span>Orchestrator: <span className="font-extrabold text-white">{activeNode ? activeNode : 'Planning'}</span></span>
      </div>
    );
  } else if (error) {
    statusBadge = (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-red-400 text-[10px] font-bold border border-red-500/10 uppercase tracking-wider">
        <AlertCircle className="w-3.5 h-3.5 text-red-400 animate-bounce" />
        Failed Execution
      </div>
    );
  } else if (hasReport) {
    statusBadge = (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-white text-[10px] font-bold border border-white/10 uppercase tracking-wider">
        <CheckCircle className="w-3.5 h-3.5 text-white/80" />
        Complete
      </div>
    );
  }

  return (
    <div className="glass-panel border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
      {/* Background visual spotlight */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-white/[0.025] to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white/5 text-white border border-white/10 shadow-inner">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xs font-black tracking-widest uppercase text-white">Research Console</h2>
            <p className="text-[10px] text-slate-500 font-medium">Define your objective and coordinate nodes</p>
          </div>
        </div>
        {statusBadge}
      </div>

      <form onSubmit={handleSubmit} className="relative flex gap-3 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your research topic or query..."
            className="w-full pl-11 pr-4 py-3.5 bg-black border border-white/5 focus:border-white/20 focus:ring-1 focus:ring-white/10 rounded-xl text-slate-200 placeholder-slate-600 outline-none transition-all duration-300 shadow-inner font-medium text-xs tracking-wide"
            disabled={isGenerating}
          />
        </div>
        <button
          type="submit"
          disabled={isGenerating || !query.trim()}
          className={`px-5 rounded-xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all duration-300 shadow-md btn-micro-interact ${
            isGenerating || !query.trim()
              ? 'bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed'
              : 'bg-white hover:bg-slate-200 text-black border border-white cursor-pointer'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
              <span>Running</span>
            </>
          ) : (
            <>
              <Terminal className="w-3.5 h-3.5 text-black" />
              <span>Submit</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-950/5 border-l-2 border-red-500/40 border-y border-r border-white/5 rounded-r-xl flex gap-3.5 items-start text-xs text-red-200 leading-normal animate-fade-in relative z-10">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <span className="font-extrabold uppercase tracking-widest text-[9px] block mb-1 text-white">Execution Error</span>
            {error}
          </div>
        </div>
      )}

      {!isGenerating && !hasReport && (
        <div className="mt-6 animate-fade-in relative z-10">
          <h4 className="text-[9px] uppercase tracking-widest text-slate-500 font-black mb-3.5 flex items-center gap-2">
            <Terminal className="w-3 h-3 text-slate-400" />
            Suggested Templates
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRESETS.map((preset, index) => {
              const IconComponent = preset.icon;
              return (
                <button
                  key={index}
                  onClick={() => selectPreset(preset.query)}
                  className="text-left bg-black hover:bg-white/[0.01] border border-white/5 hover:border-white/15 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg group flex flex-col justify-between h-full btn-micro-interact"
                >
                  <div className="w-full">
                    <div className="flex justify-between items-start mb-2.5">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-350 group-hover:text-white group-hover:bg-white/10 transition-colors">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-650 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <span className="text-[11.5px] font-extrabold text-slate-200 group-hover:text-white transition-colors block mb-1.5">
                      {preset.title}
                    </span>
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors line-clamp-2 leading-relaxed">
                      {preset.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchConsole;
