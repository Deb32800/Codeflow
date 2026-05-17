import React, { useCallback } from 'react';
import { Upload, FileArchive } from 'lucide-react';

interface FileUploaderProps {
  onFileLoaded: (file: File) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoaded }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed')) {
      onFileLoaded(file);
    } else {
      alert("Please upload a valid .zip file");
    }
  }, [onFileLoaded]);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileLoaded(e.target.files[0]);
    }
  };

  return (
    <div 
      className="w-full max-w-lg mx-auto p-12 border border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 group flex flex-col items-center justify-center text-center"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="mb-6 p-4 rounded-full bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
        <Upload size={24} className="text-white" />
      </div>
      
      <h3 className="text-lg font-mono text-white mb-2">Upload Source Code</h3>
      <p className="text-sm text-gray-500 mb-8 font-light">
        Drop your <code className="text-white bg-white/10 px-1 py-0.5 rounded">.zip</code> archive here to begin analysis.
      </p>
      
      <label className="cursor-pointer inline-flex">
        <span className="px-6 py-2 bg-white text-black font-mono text-sm hover:bg-gray-200 transition-colors">
          Browse Files
        </span>
        <input 
          type="file" 
          accept=".zip,application/zip,application/x-zip-compressed" 
          className="hidden" 
          onChange={handleChange}
        />
      </label>
    </div>
  );
};