import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import ReactFlow, { Background, Node, Edge, ReactFlowProvider, BackgroundVariant, useReactFlow, Controls, Handle, Position, NodeProps } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import CustomNode from './CustomNode';
import { AnimatedEdge } from './AnimatedEdge';
import { Algorithm, AlgoFrame, NodeData, GridCell } from '../types';
import { generateFrames, ALGORITHMS as ALGO_LIST } from '../services/algorithmData';
import { 
    Play, Pause, ChevronLeft, ChevronRight, Zap, 
    RotateCcw, Maximize2, Minimize2, Plus, Trash2, ArrowDown, ArrowUp, Smile, Sliders, Info, Clock, Database, Layers,
    BookOpen, CheckCircle2, XCircle, Grid3X3, ArrowRight, Target, Trophy, Code, PanelRightOpen, PanelRightClose, Terminal, GripHorizontal
} from 'lucide-react';

interface AlgorithmVisualizerProps {
  onBack: () => void;
}

// --- INFO MODAL COMPONENT ---
const InfoModal = ({ algo, onClose }: { algo: Algorithm, onClose: () => void }) => {
    if (!algo.learnMore) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white border-[3px] border-black rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-comic flex flex-col relative">
                {/* Header */}
                <div className="bg-comic-yellow border-b-2 border-black p-6 flex items-start justify-between sticky top-0 z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <BookOpen size={20} className="text-black"/>
                            <span className="font-black text-xs uppercase tracking-widest text-black/60">How it Works</span>
                        </div>
                        <h2 className="text-3xl font-black text-black tracking-tight">{algo.name}</h2>
                    </div>
                    <button onClick={onClose} className="bg-white hover:bg-black hover:text-white transition-colors border-2 border-black rounded-full p-2">
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Definition */}
                    <div className="bg-blue-50 p-6 rounded-2xl border-l-[6px] border-blue-500">
                        <h3 className="font-bold text-lg mb-2 text-blue-900">What is it?</h3>
                        <p className="text-blue-800 leading-relaxed font-medium">{algo.learnMore.definition}</p>
                    </div>

                    {/* How It Works Steps */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Layers size={20} /> The Process
                        </h3>
                        <div className="space-y-3">
                            {algo.learnMore.howItWorks.map((step, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                        {i+1}
                                    </div>
                                    <p className="text-gray-700 leading-snug">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Real World Uses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-5 rounded-xl border-2 border-gray-100">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                                <Database size={14}/> Real World Uses
                            </h3>
                            <ul className="space-y-2">
                                {algo.learnMore.realWorldUses.map((use, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                        <CheckCircle2 size={14} className="text-green-500"/> {use}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Complexity Mini-View */}
                        <div className="bg-gray-50 p-5 rounded-xl border-2 border-gray-100">
                             <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                                <Clock size={14}/> Performance
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Time (Avg):</span>
                                    <span className="font-mono font-bold bg-white px-2 rounded border">{algo.complexityDetails.timeAvg}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Space:</span>
                                    <span className="font-mono font-bold bg-white px-2 rounded border">{algo.complexityDetails.space}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t-2 border-black bg-gray-50 flex justify-end sticky bottom-0">
                    <button onClick={onClose} className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-comic-sm">
                        Got it, Let's Play!
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- CODE INSPECTOR PANEL ---
const CodeInspector = ({ 
    algo, 
    activeLine 
}: { 
    algo: Algorithm, 
    activeLine?: number 
}) => {
    const [lang, setLang] = useState<'js' | 'py' | 'cpp'>('js');
    const scrollRef = useRef<HTMLDivElement>(null);
    const lineRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

    // Auto-scroll to active line
    useEffect(() => {
        if (activeLine && lineRefs.current[activeLine]) {
            lineRefs.current[activeLine]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [activeLine, lang]);

    const code = algo.code?.[lang] || "// Code not available for this language";
    const lines = code.split('\n');

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] text-white font-mono text-sm border-l-2 border-black animate-fade-in w-96 relative z-30 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-[#333]">
                 <div className="flex gap-2">
                     <button 
                        onClick={() => setLang('js')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${lang === 'js' ? 'bg-[#f7df1e] text-black' : 'bg-[#333] hover:bg-[#444]'}`}
                     >JS</button>
                     <button 
                        onClick={() => setLang('py')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${lang === 'py' ? 'bg-[#3776ab] text-white' : 'bg-[#333] hover:bg-[#444]'}`}
                     >PY</button>
                     <button 
                        onClick={() => setLang('cpp')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${lang === 'cpp' ? 'bg-[#00599c] text-white' : 'bg-[#333] hover:bg-[#444]'}`}
                     >C++</button>
                 </div>
                 <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Sync View</div>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto custom-scrollbar p-4" ref={scrollRef}>
                {lines.map((line, idx) => {
                    const lineNum = idx + 1;
                    const isActive = activeLine === lineNum;
                    
                    return (
                        <div 
                            key={idx} 
                            ref={(el) => { lineRefs.current[lineNum] = el; }}
                            className={`flex group ${isActive ? 'bg-[#37373d] -mx-4 px-4' : ''} transition-colors duration-200`}
                        >
                            {/* Line Number */}
                            <div className={`w-8 text-right mr-4 select-none ${isActive ? 'text-white font-bold' : 'text-[#6e7681]'}`}>
                                {lineNum}
                            </div>
                            
                            {/* Code Line */}
                            <pre className={`flex-1 whitespace-pre-wrap ${isActive ? 'text-white' : 'text-[#d4d4d4]'}`}>
                                {line}
                            </pre>

                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute left-2 w-1.5 h-1.5 mt-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- VISUALIZATION NODES ---

const AlgoChartNode = memo(({ data }: NodeProps<{ frame: AlgoFrame }>) => {
    const { array, highlights, swaps, pivots, dimmed, pointers } = data.frame;
    if (!array) return <div className="p-4 text-red-500">No Data</div>;

    const maxVal = Math.max(...array.map(i => i.val));
    // Max height available for bars within the 500px container, leaving room for labels
    const MAX_BAR_HEIGHT = 420; 

    return (
        <div className="bg-white p-6 rounded-xl border-2 border-black shadow-comic min-w-[600px] flex flex-col items-center">
            {/* Increased height to 500px for larger, distinct bars */}
            <div className="flex items-end gap-2 h-[500px] w-full justify-center mb-6 px-4 border-b border-gray-100 pb-2 relative">
                <AnimatePresence>
                {array.map((item, idx) => {
                    let bgClass = "bg-blue-300";
                    let borderColor = "border-black/80";
                    let scale = 1;

                    if (highlights?.includes(idx)) {
                         bgClass = "bg-green-400"; // Comparing
                         scale = 1.05;
                    }
                    if (swaps?.includes(idx)) {
                         bgClass = "bg-red-400"; // Swapping
                         borderColor = "border-red-600";
                         scale = 1.1;
                    }
                    if (pivots?.includes(idx)) bgClass = "bg-yellow-400"; // Pivot/Min
                    if (dimmed?.includes(idx)) bgClass = "bg-gray-200";   // Sorted/Inactive

                    // Switch to Pixel based height for reliability in Flex container
                    const heightPx = Math.max((item.val / maxVal) * MAX_BAR_HEIGHT, 10);

                    return (
                        <motion.div 
                            layout
                            key={item.id} 
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="flex flex-col items-center gap-1 w-10 relative"
                        >
                            {/* Pointer Label (e.g. L, R, Mid) */}
                            <div className="h-6 flex items-end justify-center text-[10px] font-black text-purple-600 mb-1 absolute -top-8 w-full z-20">
                                {pointers && pointers[idx] ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        className="bg-purple-100 px-1 rounded border border-purple-200 whitespace-nowrap shadow-sm"
                                    >
                                        {pointers[idx]}
                                    </motion.div>
                                ) : null}
                            </div>

                            {/* Bar */}
                            <motion.div
                                animate={{ 
                                    height: heightPx,
                                    scale: scale,
                                    backgroundColor: bgClass.includes('green') ? '#4ade80' : 
                                                     bgClass.includes('red') ? '#f87171' : 
                                                     bgClass.includes('yellow') ? '#facc15' : 
                                                     bgClass.includes('gray') ? '#e5e7eb' : '#93c5fd'
                                }}
                                className={`w-full rounded-t-lg border-x-2 border-t-2 ${borderColor} transition-colors duration-200 relative group shadow-[2px_-2px_0px_rgba(0,0,0,0.1)]`}
                            >
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-[10px] font-bold px-2 py-1 rounded transition-opacity pointer-events-none z-10 whitespace-nowrap">
                                    Val: {item.val}
                                </div>
                            </motion.div>

                            {/* Index / Value Label */}
                            <div className={`text-xs font-mono font-bold mt-1 ${dimmed?.includes(idx) ? 'text-gray-300' : 'text-gray-700'}`}>
                                {item.val}
                            </div>
                        </motion.div>
                    );
                })}
                </AnimatePresence>
            </div>
            {/* Legend */}
            <div className="flex gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded border border-black/20"></div> Compare</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded border border-black/20"></div> Swap</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 rounded border border-black/20"></div> Pivot</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-200 rounded border border-black/20"></div> Sorted</div>
            </div>

            {/* React Flow Handles (Hidden but needed for valid node) */}
            <Handle type="target" position={Position.Top} className="opacity-0" />
            <Handle type="source" position={Position.Bottom} className="opacity-0" />
        </div>
    );
});

const AlgoGridNode = memo(({ data }: NodeProps<{ frame: AlgoFrame }>) => {
    const { grid, visualType } = data.frame;
    if (!grid) return null;

    return (
        <div className="bg-white p-4 rounded-xl border-2 border-black shadow-comic">
            <div
                className="grid gap-1"
                style={{
                    gridTemplateColumns: `repeat(${grid[0].length}, minmax(40px, 1fr))`
                }}
            >
                {grid.map((row, rIdx) => (
                    row.map((cell, cIdx) => {
                        let bg = 'bg-white';
                        let text = 'text-black';
                        let border = 'border-slate-200';

                        // Board specific (Chessboard pattern)
                        if (visualType === 'board') {
                            const isBlack = (rIdx + cIdx) % 2 === 1;
                            bg = isBlack ? 'bg-slate-300' : 'bg-white';
                            if (cell.isActive) bg = 'bg-blue-200'; // Queen placed
                            if (cell.isTarget) bg = 'bg-red-200'; // Conflict
                        } else {
                            // Grid/Maze specific
                            if (cell.isWall) bg = 'bg-slate-800';
                            else if (cell.isActive) bg = 'bg-blue-400';
                            else if (cell.isHighlight) bg = 'bg-blue-100'; // Visited path
                        }

                        if (cell.val === 'Q') text = 'text-black font-black text-lg';

                        return (
                            <div
                                key={`${rIdx}-${cIdx}`}
                                className={`
                                    w-10 h-10 flex items-center justify-center rounded border
                                    ${bg} ${border} ${text} transition-colors duration-200
                                `}
                            >
                                {cell.val === 'Q' && <span className="drop-shadow-sm">♛</span>}
                            </div>
                        );
                    })
                ))}
            </div>
            <Handle type="target" position={Position.Top} className="opacity-0" />
            <Handle type="source" position={Position.Bottom} className="opacity-0" />
        </div>
    );
});

const DataStructureNode = memo(({ data }: NodeProps<{ frame: AlgoFrame }>) => {
    return (
        <div className="bg-white p-6 rounded-xl border-2 border-black shadow-comic flex flex-col items-center">
            <div className="text-gray-400 text-xs font-bold uppercase mb-4">Data Structure View</div>
            <div className="text-sm font-mono">Visualization not implemented for this type yet.</div>
             <Handle type="target" position={Position.Top} className="opacity-0" />
             <Handle type="source" position={Position.Bottom} className="opacity-0" />
        </div>
    );
});

// --- ALGORITHM VISUALIZER ---

const AlgorithmVisualizerInner: React.FC<AlgorithmVisualizerProps> = ({ onBack }) => {
    const [selectedAlgoId, setSelectedAlgoId] = useState<string>('bubble');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [speed, setSpeed] = useState(1000); 
    const [showInfo, setShowInfo] = useState(true); 
    const [showCode, setShowCode] = useState(true); 
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Movable Log Box State
    const [logBoxPos, setLogBoxPos] = useState<{x: number, y: number} | null>(null);
    const [isDraggingLog, setIsDraggingLog] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const selectedAlgo = useMemo(() => ALGO_LIST.find(a => a.id === selectedAlgoId)!, [selectedAlgoId]);
    const frames = useMemo(() => generateFrames(selectedAlgoId), [selectedAlgoId]);
    const currentFrame = frames[currentStep] || frames[frames.length - 1];

    useEffect(() => {
        setIsPlaying(false);
        setCurrentStep(0);
        setShowInfo(true); 
        setShowCode(true);
        if (timerRef.current) clearInterval(timerRef.current);
    }, [selectedAlgoId]);

    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev >= frames.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, speed);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isPlaying, frames.length, speed]);

    // DRAG HANDLERS
    const handleLogMouseDown = (e: React.MouseEvent) => {
        const box = (e.currentTarget as HTMLElement).closest('.log-box') as HTMLElement;
        if (!box) return;
        
        const rect = box.getBoundingClientRect();
        
        // If first move, init position from current computed rect
        const startX = logBoxPos ? logBoxPos.x : rect.left;
        const startY = logBoxPos ? logBoxPos.y : rect.top;

        dragOffset.current = {
            x: e.clientX - startX,
            y: e.clientY - startY
        };
        
        if (!logBoxPos) {
            setLogBoxPos({ x: rect.left, y: rect.top });
        }
        
        setIsDraggingLog(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingLog) {
                setLogBoxPos({
                    x: e.clientX - dragOffset.current.x,
                    y: e.clientY - dragOffset.current.y
                });
            }
        };
        const handleMouseUp = () => setIsDraggingLog(false);

        if (isDraggingLog) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingLog]);


    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    useEffect(() => {
        if (!currentFrame) return;

        // 1. Graph/Tree View
        if (currentFrame.graphNodes) {
             // Identify nodes involved in the shortest path
             const pathNodeIds = new Set<string>();
             if (currentFrame.pathEdges) {
                 currentFrame.graphEdges?.forEach(e => {
                     if (currentFrame.pathEdges?.includes(e.id)) {
                         pathNodeIds.add(e.source);
                         pathNodeIds.add(e.target);
                     }
                 });
             }

             setNodes(currentFrame.graphNodes.map(n => {
                 let status: NodeData['status'] = undefined;

                 if (currentFrame.currentNode === n.id) status = 'active';
                 else if (pathNodeIds.has(n.id)) status = 'path';
                 else if (currentFrame.visitedNodes?.includes(n.id)) status = 'visited';
                 else if (currentFrame.frontierNodes?.includes(n.id)) status = 'frontier';

                 return {
                    ...n,
                    style: { width: 50, height: 50, zIndex: status === 'active' ? 100 : 1 }, 
                    data: {
                        ...n.data,
                        label: n.data.label,
                        mode: 'algo-tree',
                        status: status
                    }
                 };
             }));
             
             // Edge styling
             setEdges((currentFrame.graphEdges || []).map(e => {
                 const isPath = currentFrame.pathEdges?.includes(e.id);
                 return {
                     ...e,
                     animated: isPath,
                     style: { 
                         stroke: isPath ? '#2563eb' : '#cbd5e1', 
                         strokeWidth: isPath ? 3 : 2,
                         opacity: isPath ? 1 : 0.5,
                         zIndex: isPath ? 10 : 0
                     },
                     labelStyle: { fill: isPath ? '#2563eb' : '#94a3b8', fontWeight: 700 }
                 };
             }));
        } 
        // 2. Grid/Board View (Knapsack, N-Queens)
        else if (currentFrame.grid) {
            setNodes([{
                id: 'grid-container',
                position: { x: 0, y: 0 },
                type: 'gridNode',
                data: { label: 'Grid', frame: currentFrame }
            }]);
            setEdges([]);
        }
        // 3. Stack/Queue View
        else if (currentFrame.visualType === 'stack' || currentFrame.visualType === 'queue') {
             setNodes([{
                id: 'ds-container',
                position: { x: 0, y: 0 },
                type: 'dsNode',
                data: { label: 'DS', frame: currentFrame }
            }]);
            setEdges([]);
        }
        // 4. Array View (Sort/Search)
        else {
            setNodes([{
                id: 'chart-container',
                position: { x: 0, y: 0 },
                type: 'chartNode',
                data: { label: 'Chart', frame: currentFrame }
            }]);
            setEdges([]);
        }
    }, [currentFrame]);

    const nodeTypes = useMemo(() => ({ custom: CustomNode, chartNode: AlgoChartNode, gridNode: AlgoGridNode, dsNode: DataStructureNode }), []);
    const edgeTypes = useMemo(() => ({ custom: AnimatedEdge }), []);

    return (
        <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans">
            
            {/* Info Modal */}
            {showInfo && <InfoModal algo={selectedAlgo} onClose={() => setShowInfo(false)} />}

            {/* LEFT SIDEBAR: Controls & List */}
            <div className="w-80 bg-white border-r-2 border-black flex flex-col z-20 shadow-xl shrink-0">
                <div className="h-16 flex items-center px-6 border-b-2 border-black bg-comic-yellow">
                    <button onClick={onBack} className="mr-3 p-1.5 hover:bg-black/10 rounded-lg transition-colors">
                        <ChevronLeft size={20} className="text-black"/>
                    </button>
                    <span className="font-black text-lg tracking-tight">AlgoPlay</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {['Sorting', 'Searching', 'Graph', 'Tree', 'Backtracking'].map(category => (
                        <div key={category}>
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-2">
                                {category}
                            </div>
                            <div className="space-y-2">
                                {ALGO_LIST.filter(a => a.category === category && a.id !== 'insertion').map(algo => (
                                    <button
                                        key={algo.id}
                                        onClick={() => setSelectedAlgoId(algo.id)}
                                        className={`
                                            w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200
                                            ${selectedAlgoId === algo.id 
                                                ? 'bg-black text-white border-black shadow-comic-sm scale-[1.02]' 
                                                : 'bg-white text-gray-600 border-gray-100 hover:border-black hover:shadow-sm'}
                                        `}
                                    >
                                        <div className="font-bold text-sm">{algo.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN AREA */}
            <div className="flex-1 flex flex-col relative bg-slate-100 min-w-0">
                <div className="flex-1 relative flex">
                    <div className="flex-1 relative">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            fitView
                            minZoom={0.2}
                            maxZoom={2}
                            className="bg-slate-50"
                        >
                            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
                            <Controls className="!bg-white !border-2 !border-black !shadow-comic !rounded-lg !m-6 text-black" />
                        </ReactFlow>
                    </div>

                    {/* Right Code Panel (Collapsible) */}
                    {showCode && selectedAlgo.code && (
                        <CodeInspector 
                            algo={selectedAlgo} 
                            activeLine={currentFrame?.codeLine} 
                        />
                    )}
                </div>

                {/* OVERLAY: GOAL & RESULT BOXES */}
                <div className={`absolute top-6 z-10 flex flex-col gap-3 pointer-events-none transition-all duration-300 ${showCode ? 'right-[400px]' : 'right-6'}`}>
                     {/* Goal Box */}
                     {currentFrame?.goal && (
                         <div className="bg-white border-2 border-black rounded-xl p-4 shadow-comic w-72 animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-1 text-blue-600 font-black text-xs uppercase tracking-widest">
                                <Target size={14} /> Current Goal
                            </div>
                            <div className="text-sm font-bold text-black leading-tight">
                                {currentFrame.goal}
                            </div>
                         </div>
                     )}
                     
                     {/* Step Result Box */}
                     {currentFrame?.result && (
                         <div className="bg-green-50 border-2 border-black rounded-xl p-4 shadow-comic w-72 animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-1 text-green-600 font-black text-xs uppercase tracking-widest">
                                <Trophy size={14} /> Step Result
                            </div>
                            <div className="text-sm font-bold text-black leading-tight">
                                {currentFrame.result}
                            </div>
                         </div>
                     )}
                </div>

                {/* ALGORITHM LOG OUTPUT BOX (MOVABLE, Top Center by default) */}
                {currentFrame?.visitedNodes && currentFrame.visitedNodes.length > 0 && (
                    <div 
                        className={`log-box absolute z-30 animate-fade-in-up max-w-sm ${isDraggingLog ? 'cursor-grabbing' : 'cursor-grab'}`}
                        style={logBoxPos 
                            ? { top: logBoxPos.y, left: logBoxPos.x, transform: 'none' } 
                            : { top: '6rem', left: '50%', transform: 'translateX(-50%)' } // Default Top Center
                        }
                    >
                        <div className="bg-white border-2 border-black rounded-xl shadow-comic overflow-hidden">
                            <div 
                                onMouseDown={handleLogMouseDown}
                                className="bg-slate-100 border-b border-black p-2 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
                            >
                                <div className="flex items-center gap-2 text-purple-600 font-black text-xs uppercase tracking-widest">
                                    <Terminal size={14} /> Result / Sequence
                                </div>
                                <GripHorizontal size={14} className="text-gray-400" />
                            </div>
                            <div className="p-4 flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                                {currentFrame.visitedNodes.map((nodeId, idx) => (
                                    <div key={`${nodeId}-${idx}`} className="flex items-center animate-fade-in">
                                        <div className="w-8 h-8 flex items-center justify-center bg-slate-100 border-2 border-slate-300 rounded-full text-xs font-mono font-bold text-slate-700 shadow-sm">
                                            {nodeId}
                                        </div>
                                        {idx < currentFrame.visitedNodes!.length - 1 && (
                                            <ArrowRight size={12} className="ml-2 text-slate-400" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* OVERLAY: INFO & CODE TOGGLES */}
                <div className="absolute top-6 left-6 z-10 flex gap-2">
                     <button onClick={() => setShowInfo(true)} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-black shadow-comic-sm font-bold text-xs hover:scale-105 transition-transform">
                        <Info size={16} /> Explain {selectedAlgo.name}
                     </button>
                     {selectedAlgo.code && (
                        <button 
                            onClick={() => setShowCode(!showCode)} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 border-black shadow-comic-sm font-bold text-xs hover:scale-105 transition-transform ${showCode ? 'bg-black text-white' : 'bg-white text-black'}`}
                        >
                            <Code size={16} /> {showCode ? 'Hide Code' : 'Show Code'}
                        </button>
                     )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none flex flex-col items-center">
                    <div className="bg-white border-2 border-black rounded-2xl shadow-comic p-6 mb-4 max-w-2xl w-full text-center pointer-events-auto transform transition-all hover:scale-[1.02]">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Step {currentStep + 1} / {frames.length}
                        </div>
                        <div className="text-lg font-bold text-black leading-snug">
                            {currentFrame?.description}
                        </div>
                    </div>

                    <div className="bg-black text-white rounded-full p-2 px-6 shadow-comic flex items-center gap-6 pointer-events-auto">
                        <button onClick={() => { setIsPlaying(false); setCurrentStep(0); }} className="hover:text-comic-pink transition-colors">
                            <RotateCcw size={18} />
                        </button>
                        <div className="w-[1px] h-6 bg-white/20"></div>
                        <button onClick={() => { setIsPlaying(false); setCurrentStep(Math.max(0, currentStep - 1)); }} className="hover:text-comic-blue transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <button 
                            onClick={() => {
                                if (currentStep >= frames.length - 1) setCurrentStep(0);
                                setIsPlaying(!isPlaying);
                            }}
                            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        >
                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                        </button>
                        <button onClick={() => { setIsPlaying(false); setCurrentStep(Math.min(frames.length - 1, currentStep + 1)); }} className="hover:text-comic-blue transition-colors">
                            <ChevronRight size={24} />
                        </button>
                        <div className="w-[1px] h-6 bg-white/20"></div>
                        <div className="flex items-center gap-2">
                            <Zap size={14} className={speed < 500 ? "text-yellow-400" : "text-gray-400"} />
                            <input 
                                type="range" min="100" max="2000" step="100" value={2100 - speed} 
                                onChange={(e) => setSpeed(2100 - Number(e.target.value))}
                                className="w-24 accent-white h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AlgorithmVisualizer = (props: AlgorithmVisualizerProps) => (
    <ReactFlowProvider>
        <AlgorithmVisualizerInner {...props} />
    </ReactFlowProvider>
);