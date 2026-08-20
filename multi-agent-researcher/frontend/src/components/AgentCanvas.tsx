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
import { Play, Search, ShieldCheck, FileText, Cpu } from 'lucide-react';
import type { AgentNodeName } from '../types/agent';

// Custom node styling and visualization
const CustomNode = React.memo(({ data }: any) => {
  const { label, description, icon: Icon, isActive, isCompleted } = data;
  
  return (
    <div 
      className={`relative glass-panel text-slate-100 p-4.5 rounded-2xl w-56 border transition-all duration-500 ease-out select-none ${
        isActive 
          ? 'glow-active scale-[1.03] z-20 border-white bg-white/[0.04]' 
          : isCompleted 
            ? 'glow-completed border-white/20 bg-white/[0.01]' 
            : 'border-white/5 opacity-30 bg-[#050505]/40 hover:opacity-50 hover:border-white/10'
      }`}
    >
      {isActive && (
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 z-30">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
      )}
      
      <div className="flex items-center gap-3.5">
        <div className={`p-2.5 rounded-xl border transition-all duration-300 ${
          isActive 
            ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)] border-white' 
            : isCompleted 
              ? 'bg-white/5 text-slate-300 border-white/10 shadow-[0_0_8px_rgba(255,255,255,0.05)]' 
              : 'bg-[#0a0a0a] border-white/5 text-slate-600'
        }`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-200 truncate">{label}</h3>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">{description}</p>
        </div>
      </div>
      
      {/* Node handles styled via index.css */}
      <Handle type="target" position={Position.Left} className="react-flow__handle" />
      <Handle type="source" position={Position.Right} className="react-flow__handle" />
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
      position: { x: 30, y: 120 },
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
      position: { x: 570, y: 120 },
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
      position: { x: 840, y: 120 },
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
    <div className="w-full h-[320px] bg-black/40 rounded-2xl border border-white/5 overflow-hidden relative shadow-2xl glass-panel">
      {/* Canvas Header Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/5 text-white border border-white/10 shadow-inner">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-[10px] uppercase tracking-widest text-slate-350 font-black">Swarm Agent Canvas</h2>
        </div>
        
        {/* State Legends */}
        <div className="flex items-center gap-4 bg-black/80 px-3 py-1.5 border border-white/5 rounded-xl shadow-inner text-[8px] font-black uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white/5 border border-white/5" />
            <span>Idle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse shadow-[0_0_6px_#fff]" />
            <span className="text-white">Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
            <span className="text-slate-300 font-semibold">Done</span>
          </div>
        </div>
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
        <Background variant={BackgroundVariant.Dots} color="#151515" gap={18} size={1} />
        <Controls showInteractive={false} className="!bg-black/90 !border-white/5 !shadow-xl !rounded-xl overflow-hidden" />
      </ReactFlow>
    </div>
  );
};

export default AgentCanvas;
