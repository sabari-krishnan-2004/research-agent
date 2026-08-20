import React, { useEffect, useRef, useState } from 'react';
import { 
  Terminal, 
  BrainCircuit, 
  RefreshCw, 
  Search, 
  Cpu, 
  HelpCircle, 
  Activity, 
  ChevronRight, 
  ShieldAlert, 
  FileText, 
  ShieldCheck, 
  SearchIcon
} from 'lucide-react';
import useAgentStream from './hooks/useAgentStream';
import AgentCanvas from './components/AgentCanvas';
import ResearchConsole from './components/ResearchConsole';
import ReportViewer from './components/ReportViewer';
import LandingPage from './components/LandingPage';

export const App: React.FC = () => {
  const { state, runResearch, resetState } = useAgentStream();
  const terminalEndRef = useRef<HTMLDivElement>(null);
  
  // Routing view state
  const [view, setView] = useState<'landing' | 'workspace'>('landing');

  // Log filtering states
  const [logFilter, setLogFilter] = useState<'all' | 'agents' | 'errors'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-scroll logs terminal drawer when new outputs arrive
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.logs]);

  // Helper to parse and style agent logs with modern cybernetic styling
  const getAgentStyles = (msg: string) => {
    const lower = msg.toLowerCase();
    if (lower.includes('supervisor')) {
      return { 
        border: 'border-white/10 hover:border-white/20', 
        bg: 'bg-white/[0.02]', 
        text: 'text-slate-100', 
        tag: 'Supervisor',
        icon: BrainCircuit,
        accent: 'bg-white/80'
      };
    }
    if (lower.includes('researcher')) {
      return { 
        border: 'border-white/10 hover:border-white/20', 
        bg: 'bg-white/[0.02]', 
        text: 'text-slate-200', 
        tag: 'Researcher',
        icon: SearchIcon,
        accent: 'bg-slate-400'
      };
    }
    if (lower.includes('critic')) {
      return { 
        border: 'border-white/10 hover:border-white/20', 
        bg: 'bg-white/[0.02]', 
        text: 'text-slate-200', 
        tag: 'Critic Node',
        icon: ShieldCheck,
        accent: 'bg-zinc-400'
      };
    }
    if (lower.includes('synthesizer')) {
      return { 
        border: 'border-white/10 hover:border-white/20', 
        bg: 'bg-white/[0.02]', 
        text: 'text-slate-250', 
        tag: 'Synthesizer',
        icon: FileText,
        accent: 'bg-neutral-300'
      };
    }
    return null;
  };

  // Filter logs based on type and search query
  const filteredLogs = state.logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (logFilter === 'errors') {
      return log.message.toLowerCase().includes('error') || log.message.toLowerCase().includes('fail') || log.event === 'error';
    }
    
    if (logFilter === 'agents') {
      return log.message.startsWith('Agent Node [') || getAgentStyles(log.message) !== null;
    }
    
    return true;
  });

  if (view === 'landing') {
    return <LandingPage onLaunch={() => setView('workspace')} />;
  }

  return (
    <div className="min-h-screen bg-[#030303] text-[#fafafa] flex flex-col font-sans select-none cyber-grid overflow-hidden">
      {/* Light Blooms for premium aesthetic */}
      <div className="light-bloom-left" />
      <div className="light-bloom-right" />

      {/* Header bar */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#030303]/60 backdrop-blur-xl sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3.5 cursor-pointer select-none group" onClick={() => setView('landing')}>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-105 transition-all duration-300 group-hover:border-white/20 shadow-inner">
            <BrainCircuit className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-2 group-hover:text-white/90 transition-colors">
              Autonomous Research Engine
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/10 tracking-normal">SWARM</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">Multi-Agent Orchestrator v1.0.0</p>
          </div>
        </div>

        {/* Telemetry Dashboard Header (System Health) */}
        <div className="hidden lg:flex items-center gap-8 text-[11px] text-slate-400 border-x border-white/5 px-8 mx-6 py-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">API Status</span>
            <span className="text-white font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-white absolute"></span>
              ONLINE
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Scraping Node</span>
            <span className="text-white font-semibold flex items-center gap-1">
              <span className="h-1 w-1.5 bg-white/40 rounded-sm"></span>
              TAVILY ACTIVE
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Execution Engine</span>
            <span className="text-white font-semibold flex items-center gap-1">
              <Cpu className="w-3 h-3 text-slate-400" />
              4 CORE TOPOLOGY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Global Reset State Button */}
          {(state.logs.length > 0 || state.finalReport) && (
            <button
              onClick={resetState}
              disabled={state.isGenerating}
              className={`px-3.5 py-2 rounded-xl border text-[11px] font-bold flex items-center gap-2 transition-all duration-300 shadow-sm btn-micro-interact ${
                state.isGenerating
                  ? 'bg-slate-950/20 border-white/5 text-slate-600 cursor-not-allowed'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-200 hover:text-white cursor-pointer'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${state.isGenerating ? '' : 'hover:rotate-180 transition-transform duration-700'}`} />
              Reset System
            </button>
          )}

          {/* Active status pulse */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold shadow-inner">
            <span className={`h-2 w-2 rounded-full ${state.isGenerating ? 'bg-white animate-pulse shadow-[0_0_8px_#fff]' : 'bg-white/20'}`} />
            <span className={`uppercase tracking-widest text-[10px] ${state.isGenerating ? 'text-white font-extrabold' : 'text-slate-500'}`}>
              {state.isGenerating ? 'Orchestration Active' : 'Orchestrator Idle'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-8 max-w-[1800px] w-full mx-auto z-10 overflow-y-auto">
        {/* Left Section (2/3 width) - Panel Console, Map and Viewer */}
        <section className="lg:col-span-2 flex flex-col gap-6 animate-fade-in">
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
        <section className="flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl h-[600px] lg:h-auto border border-white/5 max-h-[calc(100vh-140px)]">
          {/* Terminal Header */}
          <div className="px-5 py-4 border-b border-white/5 bg-[#080808]/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-white/5 text-white border border-white/10">
                <Terminal className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold tracking-widest uppercase text-slate-350">System Logs Terminal</h2>
            </div>
            <div className="flex items-center gap-1.5 text-[8px] text-slate-400 font-bold uppercase tracking-widest bg-white/5 px-2.5 py-1.5 border border-white/5 rounded-lg">
              <Activity className="w-3 h-3 text-white animate-pulse" />
              Telemetry
            </div>
          </div>

          {/* Terminal Controls (Search & Filter Tabs) */}
          <div className="px-4 py-3.5 bg-[#030303]/50 border-b border-white/5 flex flex-col gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter logs by keyword..."
                className="w-full pl-10 pr-3 py-2 bg-black border border-white/5 focus:border-white/20 focus:ring-1 focus:ring-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-650 outline-none transition-all duration-300 font-medium"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-1.5 text-[10px]">
              <button
                onClick={() => setLogFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  logFilter === 'all' 
                    ? 'bg-white/10 text-white border border-white/15' 
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                All Logs ({state.logs.length})
              </button>
              <button
                onClick={() => setLogFilter('agents')}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  logFilter === 'agents' 
                    ? 'bg-white/10 text-white border border-white/15' 
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Agent Nodes
              </button>
              <button
                onClick={() => setLogFilter('errors')}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  logFilter === 'errors' 
                    ? 'bg-white/10 text-white border border-white/15' 
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Errors
              </button>
            </div>
          </div>

          {/* Terminal Log Area */}
          <div className="flex-1 overflow-y-auto p-5 font-mono-terminal text-[11px] text-slate-300 bg-black/35 select-text leading-relaxed">
            {filteredLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-650 gap-3 py-24 select-none">
                {searchQuery ? (
                  <>
                    <HelpCircle className="w-8 h-8 opacity-30 text-slate-500 animate-pulse" />
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold">No matching packets found</p>
                  </>
                ) : (
                  <>
                    <Terminal className="w-8 h-8 opacity-30 text-slate-500 animate-pulse" />
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold">Awaiting orchestration telemetry...</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredLogs.map((log, index) => {
                  const isNodeLog = log.message.startsWith('Agent Node [');
                  const agentStyles = getAgentStyles(log.message);
                  
                  // Clean up standard tag labels for cleaner appearance
                  let displayMessage = log.message;
                  if (isNodeLog) {
                    displayMessage = log.message.replace('Agent Node [', '').replace(']', '');
                  }

                  const isError = log.message.toLowerCase().includes('error') || log.message.toLowerCase().includes('fail') || log.event === 'error';
                  const LogIcon = isError 
                    ? ShieldAlert 
                    : agentStyles 
                      ? agentStyles.icon 
                      : ChevronRight;

                  return (
                    <div 
                      key={index} 
                      className={`p-3 rounded-xl border transition-all duration-300 flex flex-col gap-1.5 glass-panel ${
                        isError
                          ? 'bg-red-950/5 border-red-900/20 text-red-200'
                          : agentStyles
                            ? `${agentStyles.bg} ${agentStyles.border} ${agentStyles.text}`
                            : isNodeLog
                              ? 'bg-white/5 border-white/10 text-white'
                              : 'bg-white/[0.01] border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[8px] font-bold tracking-widest select-none opacity-50 uppercase">
                        <div className="flex items-center gap-1.5">
                          <LogIcon className={`w-3.5 h-3.5 ${isError ? 'text-red-400' : 'text-slate-400'}`} />
                          {agentStyles ? (
                            <span className="flex items-center gap-1 font-bold">
                              {agentStyles.tag}
                            </span>
                          ) : isNodeLog ? (
                            <span className="font-bold">Pipeline Node</span>
                          ) : (
                            <span>System log</span>
                          )}
                        </div>
                        <span className="font-medium text-[8px]">{log.timestamp}</span>
                      </div>
                      
                      <div className="whitespace-pre-wrap break-words leading-relaxed select-text font-medium text-[11.5px] pl-5">
                        {displayMessage}
                      </div>
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
