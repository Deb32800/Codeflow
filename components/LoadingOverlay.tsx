import React from 'react';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = "LOADING..." }) => {
  return (
    <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden">
      
      {/* Bouncing Boxes Animation */}
      <div className="flex gap-2 mb-8">
          <div className="w-8 h-8 bg-comic-blue border-2 border-black rounded shadow-comic-sm animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-8 h-8 bg-comic-pink border-2 border-black rounded shadow-comic-sm animate-bounce" style={{ animationDelay: '100ms' }}></div>
          <div className="w-8 h-8 bg-comic-yellow border-2 border-black rounded shadow-comic-sm animate-bounce" style={{ animationDelay: '200ms' }}></div>
      </div>

      <h2 className="text-2xl font-black text-black tracking-widest mb-2">
          {message}
      </h2>
      
      <div className="font-bold text-xs text-gray-400">
          WRITING THE STORY...
      </div>
    </div>
  );
};