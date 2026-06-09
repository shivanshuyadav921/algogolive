'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, CheckCircle2, ChevronRight, Award, Compass } from 'lucide-react';

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/problems/roadmaps');
        if (res.ok) {
          const data = await res.json();
          setRoadmaps(data);
        } else {
          setRoadmaps({
            neetcode150: { title: 'NeetCode 150', description: 'Complete NeetCode 150 practice sheet matching modern FAANG questions.', totalProblems: 150 },
            blind75: { title: 'Blind 75', description: 'The classic curated list of top 75 LeetCode exercises.', totalProblems: 75 },
            grind169: { title: 'Grind 169', description: 'Advanced progression sheet building on Blind 75.', totalProblems: 169 }
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground text-sm animate-pulse">Loading roadmap sheets...</p>
      </div>
    );
  }

  const cards = Object.values(roadmaps);

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full gap-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Layers className="w-5.5 h-5.5 text-primary" /> Curated Roadmaps
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Focus your preparation on targeted sheets optimized for tech interviews.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card: any, idx: number) => {
          let percentage = 0;
          let color = 'from-primary to-accent-violet';
          
          if (card.title.includes('Blind')) {
            percentage = 24;
            color = 'from-accent-violet to-purple-600';
          } else if (card.title.includes('Neet')) {
            percentage = 12;
            color = 'from-primary to-blue-600';
          } else {
            percentage = 0;
            color = 'from-slate-800 to-slate-900 border border-slate-700/50';
          }

          return (
            <div
              key={idx}
              className="glass-panel rounded-2xl p-6 shadow-xl flex flex-col justify-between gap-6 hover:border-primary/20 transition-all"
            >
              <div className="space-y-4">
                <span className="text-[9px] uppercase tracking-widest text-primary font-bold">Checklist Guide</span>
                <h3 className="text-base font-bold text-slate-200">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{card.description}</p>
                
                {/* Progress Tracker */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Solved Progress</span>
                    <span className="text-slate-300">{percentage}% ({Math.round((percentage / 100) * card.totalProblems)}/{card.totalProblems})</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`}
                    />
                  </div>
                </div>
              </div>

              <Link
                href="/problems"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary-hover border border-indigo-500/20 text-xs font-bold text-white transition-all mt-2"
              >
                Open Checklist <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>

    </div>
  );
}
