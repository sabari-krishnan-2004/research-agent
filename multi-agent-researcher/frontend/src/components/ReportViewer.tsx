import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Copy, Check, Download, AlertCircle } from 'lucide-react';

interface ReportViewerProps {
  report: string;
  isGenerating: boolean;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ report, isGenerating }) => {
  const [copied, setCopied] = useState(false);

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

  // Custom components to override default markdown element styling
  const customRenderers = {
    h1: ({ ...props }) => <h1 className="text-2xl font-extrabold border-b border-slate-800 pb-3 mt-8 mb-4 text-slate-100 tracking-tight" {...props} />,
    h2: ({ ...props }) => <h2 className="text-xl font-bold mt-7 mb-3 text-slate-100 tracking-tight" {...props} />,
    h3: ({ ...props }) => <h3 className="text-lg font-semibold mt-5 mb-2 text-slate-200" {...props} />,
    p: ({ ...props }) => <p className="text-slate-300 leading-relaxed mb-4 text-sm font-normal" {...props} />,
    ul: ({ ...props }) => <ul className="list-disc pl-6 mb-5 text-sm text-slate-350 space-y-2" {...props} />,
    ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-5 text-sm text-slate-350 space-y-2" {...props} />,
    li: ({ ...props }) => <li className="pl-1" {...props} />,
    blockquote: ({ ...props }) => (
      <blockquote className="border-l-4 border-cyan-500 bg-slate-900/60 pl-4 pr-2 py-2.5 my-4 rounded-r-lg text-slate-300 text-xs italic" {...props} />
    ),
    table: ({ ...props }) => (
      <div className="overflow-x-auto my-6 border border-slate-850 rounded-xl shadow-md">
        <table className="w-full text-left text-xs border-collapse" {...props} />
      </div>
    ),
    thead: ({ ...props }) => <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-200" {...props} />,
    tbody: ({ ...props }) => <tbody className="divide-y divide-slate-850/60 bg-slate-950/20" {...props} />,
    tr: ({ ...props }) => <tr className="hover:bg-slate-900/20 transition-colors" {...props} />,
    th: ({ ...props }) => <th className="px-4 py-3 font-semibold tracking-wider text-slate-200 border-none" {...props} />,
    td: ({ ...props }) => <td className="px-4 py-3.5 text-slate-300 border-none font-normal leading-normal" {...props} />,
    a: ({ ...props }) => (
      <a 
        className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors font-medium inline-flex items-center gap-0.5 cursor-pointer" 
        target="_blank" 
        rel="noopener noreferrer" 
        {...props} 
      />
    ),
    code: ({ inline, className, children, ...props }: any) => {
      return inline ? (
        <code className="bg-slate-850 px-1.5 py-0.5 rounded text-cyan-400 text-xs font-mono font-medium" {...props}>{children}</code>
      ) : (
        <pre className="bg-slate-950/90 p-4 rounded-xl border border-slate-850 font-mono text-xs overflow-x-auto my-4 text-slate-300 leading-normal scrollbar-none">
          <code {...props}>{children}</code>
        </pre>
      );
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col h-[520px] overflow-hidden backdrop-blur-md shadow-lg">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/10">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold tracking-wide text-slate-200 uppercase">Research Report</h2>
        </div>
        {report && (
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-medium"
              title="Copy markdown content"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
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
              className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-medium"
              title="Download markdown file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        )}
      </div>

      {/* Content scroll area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
        {report ? (
          <div className="prose prose-invert max-w-none prose-sm leading-relaxed tracking-normal font-sans">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={customRenderers}>
              {report}
            </ReactMarkdown>
            {isGenerating && (
              <span className="inline-block w-2.5 h-4 ml-1 bg-cyan-400 animate-pulse align-middle rounded-sm"></span>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2 animate-pulse">
                <FileText className="w-12 h-12 text-slate-700 animate-bounce" />
                <p className="text-xs">Agents are collecting facts and drafting report...</p>
              </div>
            ) : (
              <>
                <AlertCircle className="w-12 h-12 text-slate-800" />
                <p className="text-xs">Submit a query above to begin synthesis.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default ReportViewer;
