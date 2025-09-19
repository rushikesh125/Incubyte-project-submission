"use client"
import { ArrowLeft, Home, Search, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="text-center max-w-md mx-auto">
        {/* Animated icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-12 h-12 text-purple-500" />
          </div>
          <div className="absolute -inset-4 border-2 border-purple-200 rounded-full animate-ping-slow opacity-75"></div>
        </div>

        {/* Error code with gradient text */}
        <h1 className="text-9xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
          404
        </h1>
        
        {/* Message */}
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Page Not Found</h2>
        <p className="text-slate-600 mb-8">
          Sorry, we couldn't find the page you're looking for. Perhaps you've mistyped the URL or the page has been moved.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors shadow-sm hover:shadow-md"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-5 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        
      </div>

      <style jsx>{`
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}