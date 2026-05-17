import React, { useMemo, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  BackgroundVariant,
  Node,
  ReactFlowProvider,
  useReactFlow,
  getRectOfNodes,
  getTransformForBounds
} from 'reactflow';
import CustomNode from './CustomNode';
import { AnimatedEdge } from './AnimatedEdge';
import { FlowchartData, VisualizationMode, NodeData } from '../types';
import { calculateLayout } from '../services/layoutService';
import { FileText, GitGraph, BoxSelect } from 'lucide-react';
import { ReportView } from './ReportView';

interface FlowchartCanvasProps {
  initialData: FlowchartData | null;
  mode: VisualizationMode;
  onModeChange: (mode: VisualizationMode) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onExplainCode?: (code: string, label: string) => void;
}

const FlowchartInner: React.FC<FlowchartCanvasProps> = ({ 
  initialData,
  mode,
  onModeChange,
  onNodeClick: onNodeClickProp,
  onExplainCode
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, setViewport, getZoom, getViewport, getNodes } = useReactFlow();

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ custom: AnimatedEdge }), []);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    if (!initialData) return;
    
    const hydratedNodes = initialData.nodes.map(n => ({
        ...n,
        data: {
            ...n.data,
            onExplain: onExplainCode,
            onExpand: handleExpand // Attach the expand handler
        }
    }));
    
    setNodes(hydratedNodes);
    setEdges(initialData.edges);
  }, [initialData, onExplainCode]);

  // --- 2. LAYOUT EFFECT ---
  useEffect(() => {
    if (nodes.length === 0) return;
    if (mode === 'report') return;

    // Pass data to layout service
    const layoutInput: FlowchartData = {
        nodes: nodes,
        edges: edges,
        architecture: initialData?.architecture, 
        documentation: initialData?.documentation
    };

    const layoutResult = calculateLayout(layoutInput, mode);

    setNodes(layoutResult.nodes.map(n => ({
        ...n,
        type: 'custom',
        data: { 
            ...n.data, 
            mode,
            onExplain: onExplainCode,
            onExpand: handleExpand
        },
    })));

    setEdges(layoutResult.edges.map(e => ({
        ...e,
        type: 'custom',
        animated: true,
        style: { 
            stroke: '#18181b', 
            strokeWidth: mode === 'mindmap' ? 2 : 1.5,
            opacity: 0.8
        }
    })));

  }, [mode, initialData, onExplainCode]); 

  // --- EXPANSION LOGIC (Cinematic Camera) ---
  const handleExpand = useCallback((nodeId: string, isCollapsed: boolean) => {
    // 1. Toggle Node Visibility
    setNodes(nds => {
        // Toggle the clicked node's collapsed state
        const updatedNodes = nds.map(node => {
            if (node.id === nodeId) {
                return { ...node, data: { ...node.data, isCollapsed: !isCollapsed } };
            }
            return node;
        });

        // Find parent to get child IDs
        const parentNode = updatedNodes.find(n => n.id === nodeId);
        if (!parentNode || !parentNode.data.childIds) return updatedNodes;

        const childIds = parentNode.data.childIds;
        // If isCollapsed was true, we are now expanding -> show children (hidden = false)
        const shouldShow = isCollapsed; 

        return updatedNodes.map(node => {
            if (childIds.includes(node.id)) {
                return { ...node, hidden: !shouldShow };
            }
            return node;
        });
    });
    
    // 2. Toggle Edge Visibility
    setEdges(eds => {
        return eds.map(edge => {
            if (edge.source === nodeId) {
                 return { ...edge, hidden: !isCollapsed }; 
            }
            return edge;
        });
    });

    // 3. Cinematic Camera Move
    // Wait slightly for the nodes to be rendered and dimensions updated in ReactFlow store
    setTimeout(() => {
        const currentNodes = getNodes();
        const parent = currentNodes.find(n => n.id === nodeId);
        
        if (!parent) return;

        let focusTargets = [parent];

        if (isCollapsed) {
            // EXPANDING: Focus on Parent + Children to show the new content
            const childIds = parent.data.childIds || [];
            const children = currentNodes.filter(n => childIds.includes(n.id));
            if (children.length > 0) {
                focusTargets = [parent, ...children];
            }
        } else {
            // COLLAPSING: Focus back on the Parent (or maybe widen out, but parent is safe)
            focusTargets = [parent];
        }

        // Use fitView with cinematic parameters
        fitView({
            nodes: focusTargets,
            duration: 1200,   // Slow, cinematic pan
            padding: 0.3,     // Comfortable breathing room
            minZoom: 0.5,
            maxZoom: 1.5,     // Zoom in close to see details
        });

    }, 50);

  }, [setNodes, setEdges, fitView, getNodes]);

  // --- INTERACTION ---
  const handleNodeClick = useCallback((e: React.MouseEvent, node: Node) => {
      if (onNodeClickProp) onNodeClickProp(e, node);
  }, [onNodeClickProp]);

  const ModeButton = ({ m, icon: Icon, label }: { m: VisualizationMode, icon: any, label: string }) => (
      <button 
        onClick={() => {
            onModeChange(m);
            // Slight delay to allow layout to calculate before fitting view
            setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100);
        }}
        className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all duration-300 border-2
            ${mode === m 
                ? 'bg-black text-white border-black shadow-comic transform scale-105' 
                : 'bg-white text-gray-500 border-transparent hover:border-gray-200'}
        `}
      >
          <Icon size={14} />
          {label}
      </button>
  );

  // --- RENDER ---

  if (mode === 'report' && initialData) {
      return (
          <div className="w-full h-full relative bg-slate-200">
               <ReportView 
                  documentation={initialData.documentation}
                  onExplainCode={onExplainCode} 
               />
               <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex gap-4 p-2 bg-white/80 backdrop-blur-md rounded-full border border-white/40 shadow-sm">
                    <ModeButton m="report" icon={FileText} label="DOCS" />
                    <ModeButton m="flowchart" icon={GitGraph} label="FLOW" />
                    <ModeButton m="mindmap" icon={BoxSelect} label="MINDMAP" />
                </div>
          </div>
      );
  }

  return (
    <div className="w-full h-full relative bg-slate-50 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        minZoom={0.1}
        maxZoom={4}
        className="react-flow-white"
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          color="#cbd5e1"
          gap={20} 
          size={1}
        />
        <Controls className="!bg-white !border-2 !border-black !shadow-comic !rounded-lg !m-6 text-black" />
      </ReactFlow>

      {/* Mode Switcher */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex gap-4 p-2 bg-white/80 backdrop-blur-md rounded-full border border-white/40 shadow-sm">
          <ModeButton m="report" icon={FileText} label="DOCS" />
          <ModeButton m="flowchart" icon={GitGraph} label="FLOW" />
          <ModeButton m="mindmap" icon={BoxSelect} label="MINDMAP" />
      </div>
    </div>
  );
};

export const FlowchartCanvas: React.FC<FlowchartCanvasProps> = (props) => (
    <ReactFlowProvider>
        <FlowchartInner {...props} />
    </ReactFlowProvider>
);