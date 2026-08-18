import React, { useState } from 'react';
import { Search, Loader2, Sparkles, AlertCircle, CheckCircle, Terminal } from 'lucide-react';
import type { AgentNodeName } from '../types/agent';

interface ResearchConsoleProps {
  onSearch: (query: string) => void;
  isGenerating: boolean;
  activeNode: AgentNodeName | null;
  error: string | null;
  hasReport: boolean;
}

const PRESETS = [
  "Post-Quantum Cryptography standards & developments (2026)",
  "Breakthroughs in room-temperature superconducting materials",
  "State of commercial Fusion energy reactors & investments",
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

  const selectPreset = (preset: string) => {
    if (isGenerating) return;
    setQuery(preset);
    onSearch(preset);
  };

  // Determine system status text & colors
  let statusBadge = (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-700">
      <span className="h-2 w-2 rounded-full bg-slate-500"></span>
      Idle
    </div>
  );

  if (isGenerating) {
    statusBadge = (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-400 text-xs font-semibold border border-cyan-800 animate-pulse">
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
        Agents Active: {activeNode ? activeNode.toUpperCase() : 'COORDINATING'}
      </div>
    );
  } else if (error) {
    statusBadge = (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 text-red-400 text-xs font-semibold border border-red-800">
        <AlertCircle className="w-3.5 h-3.5" />
        Failed
      </div>
    );
  } else if (hasReport) {
    statusBadge = (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 text-xs font-semibold border border-emerald-800">
        <CheckCircle className="w-3.5 h-3.5" />
        Complete
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Research Console
          </h1>
        </div>
        {statusBadge}
      </div>

      <form onSubmit={handleSubmit} className="relative flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your research topic or query..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl text-slate-200 placeholder-slate-500 outline-none transition-all shadow-inner"
            disabled={isGenerating}
          />
        </div>
        <button
          type="submit"
          disabled={isGenerating || !query.trim()}
          className={`px-6 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-300 ${
            isGenerating || !query.trim()
              ? 'bg-slate-800 text-slate-500 border border-slate-750 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
              Running...
            </>
          ) : (
            <>
              <Terminal className="w-4 h-4" />
              Search
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-950/30 border border-red-900/60 rounded-xl flex gap-3 items-start text-xs text-red-400 leading-normal animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Execution Failed</span>
            {error}
          </div>
        </div>
      )}

      {!isGenerating && !hasReport && (
        <div className="mt-6 animate-fadeIn">
          <h4 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Suggested Topics</h4>
          <div className="flex flex-col gap-2">
            {PRESETS.map((preset, index) => (
              <button
                key={index}
                onClick={() => selectPreset(preset)}
                className="text-left text-xs text-slate-400 hover:text-cyan-400 bg-slate-950/40 hover:bg-slate-900 border border-slate-850 hover:border-cyan-900/50 p-3 rounded-lg cursor-pointer transition-all duration-200 truncate"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default ResearchConsole;
