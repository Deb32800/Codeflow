import React from 'react';
import { X } from 'lucide-react';
import { FileNode } from '../types';

interface CodePanelProps {
  file: FileNode | null;
  onClose: () => void;
}

export const CodePanel: React.FC<CodePanelProps> = ({ file, onClose }) => {
  if (!file) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-[600px] bg-black border-l border-white/10 flex flex-col z-50 shadow-2xl animate-fade-in">
      
      {/* Header */}
      <div className="h-12 px-6 border-b border-white/10 flex items-center justify-between bg-black">
        <span className="font-mono text-xs text-white uppercase tracking-wider">{file.name}</span>
        <button onClick={onClose} className="hover:bg-white/10 p-1 rounded text-gray-500 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 border-b border-white/10">
        <div className="p-4 border-r border-white/10">
            <div className="text-[10px] text-gray-600 uppercase mb-1">Size</div>
            <div className="text-xs text-gray-300 font-mono">{file.content?.length || 0} bytes</div>
        </div>
        <div className="p-4">
            <div className="text-[10px] text-gray-600 uppercase mb-1">Path</div>
            <div className="text-xs text-gray-300 font-mono truncate" title={file.path}>{file.path}</div>
        </div>
      </div>

      {/* Code */}
      <div className="flex-1 overflow-auto bg-[#050505] custom-scrollbar">
        <pre className="p-6 text-[12px] font-mono text-gray-400 leading-relaxed whitespace-pre-wrap">
            {file.content || '// Source code not available'}
        </pre>
      </div>
    </div>
  );
};