"use client"
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="relative">
        {/* Outer rotating circle */}
        <div className="absolute inset-0 border-2 border-blue-200 rounded-full animate-ping-slow"></div>
        
        {/* Main loader with gradient */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      </div>
      
      {/* Text content with fade animation */}
      <div className="mt-8 text-center space-y-2">
        <h2 className="text-xl font-semibold text-slate-700 animate-pulse">
          Loading
        </h2>
        <p className="text-slate-500 font-medium animate-fade-in-out">
          Loading...
        </p>
      </div>
      
      {/* Progress indicator */}
      <div className="mt-8 w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-400 rounded-full animate-progress"></div>
      </div>
      
      <style jsx>{`
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes fade-in-out {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-ping-slow {
          animation: ping-slow 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-fade-in-out {
          animation: fade-in-out 1.5s ease-in-out infinite;
        }
        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}