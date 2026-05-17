import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';

export const AnimatedEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Background Line (Subtle Guide) */}
      <BaseEdge 
        path={edgePath} 
        style={{
            ...style, 
            stroke: '#e2e8f0', // slate-200
            strokeWidth: 4,
            opacity: 0.5
        }} 
      />
      
      {/* Foreground Animated Line (Black Dotted) */}
      <path
        d={edgePath}
        fill="none"
        stroke="#18181b" // slate-900 (Black)
        strokeWidth="2"
        markerEnd={markerEnd}
        className="animate-flow-dash"
        style={{
            strokeDasharray: '6, 6', // Tighter dots
        }}
      />

      {/* Label */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
            }}
            className="bg-white px-2 py-0.5 rounded border border-black text-[10px] font-bold text-black shadow-comic-sm whitespace-nowrap z-10"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
      
      <style>{`
        .animate-flow-dash {
           animation: flowDash 30s linear infinite; /* Slower, more subtle animation */
        }
        @keyframes flowDash {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </>
  );
};