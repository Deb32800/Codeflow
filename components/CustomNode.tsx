import React, { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { motion } from 'framer-motion';
import { 
  GitBranch, BookOpen, ArrowRight, Plus, Minus, User, Database, Server, Cloud, Folder, FileCode, Box, Braces, Code2, 
  HelpCircle, Repeat, PlayCircle, LogOut, CheckCircle2, Globe, Monitor, Settings, Play, Check, X as XIcon, Flag
} from 'lucide-react';
import { NodeData } from '../types';
import { COLORS } from '../constants';

const CustomNode = ({ data, selected, id }: NodeProps<NodeData>) => {
  const mode = data.mode || 'flowchart';
  
  // Handle Expansion Click
  const onExpandClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (data.onExpand) {
          data.onExpand(id, !!data.isCollapsed);
      }
  };

  // --- 1. ALGO TREE MODE ---
  if (mode === 'algo-tree') {
      const status = data.status || 'default';
      
      let bg = 'bg-white';
      let border = 'border-black';
      let scale = 1;
      let shadow = '';
      let textColor = 'text-black';
      
      // Visual States based on Algorithm Status
      switch(status) {
          case 'active':
              bg = 'bg-[#a3e635]'; // Vibrant Light Green (Lime-400)
              border = 'border-[#365314]'; // Dark Green
              scale = 1.3; // Make it pop significantly
              shadow = 'shadow-[0_0_25px_rgba(163,230,53,0.8)]'; // Glow
              textColor = 'text-black';
              break;
          case 'visited':
              bg = 'bg-green-200'; // Softer Green
              border = 'border-green-600';
              break;
          case 'frontier':
              bg = 'bg-yellow-200'; // Yellow
              border = 'border-yellow-600';
              break;
          case 'path':
              bg = 'bg-blue-200'; // Blue for shortest path
              border = 'border-blue-600';
              break;
          default:
              // Default White
              break;
      }

      return (
        <motion.div 
            animate={{ scale }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`
                w-12 h-12 rounded-full border-[3px] flex items-center justify-center 
                font-bold text-sm select-none transition-colors duration-300 z-10 
                ${bg} ${border} ${shadow} ${textColor}
            `}
        >
           {data.label}
           {/* Invisible Handles for connections */}
           <Handle type="target" position={Position.Top} className="!bg-transparent !border-none" />
           <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none" />
        </motion.div>
      );
  }

  // --- 2. ARCHITECTURE / LOGICAL FLOW MODE ---
  if (data.type?.startsWith('arch-')) {
      // 2A. LOGICAL FLOW NODES
      if (['arch-start', 'arch-end', 'arch-process', 'arch-decision'].includes(data.type)) {
          let styles = '';
          let Icon = Box;
          
          switch(data.type) {
              case 'arch-start':
                  styles = 'bg-emerald-100 border-emerald-500 rounded-full px-8 py-3';
                  Icon = Play;
                  break;
              case 'arch-end':
                  styles = 'bg-red-100 border-red-500 rounded-full px-8 py-3';
                  Icon = Flag;
                  break;
              case 'arch-decision':
                  // Diamond shape simulation via CSS or specialized container
                  styles = 'bg-yellow-50 border-yellow-500 rounded-lg transform rotate-0 px-6 py-4';
                  Icon = HelpCircle;
                  break;
              case 'arch-process':
              default:
                  styles = 'bg-white border-black rounded-xl px-4 py-3 min-w-[200px]';
                  Icon = Settings;
                  break;
          }

          if (data.type === 'arch-decision') {
              return (
                  <div className={`
                      relative flex flex-col items-center justify-center border-2 shadow-comic-sm
                      ${styles} ${selected ? 'ring-2 ring-blue-400' : ''}
                  `}>
                      <div className="flex items-center gap-2 mb-1">
                          <Icon size={16} className="text-yellow-700"/>
                          <span className="font-bold text-sm text-center text-yellow-900">{data.label}</span>
                      </div>
                      <div className="text-[10px] text-yellow-700/70 text-center leading-tight max-w-[150px]">{data.details?.[0]}</div>
                      
                      <Handle type="target" position={Position.Top} className="!bg-black !w-3 !h-3" />
                      <Handle type="source" position={Position.Bottom} className="!bg-black !w-3 !h-3" />
                  </div>
              )
          }

          return (
             <div className={`
                 relative flex flex-col items-center border-2 shadow-comic transition-transform
                 ${styles} ${selected ? 'scale-105' : ''}
             `}>
                 <div className="flex items-center gap-2">
                     <div className="p-1.5 rounded-full bg-white/50 border border-black/10">
                         <Icon size={16} />
                     </div>
                     <span className="font-bold text-sm text-black">{data.label}</span>
                 </div>
                 {data.details && (
                     <div className="text-[10px] text-gray-500 mt-1 max-w-[180px] text-center leading-tight">
                         {data.details[0]}
                     </div>
                 )}
                 <Handle type="target" position={Position.Top} className="!bg-black !w-3 !h-3 !border-2 !border-white" />
                 <Handle type="source" position={Position.Bottom} className="!bg-black !w-3 !h-3 !border-2 !border-white" />
             </div>
          );
      }

      // 2B. COMPONENT ARCHITECTURE NODES (Legacy/Mix)
      let Icon = Box;
      let bgColor = 'bg-white';
      let borderColor = 'border-black';
      let shadow = 'shadow-[6px_6px_0px_rgba(0,0,0,1)]';
      let labelColor = 'bg-black text-white';

      switch(data.type) {
          case 'arch-client': Icon = Monitor; bgColor = 'bg-blue-50'; labelColor = 'bg-blue-600 text-white'; break;
          case 'arch-server': Icon = Server; bgColor = 'bg-slate-100'; labelColor = 'bg-slate-800 text-white'; break;
          case 'arch-db': Icon = Database; bgColor = 'bg-orange-50'; labelColor = 'bg-orange-500 text-white'; break;
          case 'arch-service': Icon = Settings; bgColor = 'bg-purple-50'; labelColor = 'bg-purple-600 text-white'; break;
          case 'arch-external': Icon = Globe; bgColor = 'bg-green-50'; labelColor = 'bg-green-600 text-white'; break;
      }

      return (
        <div className={`
            relative w-[300px] flex flex-col rounded-2xl border-2 ${borderColor} ${bgColor} ${shadow}
            transition-transform duration-200 ${selected ? 'scale-105' : ''}
        `}>
            {/* Header */}
            <div className={`px-4 py-2 rounded-t-xl border-b-2 border-black flex items-center justify-between ${labelColor}`}>
                <div className="flex items-center gap-2">
                    <Icon size={16} />
                    <span className="font-bold font-mono text-sm tracking-wide uppercase">{data.type.replace('arch-', '')}</span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4">
                <div className="font-black text-lg text-black mb-2 leading-tight">{data.label}</div>
                <div className="text-xs text-gray-600 font-medium leading-relaxed">
                    {data.details?.[0]}
                </div>
            </div>

            <Handle type="target" position={Position.Top} className="!bg-black !w-4 !h-4 !border-2 !border-white" />
            <Handle type="source" position={Position.Bottom} className="!bg-black !w-4 !h-4 !border-2 !border-white" />
        </div>
      );
  }

  // --- 3. STANDARD FLOWCHART NODES ---
  if (mode === 'flowchart') {
      const type = data.type || 'process';
      
      let bgColor = COLORS.process;
      let Icon = Server;
      let borderColor = 'border-black';
      let typeLabel = 'Module';

      switch (type) {
          case 'entry': bgColor = '#bef264'; Icon = User; typeLabel="Entry Point"; break;
          case 'database': bgColor = '#fdba74'; Icon = Database; typeLabel="Store"; break;
          case 'cluster': bgColor = '#e2e8f0'; Icon = Cloud; typeLabel="Group"; break;
          case 'file': bgColor = '#ffffff'; Icon = FileCode; typeLabel="File"; break;
          case 'class': bgColor = '#bae6fd'; Icon = Box; typeLabel="Class"; break;
          case 'function': bgColor = '#ddd6fe'; Icon = Code2; typeLabel="Function"; break; 
          default: bgColor = '#bae6fd'; Icon = Server; break;
      }

      return (
        <div className={`
             relative bg-white border-2 ${borderColor} rounded-xl w-[260px]
             shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-transform duration-200
             flex flex-col overflow-hidden group
             ${selected ? 'scale-105 ring-2 ring-blue-500' : ''}
        `}>
           <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black/5 bg-slate-50">
               <div className="flex items-center gap-2">
                   <Icon size={14} className="text-slate-500" />
                   <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{typeLabel}</span>
               </div>
           </div>

           <div className="p-3 bg-white">
               <div className="font-bold text-sm text-black mb-1 truncate leading-tight" title={data.label}>
                   {data.label}
               </div>
               {data.details && data.details[0] && (
                   <div className="text-[11px] font-medium text-gray-500 leading-snug line-clamp-3">
                       {data.details[0]}
                   </div>
               )}
           </div>

           <Handle type="target" position={Position.Top} className="!bg-black !w-3 !h-3 !border-2 !border-white" />
           <Handle type="source" position={Position.Bottom} className="!bg-black !w-3 !h-3 !border-2 !border-white" />
        </div>
      );
  }

  // --- 4. MINDMAP MODE ---
  if (mode === 'mindmap') {
      const type = data.type || 'file';

      // EXPANSION BUTTON
      const ExpandButton = () => (
          <button 
              onClick={onExpandClick}
              className={`
                  absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full border-2 border-black flex items-center justify-center
                  shadow-sm hover:scale-110 active:scale-95 transition-all
                  ${data.isCollapsed ? 'bg-comic-blue text-black' : 'bg-white text-gray-400'}
              `}
          >
              {data.isCollapsed ? <Plus size={12} strokeWidth={3} /> : <Minus size={12} strokeWidth={3} />}
          </button>
      );

      // --- LOGIC NODES (If, Loop, etc) ---
      if (type.startsWith('logic-')) {
          let LogicIcon = PlayCircle;
          let logicColor = 'bg-slate-100 border-slate-300';
          let textColor = 'text-slate-700';

          if (type === 'logic-if') {
              LogicIcon = HelpCircle;
              logicColor = 'bg-pink-50 border-pink-300 ring-pink-100';
              textColor = 'text-pink-700';
          } else if (type === 'logic-loop') {
              LogicIcon = Repeat;
              logicColor = 'bg-orange-50 border-orange-300';
              textColor = 'text-orange-700';
          } else if (type === 'logic-return') {
              LogicIcon = LogOut;
              logicColor = 'bg-red-50 border-red-300';
              textColor = 'text-red-700';
          } else if (type === 'logic-action') {
              LogicIcon = CheckCircle2;
              logicColor = 'bg-white border-slate-200';
              textColor = 'text-slate-600';
          }

          return (
              <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`
                    relative flex items-center gap-3 px-3 py-2 rounded-lg border shadow-sm min-w-[180px] max-w-[280px]
                    ${logicColor} ${selected ? 'ring-2 ring-blue-400' : ''}
                  `}
              >
                  <div className={`p-1 rounded-full bg-white/50`}>
                      <LogicIcon size={14} className={textColor} />
                  </div>
                  <div className={`text-xs font-mono font-medium leading-tight ${textColor}`}>
                      {data.label}
                  </div>
                  
                  {data.hasChildren && <ExpandButton />}

                  <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2 !h-2" />
                  <Handle type="source" position={Position.Right} className="!bg-slate-400 !w-2 !h-2" />
              </motion.div>
          );
      }

      // --- STRUCTURAL NODES (File, Class, Function) ---

      let iconBg = 'bg-white';
      let Icon = FileCode;
      let containerClass = '';
      
      if (type === 'file' || type === 'entry') {
          containerClass = 'min-w-[280px] bg-white border-l-[6px] border-l-blue-500 rounded-r-lg shadow-md';
          Icon = Folder;
          iconBg = 'bg-blue-100 text-blue-600';
      } else if (type === 'class' || type === 'component') {
          containerClass = 'min-w-[260px] bg-white border-l-[6px] border-l-purple-500 rounded-r-lg shadow-sm';
          Icon = Box;
          iconBg = 'bg-purple-100 text-purple-600';
      } else if (type === 'function' || type === 'hook') {
           return (
              <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`
                    relative flex flex-col p-3 min-w-[320px] bg-slate-50 border-l-[6px] border-l-emerald-500 rounded-r-lg border-y border-r border-slate-200
                    ${selected ? 'ring-2 ring-emerald-400 shadow-lg' : 'shadow-sm'}
                    group
                  `}
              >
                  <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                           <div className="p-1 rounded bg-emerald-100 text-emerald-600">
                               <Braces size={12} strokeWidth={3} />
                           </div>
                           <span className="font-bold text-sm font-mono text-slate-800">{data.label}</span>
                      </div>
                      {data.complexity && (
                          <div className="text-[9px] font-black px-1.5 py-0.5 rounded border uppercase bg-white text-slate-500 border-slate-200">
                              {data.complexity}
                          </div>
                      )}
                  </div>

                  <div className="bg-white rounded border border-slate-200 p-2 mb-2">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 mb-1">
                          <span className="text-purple-500 font-bold">In:</span>
                          <span className="truncate max-w-[180px]">{data.params || '()'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
                          <span className="text-orange-500 font-bold">Out:</span>
                          <span className="truncate max-w-[180px]">{data.returnType || 'void'}</span>
                      </div>
                  </div>
                  
                  {data.hasChildren && <ExpandButton />}

                  <Handle type="target" position={Position.Left} className="!bg-emerald-400 !w-2 !h-2" />
                  <Handle type="source" position={Position.Right} className="!bg-emerald-400 !w-2 !h-2" />
              </motion.div>
          );
      } else {
          containerClass = 'min-w-[200px] bg-white border border-slate-200 rounded';
      }

      return (
          <motion.div 
             initial={{ opacity: 0, scale: 0.5, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             transition={{ type: "spring", stiffness: 260, damping: 20 }}
             className={`
                relative flex flex-col p-4 ${containerClass}
                ${selected ? 'ring-2 ring-blue-400' : ''}
             `}
          >
             <div className="flex items-center justify-between mb-1">
                 <div className="flex items-center gap-2">
                     <div className={`p-1.5 rounded-md ${iconBg}`}>
                         <Icon size={16} />
                     </div>
                     <div className="font-bold text-sm text-slate-800 truncate max-w-[200px]" title={data.label}>
                         {data.label}
                     </div>
                 </div>
             </div>
             {type === 'file' && data.details && (
                 <div className="text-[10px] text-slate-500 mt-2 border-t border-slate-100 pt-1 line-clamp-2">
                     {data.details[0]}
                 </div>
             )}

             {data.hasChildren && <ExpandButton />}

             <Handle type="target" position={Position.Left} className="!bg-slate-800 !w-2 !h-2" />
             <Handle type="source" position={Position.Right} className="!bg-slate-800 !w-2 !h-2" />
          </motion.div>
      );
  }

  return null;
};

export default memo(CustomNode);