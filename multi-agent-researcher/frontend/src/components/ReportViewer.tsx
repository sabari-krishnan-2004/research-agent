import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  CheckCircle2, 
  CircleDot 
} from 'lucide-react';

interface ReportViewerProps {
  report: string;
  isGenerating: boolean;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ report, isGenerating }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopy = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleCopyCode = async (codeText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research_report_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Custom components to override default markdown element styling (Restrained Monochrome)
  const customRenderers = {
    h1: ({ ...props }) => <h1 className="text-lg font-black border-b border-white/10 pb-3 mt-7 mb-4 text-white tracking-tight uppercase" {...props} />,
    h2: ({ ...props }) => <h2 className="text-sm font-black mt-6 mb-3 text-slate-100 tracking-wider uppercase border-l-2 border-white/30 pl-2.5" {...props} />,
    h3: ({ ...props }) => <h3 className="text-[11px] font-bold mt-5 mb-2.5 text-slate-350 uppercase tracking-widest" {...props} />,
    p: ({ ...props }) => <p className="text-slate-400 leading-relaxed mb-4 text-[12px] font-medium" {...props} />,
    ul: ({ ...props }) => <ul className="list-disc pl-5 mb-4 text-[12px] text-slate-400 space-y-2" {...props} />,
    ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-4 text-[12px] text-slate-400 space-y-2" {...props} />,
    li: ({ ...props }) => <li className="pl-0.5" {...props} />,
    blockquote: ({ ...props }) => (
      <blockquote className="border-l-2 border-white/50 bg-white/[0.015] pl-4 pr-3 py-3.5 my-5 rounded-r-xl text-slate-350 text-[11.5px] italic leading-relaxed" {...props} />
    ),
    table: ({ ...props }) => (
      <div className="overflow-x-auto my-6 border border-white/5 rounded-xl shadow-lg">
        <table className="w-full text-left text-[11px] border-collapse" {...props} />
      </div>
    ),
    thead: ({ ...props }) => <thead className="bg-[#0c0c0c] border-b border-white/5 text-slate-200" {...props} />,
    tbody: ({ ...props }) => <tbody className="divide-y divide-white/5" {...props} />,
    tr: ({ ...props }) => <tr className="hover:bg-white/[0.005] transition-colors" {...props} />,
    th: ({ ...props }) => <th className="px-4 py-3 font-bold tracking-widest uppercase text-[9px] text-slate-300 border-none" {...props} />,
    td: ({ ...props }) => <td className="px-4 py-3 text-slate-350 border-none font-medium leading-relaxed" {...props} />,
    a: ({ ...props }) => (
      <a 
        className="text-white hover:text-slate-300 underline underline-offset-4 transition-colors font-bold inline-flex items-center gap-0.5 cursor-pointer" 
        target="_blank" 
        rel="noopener noreferrer" 
        {...props} 
      />
    ),
    code: ({ inline, className, children, ...props }: any) => {
      const codeString = String(children).replace(/\n$/, '');
      const uniqueIndex = React.useMemo(() => Math.floor(Math.random() * 100000), []);
      
      return inline ? (
        <code className="bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-white text-[10px] font-mono font-bold" {...props}>{children}</code>
      ) : (
        <div className="relative group my-5 rounded-xl border border-white/5 overflow-hidden">
          <div className="bg-[#080808] px-4 py-2 border-b border-white/5 text-[8px] font-bold text-slate-500 uppercase tracking-widest flex justify-between items-center select-none">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/30"></span>
              <span>Source Packet</span>
            </div>
            <button 
              onClick={() => handleCopyCode(codeString, uniqueIndex)}
              className="text-slate-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              {copiedCodeIndex === uniqueIndex ? (
                <>
                  <Check className="w-3 h-3 text-white" />
                  <span className="text-white">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-black p-4 font-mono text-[11px] overflow-x-auto text-slate-300 leading-relaxed scrollbar-none select-text">
            <code {...props}>{children}</code>
          </pre>
        </div>
      );
    }
  };

  return (
    <div className="glass-panel border border-white/5 rounded-2xl flex flex-col h-[560px] overflow-hidden shadow-2xl relative">
      {/* Background spotlight */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-white/[0.012] to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#080808]/80 z-10 select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white/5 text-white border border-white/10 shadow-inner">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xs font-black tracking-widest text-slate-350 uppercase">Research Report</h2>
            <p className="text-[10px] text-slate-550 font-medium">Synthesized result compiled by agents</p>
          </div>
        </div>

        {/* Tab Selector & Actions */}
        <div className="flex items-center gap-3.5">
          {report && (
            <div className="flex items-center gap-1 bg-black p-1 border border-white/5 rounded-xl text-[10px]">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1 cursor-pointer btn-micro-interact ${
                  activeTab === 'preview'
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'text-slate-500 hover:text-slate-200 border border-transparent'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Document
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1 cursor-pointer btn-micro-interact ${
                  activeTab === 'raw'
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'text-slate-500 hover:text-slate-200 border border-transparent'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                Source
              </button>
            </div>
          )}

          {report && (
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl bg-black hover:bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white transition-all duration-300 cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest shadow-md btn-micro-interact"
                title="Copy markdown content"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span className="text-white">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="px-3.5 py-2 rounded-xl bg-black hover:bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white transition-all duration-300 cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest shadow-md btn-micro-interact"
                title="Download markdown file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar z-10 markdown-body">
        {report ? (
          activeTab === 'preview' ? (
            <div className="prose prose-invert max-w-none leading-relaxed tracking-normal font-sans text-slate-450 animate-fade-in select-text">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={customRenderers}>
                {report}
              </ReactMarkdown>
              {isGenerating && (
                <span className="inline-block w-2.5 h-4 ml-1.5 bg-white animate-pulse align-middle rounded-sm"></span>
              )}
            </div>
          ) : (
            <pre className="font-mono-terminal text-[11px] leading-relaxed text-slate-350 whitespace-pre-wrap select-text bg-black/45 p-4 border border-white/5 rounded-xl animate-fade-in">
              {report}
            </pre>
          )
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 py-16 select-none">
            {isGenerating ? (
              /* High-fidelity visual progress stepper during generation */
              <div className="flex flex-col items-center max-w-sm w-full gap-5 animate-pulse">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <p className="text-[9px] uppercase font-bold tracking-widest text-white">System Synthesizing Report...</p>
                </div>
                
                {/* Stepper items */}
                <div className="w-full flex flex-col gap-3.5 bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner text-[10px] uppercase tracking-widest">
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <div className="flex-1 font-bold">1. Supervisor Deconstruction</div>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CircleDot className="w-4 h-4 animate-spin text-white" />
                    <div className="flex-1 font-black">2. Scraping Deep Web</div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-650">
                    <div className="w-4 h-4 rounded-full border border-slate-800 flex items-center justify-center text-[9px] font-bold">3</div>
                    <div className="flex-1 font-semibold">3. Critic Coverage Review</div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-650">
                    <div className="w-4 h-4 rounded-full border border-slate-800 flex items-center justify-center text-[9px] font-bold">4</div>
                    <div className="flex-1 font-semibold">4. Synthesis Compilation</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <FileText className="w-10 h-10 text-slate-800 opacity-40 animate-pulse" />
                <p className="text-[9px] uppercase tracking-widest font-black text-slate-650 text-center max-w-xs leading-relaxed">Submit a query in the console to synthesize report</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportViewer;
