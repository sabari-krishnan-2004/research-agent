import { useState, useCallback } from 'react';
import type { AgentLog, AgentNodeName, StreamState } from '../types/agent';

export const useAgentStream = () => {
  const [state, setState] = useState<StreamState>({
    activeNode: null,
    completedNodes: [],
    logs: [],
    finalReport: '',
    isGenerating: false,
    error: null,
  });

  const resetState = useCallback(() => {
    setState({
      activeNode: null,
      completedNodes: [],
      logs: [],
      finalReport: '',
      isGenerating: false,
      error: null,
    });
  }, []);

  const runResearch = useCallback(async (query: string) => {
    resetState();
    setState(s => ({ ...s, isGenerating: true }));

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/api/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Readable stream is not supported by this browser.');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Retain the last unfinished line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            try {
              const data = JSON.parse(dataStr);
              
              if (data.event === 'node_start') {
                const node = data.node as AgentNodeName;
                setState(s => ({
                  ...s,
                  activeNode: node,
                  // Remove from completed nodes if we loop back to this node (e.g. Researcher)
                  completedNodes: s.completedNodes.filter(n => n !== node),
                }));
              } else if (data.event === 'node_end') {
                const node = data.node as AgentNodeName;
                setState(s => ({
                  ...s,
                  activeNode: s.activeNode === node ? null : s.activeNode,
                  completedNodes: [...new Set([...s.completedNodes, node])],
                }));
              } else if (data.event === 'token') {
                setState(s => ({
                  ...s,
                  finalReport: s.finalReport + data.text,
                }));
              } else if (data.event === 'complete') {
                setState(s => ({
                  ...s,
                  finalReport: data.final_report || s.finalReport,
                  isGenerating: false,
                  activeNode: null,
                }));
              } else if (data.event === 'log') {
                const newLog: AgentLog = {
                  message: data.message,
                  timestamp: data.timestamp,
                  event: data.event,
                };
                setState(s => ({
                  ...s,
                  logs: [...s.logs, newLog],
                }));
              } else if (data.event === 'error') {
                setState(s => ({
                  ...s,
                  error: data.message,
                  isGenerating: false,
                  activeNode: null,
                }));
              }
            } catch (err) {
              console.error('Failed to parse SSE JSON chunk:', dataStr, err);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Streaming error:', err);
      setState(s => ({
        ...s,
        error: err.message || 'An unknown network error occurred while running research.',
        isGenerating: false,
        activeNode: null,
      }));
    }
  }, [resetState]);

  return {
    state,
    runResearch,
    resetState,
  };
};
export default useAgentStream;
