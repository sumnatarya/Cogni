import React from 'react';
import { Clock, Repeat, TrendingUp, BookOpen, Zap, CalendarCheck } from 'lucide-react';
import { LearningAnalysis } from '../types';
import { RetentionChart } from './RetentionChart';

interface ResultsDashboardProps {
  data: LearningAnalysis;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ data }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3">
            <Clock size={24} />
          </div>
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Time</span>
          <span className="text-2xl font-display font-bold text-slate-900">{data.estimatedMinutesTotal} min</span>
          <span className="text-xs text-slate-400 mt-1">Active Focus Required</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-full mb-3">
            <Repeat size={24} />
          </div>
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Spaced Reps</span>
          <span className="text-2xl font-display font-bold text-slate-900">{data.recommendedRepetitions}</span>
          <span className="text-xs text-slate-400 mt-1">Optimal Sessions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-3">
            <TrendingUp size={24} />
          </div>
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Complexity</span>
          <span className="text-2xl font-display font-bold text-slate-900">{data.difficultyRating}</span>
          <span className="text-xs text-slate-400 mt-1">Cognitive Load</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Plan Timeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-bold text-slate-800 flex items-center">
              <CalendarCheck className="w-5 h-5 mr-2 text-brand-500" />
              Optimization Schedule
            </h2>
          </div>

          <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
            {data.studyPlan.map((session, idx) => (
              <div key={idx} className="relative pl-8">
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-brand-500"></div>
                
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between bg-slate-50 p-4 rounded-xl hover:bg-brand-50 transition-colors group">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded uppercase">
                        {session.intervalLabel}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        Session {session.sessionNumber}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-brand-700">{session.method}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{session.focusDescription}</p>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center text-slate-500 font-medium text-sm whitespace-nowrap">
                    <Clock className="w-4 h-4 mr-1" />
                    {session.durationMinutes} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Science & Insights */}
        <div className="space-y-6">
            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Retention Projection</h3>
                <RetentionChart reps={data.recommendedRepetitions} />
                <p className="text-xs text-slate-400 mt-3 text-center italic">
                    Projected memory decay vs. reinforcement (Ebbinghaus)
                </p>
            </div>

            {/* Rationale */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-2 mb-3 text-brand-300">
                    <Zap size={20} />
                    <h3 className="font-bold uppercase tracking-wide text-sm">Why this works</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed opacity-90">
                    {data.scientificRationale}
                </p>
            </div>

            {/* Key Concepts */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-4 text-slate-700">
                    <BookOpen size={20} />
                    <h3 className="font-bold">Key Concepts to Chunk</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {data.keyConcepts.map((concept, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full border border-slate-200">
                            {concept}
                        </span>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
