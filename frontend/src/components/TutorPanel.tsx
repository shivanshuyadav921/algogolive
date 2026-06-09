'use client';

import React, { useState } from 'react';
import { BookOpen, HelpCircle, Code, ShieldAlert, Award } from 'lucide-react';

interface TutorPanelProps {
  data: {
    intuition: string;
    bruteForce: string;
    optimized: string;
    complexity: {
      time: string;
      space: string;
    };
    edgeCases: string[];
    commonMistakes: string[];
    interviewTips: string[];
  };
}

export const TutorPanel: React.FC<TutorPanelProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'explanation' | 'edge-cases' | 'tips'>('explanation');

  return (
    <div className="w-full glass-panel rounded-2xl p-6 shadow-xl flex flex-col h-full">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-card-border pb-3 mb-4">
        <button
          onClick={() => setActiveTab('explanation')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'explanation' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Explanation
        </button>

        <button
          onClick={() => setActiveTab('edge-cases')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'edge-cases' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Bounds & Edge Cases
        </button>

        <button
          onClick={() => setActiveTab('tips')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'tips' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" /> Interview Tips
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === 'explanation' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-2">Intuition</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{data.intuition}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-card-border p-4 rounded-xl bg-slate-950/20">
                <h5 className="text-xs font-semibold text-slate-400 mb-2">Brute Force Approach</h5>
                <p className="text-xs text-slate-400 leading-relaxed">{data.bruteForce}</p>
              </div>
              <div className="border border-indigo-950/50 p-4 rounded-xl bg-indigo-950/10">
                <h5 className="text-xs font-semibold text-indigo-400 mb-2">Optimized Approach</h5>
                <p className="text-xs text-slate-300 leading-relaxed">{data.optimized}</p>
              </div>
            </div>

            <div className="border border-card-border rounded-xl p-4 bg-slate-950/20">
              <h4 className="text-xs font-semibold text-slate-300 mb-3">Complexity Analysis</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase">Time Complexity</span>
                  <p className="text-sm font-mono font-bold text-accent-violet mt-1">{data.complexity.time}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase">Space Complexity</span>
                  <p className="text-sm font-mono font-bold text-accent-violet mt-1">{data.complexity.space}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'edge-cases' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-accent-rose uppercase tracking-wider mb-3">Critical Edge Cases</h4>
              <ul className="space-y-2">
                {data.edgeCases.map((ec, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2.5">
                    <span className="text-accent-rose mt-1">-</span>
                    <span>{ec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-card-border pt-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Common Pitfalls</h4>
              <ul className="space-y-2">
                {data.commonMistakes.map((cm, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2.5">
                    <span className="text-slate-500 mt-1">-</span>
                    <span>{cm}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-accent-amber uppercase tracking-wider mb-2">FAANG Coaching Notes</h4>
            <div className="space-y-3">
              {data.interviewTips.map((tip, idx) => (
                <div key={idx} className="flex gap-3 border border-card-border p-4 rounded-xl bg-slate-950/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-amber mt-2 shrink-0" />
                  <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
