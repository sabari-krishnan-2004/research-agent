export type AgentNodeName = 'supervisor' | 'researcher' | 'critic' | 'synthesizer';

export interface AgentLog {
  message: string;
  timestamp: string;
  event: string;
}

export interface StreamState {
  activeNode: AgentNodeName | null;
  completedNodes: AgentNodeName[];
  logs: AgentLog[];
  finalReport: string;
  isGenerating: boolean;
  error: string | null;
}
