/**
 * @file services/layoutService.ts
 * @description Graph layout engine using the dagre library. Transforms raw
 *              FlowchartData into positioned React Flow nodes and styled edges
 *              based on the active VisualizationMode.
 *
 *              Supports two primary layout modes:
 *              1. FLOWCHART — Top-down directed graph (architecture or file graph)
 *              2. MINDMAP   — Hierarchical tree with expand/collapse
 *
 *              The `report` mode is handled by the ReportView component and
 *              does not require graph layout.
 */

import dagre from 'dagre';
import { Node, Edge, Position } from 'reactflow';
import { FlowchartData, VisualizationMode, NodeData, LogicBlock, DocChapter } from '../types';
import { NODE_WIDTH, NODE_HEIGHT } from '../constants';

/**
 * Calculates positioned node/edge layout for a given visualization mode.
 *
 * @param initialData - Raw FlowchartData from the AI analysis pipeline
 * @param mode        - The active visualization mode
 * @returns A new FlowchartData with nodes positioned by the dagre layout engine
 */
export const calculateLayout = (
  initialData: FlowchartData,
  mode: VisualizationMode
): FlowchartData => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));

  // =========================================================================
  // MODE 1: FLOWCHART (High-Level Architecture Overview)
  // =========================================================================
  if (mode === 'flowchart') {

    // ── 1A. AI-Synthesized Architecture Mode ──────────────────────────
    // If the AI successfully generated a logical flow, use it as the
    // primary flowchart view (action steps, not file names).
    if (initialData.architecture && initialData.architecture.nodes.length > 0) {
        const { nodes: archNodes, edges: archEdges } = initialData.architecture;

        g.setGraph({ rankdir: 'TB', nodesep: 150, ranksep: 100, marginx: 50, marginy: 50 });

        // Set node dimensions — decisions are taller for visual distinction
        archNodes.forEach(node => {
            let w = 260, h = 100;
            if (node.type === 'decision') { w = 200; h = 140; }
            if (node.type === 'start' || node.type === 'end') { w = 180; h = 80; }
            g.setNode(node.id, { width: w, height: h });
        });

        archEdges.forEach(edge => g.setEdge(edge.source, edge.target));

        dagre.layout(g);

        // Map architecture nodes to React Flow nodes with computed positions
        const nodes: Node<NodeData>[] = archNodes.map(node => {
            const n = g.node(node.id);

            // Convert architecture type to internal NodeData type format
            let nodeType: NodeData['type'] = 'arch-process';

            // Legacy / structural types
            if (node.type === 'client')    nodeType = 'arch-client';
            else if (node.type === 'server')    nodeType = 'arch-server';
            else if (node.type === 'service')   nodeType = 'arch-service';
            else if (node.type === 'external')  nodeType = 'arch-external';
            else if (node.type === 'database')  nodeType = 'arch-db';
            // Logical flow types
            else if (node.type === 'start')     nodeType = 'arch-start';
            else if (node.type === 'end')       nodeType = 'arch-end';
            else if (node.type === 'decision')  nodeType = 'arch-decision';
            else if (node.type === 'process')   nodeType = 'arch-process';

            return {
                id: node.id,
                type: 'custom',
                position: { x: n.x - (g.node(node.id).width / 2), y: n.y - (g.node(node.id).height / 2) },
                data: {
                    label: node.label,
                    type: nodeType,
                    details: [node.description],
                    mode: 'flowchart'
                },
                targetPosition: Position.Top,
                sourcePosition: Position.Bottom,
            };
        });

        const edges: Edge[] = archEdges.map(e => ({
            id: `e-${e.source}-${e.target}`,
            source: e.source,
            target: e.target,
            label: e.label,
            animated: true,
            type: 'custom',
            style: { stroke: '#18181b', strokeWidth: 2 }
        }));

        return { nodes, edges };
    }

    // ── 1B. Fallback: Raw File Dependency Graph ───────────────────────
    // If architecture synthesis failed, show a simple file → class graph.
    const visibleNodes = initialData.nodes.filter(n => {
       const t = n.data.type;
       return t === 'file' || t === 'class' || t === 'database' || t === 'entry' || t === 'component';
    });

    const visibleIds = new Set(visibleNodes.map(n => n.id));
    const visibleEdges = initialData.edges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target));

    g.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 120, marginx: 50, marginy: 50 });

    visibleNodes.forEach(node => g.setNode(node.id, { width: 280, height: 140 }));
    visibleEdges.forEach(edge => g.setEdge(edge.source, edge.target));

    dagre.layout(g);

    return {
      nodes: visibleNodes.map(node => {
        const n = g.node(node.id);
        return {
          ...node,
          targetPosition: Position.Top,
          sourcePosition: Position.Bottom,
          position: { x: n.x - 140, y: n.y - 70 },
          data: { ...node.data, mode: 'flowchart' }
        };
      }),
      edges: visibleEdges.map(e => ({ ...e, animated: true, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } }))
    };
  }

  // =========================================================================
  // MODE 2: DEEP MINDMAP (File → Class → Function → Logic Tree)
  // =========================================================================
  if (mode === 'mindmap' && initialData.documentation) {
     const nodes: Node<NodeData>[] = [];
     const edges: Edge[] = [];

     // Layout configuration constants
     const X_GAP = 400;      // Horizontal spacing between depth levels
     const Y_GAP = 25;       // Vertical spacing between sibling nodes
     const BASE_HEIGHT = 80; // Minimum height per node

     // ── Recursive Logic Node Builder ──────────────────────────────────
     // Builds the deep logic tree (if → loop → action → return) inside
     // each function, with all nodes hidden by default (collapsed).
     const buildLogicNodes = (
         blocks: LogicBlock[],
         parentId: string,
         startX: number,
         currentY: number
     ): { endY: number, childIds: string[] } => {
         let localY = currentY;
         const myChildIds: string[] = [];

         blocks.forEach((block, idx) => {
             const blockId = `${parentId}-logic-${idx}-${Math.random().toString(36).substr(2, 5)}`;
             myChildIds.push(blockId);

             // Map logic block type to visual node type
             let nodeType: NodeData['type'] = 'logic-action';
             if (block.type === 'if')     nodeType = 'logic-if';
             if (block.type === 'loop')   nodeType = 'logic-loop';
             if (block.type === 'return') nodeType = 'logic-return';

             const hasChildren = block.children && block.children.length > 0;

             // Recursively build nested children first to calculate Y extent
             let nestedChildIds: string[] = [];
             let nextY = localY;

             // Logic nodes start hidden — they appear when parent is expanded
             const isInitiallyHidden = true;

             if (hasChildren && block.children) {
                 const result = buildLogicNodes(block.children, blockId, startX + X_GAP * 0.8, localY);
                 nestedChildIds = result.childIds;
                 nextY = Math.max(localY + BASE_HEIGHT, result.endY);
             } else {
                 nextY += BASE_HEIGHT + Y_GAP;
             }

             // Create the logic node
             nodes.push({
                 id: blockId,
                 type: 'custom',
                 position: { x: startX, y: localY },
                 hidden: isInitiallyHidden,
                 data: {
                     label: block.content,
                     type: nodeType,
                     parentId,
                     childIds: nestedChildIds,
                     mode: 'mindmap',
                     hasChildren: !!hasChildren,
                     isCollapsed: true // Collapsed by default
                 }
             });

             // Edge connecting this node to its parent
             edges.push({
                 id: `e-${parentId}-${blockId}`,
                 source: parentId,
                 target: blockId,
                 type: 'bezier',
                 animated: true,
                 hidden: isInitiallyHidden,
                 style: { stroke: block.type === 'if' ? '#f472b6' : '#cbd5e1' }
             });

             localY = nextY + Y_GAP;
         });
         return { endY: localY, childIds: myChildIds };
     };

     // ── Top-Level Iterator: Process Each File Chapter ─────────────────
     let globalY = 0;

     initialData.documentation.chapters.forEach(chap => {
         // 1. File Node (always visible, expanded by default)
         const fileId = chap.id;
         const fileChildrenIds: string[] = [];

         let fileChildrenY = globalY;

         // 2. Build class and function entity nodes
         const allEntities = [...chap.classes.map(c => ({...c, kind: 'class'})), ...chap.functions.map(f => ({...f, kind: 'function'}))];

         allEntities.forEach((entity: any) => {
             const entityId = `${fileId}-${entity.name}`;
             fileChildrenIds.push(entityId);
             const isClass = entity.kind === 'class';

             const entityChildrenIds: string[] = [];

             // 3. Methods / Functions & their internal logic
             let entityChildrenY = fileChildrenY;

             if (isClass) {
                 entity.methods.forEach((method: any) => {
                     const methodId = `${entityId}-${method.name}`;
                     entityChildrenIds.push(methodId);

                     // 4. Deep logic tree (recursive)
                     let logicChildIds: string[] = [];
                     let logicEndY = entityChildrenY;

                     if (method.logic && method.logic.length > 0) {
                        const res = buildLogicNodes(method.logic, methodId, X_GAP * 3, entityChildrenY);
                        logicChildIds = res.childIds;
                        logicEndY = res.endY;
                     } else {
                        logicEndY += BASE_HEIGHT + Y_GAP;
                     }

                     // Method node (hidden inside its parent class initially)
                     nodes.push({
                         id: methodId,
                         type: 'custom',
                         position: { x: X_GAP * 2, y: entityChildrenY },
                         hidden: true,
                         data: {
                             label: method.name, type: 'function', mode: 'mindmap', parentId: entityId,
                             params: method.params, returnType: method.returnType, complexity: method.complexity,
                             childIds: logicChildIds,
                             hasChildren: logicChildIds.length > 0,
                             isCollapsed: true
                         }
                     });
                     edges.push({ id: `e-${entityId}-${methodId}`, source: entityId, target: methodId, type: 'bezier', animated: true, hidden: true, style: { stroke: '#cbd5e1' } });

                     entityChildrenY = logicEndY + Y_GAP;
                 });
             } else {
                 // Standalone function — attach logic directly
                 let logicChildIds: string[] = [];
                 if (entity.logic && entity.logic.length > 0) {
                    const res = buildLogicNodes(entity.logic, entityId, X_GAP * 2, entityChildrenY);
                    logicChildIds = res.childIds;
                    entityChildrenY = res.endY + Y_GAP;
                 } else {
                    entityChildrenY += BASE_HEIGHT + Y_GAP;
                 }
                 entityChildrenIds.push(...logicChildIds);
             }

             // Create the class/function entity node
             nodes.push({
                 id: entityId,
                 type: 'custom',
                 position: { x: X_GAP, y: fileChildrenY },
                 data: {
                     label: entity.name,
                     type: isClass ? 'class' : 'function',
                     mode: 'mindmap',
                     parentId: fileId,
                     params: entity.params,
                     returnType: entity.returnType,
                     complexity: entity.complexity,
                     details: [entity.description],
                     childIds: entityChildrenIds,
                     hasChildren: entityChildrenIds.length > 0,
                     isCollapsed: true // Classes/functions start collapsed
                 }
             });
             edges.push({ id: `e-${fileId}-${entityId}`, source: fileId, target: entityId, type: 'bezier', animated: true, style: { stroke: '#94a3b8' } });

             fileChildrenY = Math.max(fileChildrenY + BASE_HEIGHT, entityChildrenY) + Y_GAP;
         });

         // Push the file-level node (expanded by default to show children)
         nodes.push({
             id: fileId,
             type: 'custom',
             position: { x: 0, y: globalY },
             data: {
                 label: chap.title, type: 'file', mode: 'mindmap',
                 hasChildren: fileChildrenIds.length > 0,
                 childIds: fileChildrenIds,
                 isCollapsed: false // Files are expanded by default
            }
         });

         globalY = Math.max(globalY + BASE_HEIGHT, fileChildrenY) + 100; // Gap between file sections
     });

     return { nodes, edges };
  }

  // ── Passthrough for unsupported modes ──────────────────────────────
  return initialData;
};