import React from 'react';
import { BrainCircuit } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-brand-500 p-2 rounded-lg text-white">
            <BrainCircuit size={24} />
          </div>
          <h1 className="text-xl font-display font-bold text-slate-900">CogniPlan</h1>
        </div>
        <nav>
          <a href="#" className="text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors">
            Science of Learning
          </a>
        </nav>
      </div>
    </header>
  );
};
