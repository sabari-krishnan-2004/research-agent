import React, { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Position,
  Handle,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, Search, ShieldCheck, FileText } from 'lucide-react';
import type { AgentNodeName } from '../types/agent';

// Custom node styling and visualization
const CustomNode = React.memo(({ data }: any) => {
  const { label, description, icon: Icon, isActive, isCompleted } = data;
  
  return (
    <div 
      className={`relative bg-slate-900 border border-slate-700 text-slate-100 p-4 rounded-xl shadow-lg w-52 transition-all duration-300 ${
        isActive ? 'glow-active border-cyan-400' : isCompleted ? 'glow-completed border-indigo-500' : 'opacity-70'
      }`}
    >
      {isActive && (
        <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
        </span>
      )}
      
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg transition-colors ${
          isActive 
            ? 'bg-cyan-500/20 text-cyan-400' 
            : isCompleted 
              ? 'bg-indigo-500/20 text-indigo-400' 
              : 'bg-slate-800 text-slate-400'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{label}</h3>
          <p className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">{description}</p>
        </div>
      </div>
      
      {/* Node handles for React Flow routing */}
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-slate-600 border-none" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-slate-600 border-none" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

interface AgentCanvasProps {
  activeNode: AgentNodeName | null;
  completedNodes: AgentNodeName[];
}

export const AgentCanvas: React.FC<AgentCanvasProps> = ({ activeNode, completedNodes }) => {
  // Pre-configured nodes layout positions
  const initialNodes = useMemo(() => [
    {
      id: 'supervisor',
      type: 'custom',
      position: { x: 40, y: 120 },
      data: {
        label: 'Supervisor',
        description: 'Deconstructs queries',
        icon: Play,
        isActive: false,
        isCompleted: false,
      },
    },
    {
      id: 'researcher',
      type: 'custom',
      position: { x: 300, y: 120 },
      data: {
        label: 'Researcher',
        description: 'Scrapes web resources',
        icon: Search,
        isActive: false,
        isCompleted: false,
      },
    },
    {
      id: 'critic',
      type: 'custom',
      position: { x: 560, y: 120 },
      data: {
        label: 'Critic Node',
        description: 'Evaluates fact coverage',
        icon: ShieldCheck,
        isActive: false,
        isCompleted: false,
      },
    },
    {
      id: 'synthesizer',
      type: 'custom',
      position: { x: 820, y: 120 },
      data: {
        label: 'Synthesizer',
        description: 'Compiles final report',
        icon: FileText,
        isActive: false,
        isCompleted: false,
      },
    },
  ], []);

  const initialEdges = useMemo(() => [
    {
      id: 'e-supervisor-researcher',
      source: 'supervisor',
      target: 'researcher',
      animated: false,
      className: '',
    },
    {
      id: 'e-researcher-critic',
      source: 'researcher',
      target: 'critic',
      animated: false,
      className: '',
    },
    {
      id: 'e-critic-synthesizer',
      source: 'critic',
      target: 'synthesizer',
      animated: false,
      className: '',
    },
    {
      id: 'e-critic-researcher',
      source: 'critic',
      target: 'researcher',
      animated: false,
      className: '',
      // Refinement curve styling
      type: 'smoothstep',
      pathOptions: { borderRadius: 20 },
      style: { strokeDasharray: '5,5' },
    },
  ], []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Synchronize React Flow states with incoming streaming activeNode/completedNodes events
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const nodeId = node.id as AgentNodeName;
        return {
          ...node,
          data: {
            ...node.data,
            isActive: activeNode === nodeId,
            isCompleted: completedNodes.includes(nodeId),
          },
        };
      })
    );
  }, [activeNode, completedNodes, setNodes]);

  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => {
        const { source, target, id } = edge;
        
        let isActive = false;
        let isCompleted = false;

        // Determine edge styling based on active nodes
        if (source === 'supervisor' && target === 'researcher') {
          isActive = activeNode === 'researcher' || activeNode === 'supervisor';
          isCompleted = completedNodes.includes('supervisor');
        } else if (source === 'researcher' && target === 'critic') {
          isActive = activeNode === 'critic' || (activeNode === 'researcher' && completedNodes.includes('researcher'));
          isCompleted = completedNodes.includes('researcher');
        } else if (source === 'critic' && target === 'synthesizer') {
          isActive = activeNode === 'synthesizer';
          isCompleted = completedNodes.includes('critic');
        } else if (source === 'critic' && target === 'researcher' && id === 'e-critic-researcher') {
          // If loops are happening and researcher active again
          isActive = activeNode === 'researcher' && completedNodes.includes('critic');
          isCompleted = false;
        }

        return {
          ...edge,
          animated: isActive,
          className: `${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`,
        };
      })
    );
  }, [activeNode, completedNodes, setEdges]);

  return (
    <div className="w-full h-[320px] bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden relative shadow-inner">
      <div className="absolute top-4 left-4 z-10">
        <h2 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Agent Workflow Map</h2>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesConnectable={false}
        nodesDraggable={false}
        zoomOnScroll={false}
        panOnScroll={false}
        panOnDrag={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
      >
        <Background variant={BackgroundVariant.Dots} color="#1e293b" gap={16} size={1} />
        <Controls showInteractive={false} className="!bg-slate-900 !border-slate-850 !shadow-lg" />
      </ReactFlow>
    </div>
  );
};
export default AgentCanvas;
