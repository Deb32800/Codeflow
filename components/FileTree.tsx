import React, { useState } from 'react';
import { FileNode } from '../types';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface FileTreeProps {
  nodes: FileNode[];
  onSelectFile: (node: FileNode) => void;
  selectedPath?: string;
  level?: number;
}

export const FileTree: React.FC<FileTreeProps> = ({ nodes, onSelectFile, selectedPath, level = 0 }) => {
  return (
    <div className="flex flex-col select-none font-mono text-xs">
      {nodes.map((node) => (
        <FileTreeNode 
          key={node.path} 
          node={node} 
          onSelectFile={onSelectFile} 
          selectedPath={selectedPath}
          level={level}
        />
      ))}
    </div>
  );
};

const FileTreeNode: React.FC<{
  node: FileNode;
  onSelectFile: (node: FileNode) => void;
  selectedPath?: string;
  level: number;
}> = ({ node, onSelectFile, selectedPath, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedPath === node.path;
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.isFolder) setIsOpen(!isOpen);
    else onSelectFile(node);
  };

  const paddingLeft = level * 12 + 16;

  return (
    <div>
      <div 
        onClick={handleClick}
        className={`
          flex items-center py-1.5 pr-4 cursor-pointer transition-colors border-l-2
          ${isSelected 
            ? 'text-white border-white bg-white/5' 
            : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02] border-transparent'}
        `}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <span className="mr-2 opacity-50" style={{ minWidth: 16 }}>
          {node.isFolder && (
             isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />
          )}
        </span>
        <span className="truncate">{node.name}</span>
      </div>

      {node.isFolder && isOpen && node.children && (
        <div>
          <FileTree 
            nodes={node.children} 
            onSelectFile={onSelectFile} 
            selectedPath={selectedPath}
            level={level + 1}
          />
        </div>
      )}
    </div>
  );
};