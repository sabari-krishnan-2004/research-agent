import React, { useEffect, useRef } from 'react';
import { Terminal, BrainCircuit, RefreshCw, Layers } from 'lucide-react';
import useAgentStream from './hooks/useAgentStream';
import AgentCanvas from './components/AgentCanvas';
import ResearchConsole from './components/ResearchConsole';
import ReportViewer from './components/ReportViewer';

export const App: React.FC = () => {
  const { state, runResearch, resetState } = useAgentStream();
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs terminal drawer when new outputs arrive
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.logs]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans select-none">
      {/* Header bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <BrainCircuit className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-wider text-slate-150 uppercase">Autonomous Research Engine</h1>
            <p className="text-[10px] text-slate-500 font-medium">Multi-Agent LangGraph Swarm v1.0.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Global Reset State Button */}
          {(state.logs.length > 0 || state.finalReport) && (
            <button
              onClick={resetState}
              disabled={state.isGenerating}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                state.isGenerating
                  ? 'bg-slate-950/20 border-slate-900 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-350'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset System
            </button>
          )}

          {/* Active status pulse */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-900 text-[11px] font-semibold">
            <span className={`h-2 w-2 rounded-full ${state.isGenerating ? 'bg-cyan-400 animate-ping' : 'bg-slate-550'}`} />
            <span className="text-slate-400 uppercase tracking-wider">{state.isGenerating ? 'Running Swarm' : 'Swarm Idle'}</span>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Left Section (2/3 width) - Panel Console, Map and Viewer */}
        <section className="lg:col-span-2 flex flex-col gap-6 pr-2">
          {/* Query input console */}
          <ResearchConsole
            onSearch={runResearch}
            isGenerating={state.isGenerating}
            activeNode={state.activeNode}
            error={state.error}
            hasReport={!!state.finalReport}
          />

          {/* Flow visual map */}
          <AgentCanvas
            activeNode={state.activeNode}
            completedNodes={state.completedNodes}
          />

          {/* Generated Markdown Report */}
          <ReportViewer 
            report={state.finalReport} 
            isGenerating={state.isGenerating} 
          />
        </section>

        {/* Right Section (1/3 width) - Execution terminal */}
        <section className="flex flex-col bg-slate-950/80 border border-slate-900/60 rounded-2xl overflow-hidden shadow-2xl h-[500px] lg:h-[1180px]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-900 bg-slate-950/50">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-slate-350">System Logs Terminal</h2>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider bg-slate-900/80 px-2.5 py-1 border border-slate-850 rounded-md">
              <Layers className="w-3.5 h-3.5 text-slate-650" />
              Live Events
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-slate-300 bg-slate-950/20 select-text leading-relaxed">
            {state.logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-650 gap-2">
                <Terminal className="w-8 h-8 opacity-40 animate-pulse" />
                <p className="text-[10px] uppercase tracking-widest">Listening for agent triggers...</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {state.logs.map((log, index) => {
                  // Prettify Agent names inside tags
                  let formattedMsg = log.message;
                  const isNodeLog = log.message.startsWith('Agent Node [');
                  
                  return (
                    <div 
                      key={index} 
                      className={`pb-1.5 border-b border-slate-900/20 flex gap-3.5 items-start ${
                        isNodeLog ? 'text-cyan-300/90 font-medium' : 'text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] text-indigo-500/70 font-semibold select-none flex-shrink-0 mt-0.5">{log.timestamp}</span>
                      <div className="flex-1 whitespace-pre-wrap break-all">{formattedMsg}</div>
                    </div>
                  );
                })}
                <div ref={terminalEndRef} />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
export default App;
