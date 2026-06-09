'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Zap, HelpCircle, Compass, CheckCircle2, ChevronRight, BarChart3, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock dashboard fallback for demo candidate
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/users/demo-user-id/dashboard');
        if (res.ok) {
          const dashboardData = await res.json();
          setData(dashboardData);
        } else {
          // fallback mock state if database is loading/migrating
          setData({
            streak: { current: 5, longest: 12 },
            solvedCount: 18,
            totalCount: 150,
            completionRate: 12,
            topicMastery: [
              { topic: 'Arrays', percentage: 70, solved: 7, total: 10 },
              { topic: 'Stacks', percentage: 40, solved: 2, total: 5 },
              { topic: 'Binary Search', percentage: 20, solved: 1, total: 5 },
              { topic: 'Graphs', percentage: 0, solved: 0, total: 8 },
              { topic: 'Dynamic Programming', percentage: 10, solved: 1, total: 10 }
            ],
            recommendedProblems: [
              { title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'EASY', category: 'Stacks' },
              { title: 'Binary Search', slug: 'binary-search', difficulty: 'EASY', category: 'Binary Search' }
            ],
            heatmap: {
              '2026-06-09': 3,
              '2026-06-08': 1,
              '2026-06-07': 5,
              '2026-06-05': 2
            }
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground text-sm animate-pulse">Loading dashboard statistics...</p>
      </div>
    );
  }

  // Draw Heatmap Grid helper (last 12 weeks of activity squares)
  const drawHeatmap = () => {
    const days = Array.from({ length: 84 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (83 - i));
      const key = d.toISOString().split('T')[0];
      return {
        date: key,
        count: data.heatmap[key] || 0,
      };
    });

    return (
      <div className="grid grid-flow-col grid-rows-7 gap-1 max-w-full overflow-x-auto py-2">
        {days.map((day, idx) => {
          let color = 'bg-slate-900 border border-slate-950/20'; // no commits
          if (day.count === 1) color = 'bg-indigo-950 border border-indigo-900/40';
          else if (day.count >= 2 && day.count <= 3) color = 'bg-indigo-700';
          else if (day.count > 3) color = 'bg-accent-cyan';

          return (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-sm transition-all duration-300 ${color}`}
              title={`${day.date}: ${day.count} submissions`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full gap-6">
      
      {/* Analytics widgets grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Streak widget */}
        <div className="glass-panel rounded-2xl p-6 shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-950/20 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Active Streak</span>
            <p className="text-lg font-bold text-slate-200 mt-0.5">{data.streak.current} Days</p>
            <span className="text-[9px] text-muted-foreground">Longest record: {data.streak.longest} days</span>
          </div>
        </div>

        {/* Solved Count */}
        <div className="glass-panel rounded-2xl p-6 shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-center text-accent-emerald">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Solved Exercises</span>
            <p className="text-lg font-bold text-slate-200 mt-0.5">{data.solvedCount} Problems</p>
            <span className="text-[9px] text-muted-foreground">Mastered: {data.completionRate}% of platform</span>
          </div>
        </div>

        {/* Target Level */}
        <div className="glass-panel rounded-2xl p-6 shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-center text-accent-violet">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Ranking Badge</span>
            <p className="text-lg font-bold text-slate-200 mt-0.5">FAANG Intern</p>
            <span className="text-[9px] text-muted-foreground">Target status achieved</span>
          </div>
        </div>

        {/* Global mastery */}
        <div className="glass-panel rounded-2xl p-6 shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center text-accent-cyan">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Rank Index</span>
            <p className="text-lg font-bold text-slate-200 mt-0.5">Top 12%</p>
            <span className="text-[9px] text-muted-foreground">Platform percentile metric</span>
          </div>
        </div>

      </div>

      {/* Main analytics board grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Heatmap & Topic Mastery (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Submission Heatmap Card */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-250 flex items-center gap-2">
              Activity Heatmap
            </h3>
            <div className="border border-card-border p-4 rounded-xl bg-slate-950/20">
              {drawHeatmap()}
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-3.5">
                <span>84 Days Consecutive Analytics</span>
                <div className="flex items-center gap-1">
                  <span>Less</span>
                  <div className="w-2.5 h-2.5 rounded-sm bg-slate-900" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-indigo-950" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-indigo-700" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-accent-cyan" />
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>

          {/* Topic Mastery Progress List */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-250">Topic Mastery Profiles</h3>
            <div className="space-y-4">
              {data.topicMastery.map((tm: any) => (
                <div key={tm.topic} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-350">{tm.topic}</span>
                    <span className="font-mono text-slate-400">{tm.percentage}% ({tm.solved}/{tm.total})</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${tm.percentage}%` }}
                      className="h-full bg-gradient-to-r from-primary to-accent-cyan rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recommendations & Weak Areas (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Weak Areas Alerts */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-250 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-accent-rose" /> Weak Areas Identified
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Based on your submission history, your completion rate is below 40% for the following topics. Master these to improve your interview performance.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {data.topicMastery.filter((t: any) => t.percentage < 50).map((tm: any) => (
                <span
                  key={tm.topic}
                  className="px-3 py-1.5 rounded-lg border border-red-950/45 bg-red-950/10 text-xs font-semibold text-accent-rose flex items-center gap-1.5"
                >
                  {tm.topic} ({tm.percentage}%)
                </span>
              ))}
            </div>
          </div>

          {/* Practice Recommendations */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-250">Recommended Next Problems</h3>
            <div className="space-y-2.5">
              {data.recommendedProblems.map((prob: any) => {
                let badge = 'border-slate-800 text-slate-400';
                if (prob.difficulty === 'EASY') badge = 'border-emerald-950 bg-emerald-950/10 text-accent-emerald';
                else if (prob.difficulty === 'MEDIUM') badge = 'border-amber-950 bg-amber-950/10 text-accent-amber';

                return (
                  <div key={prob.slug} className="flex items-center justify-between p-3.5 rounded-xl border border-card-border bg-slate-950/10 hover:bg-slate-950/30 transition-all">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">{prob.title}</h4>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">{prob.category}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${badge}`}>
                        {prob.difficulty}
                      </span>
                      <Link href="/visualize" className="p-1 rounded bg-secondary hover:bg-secondary-hover border border-indigo-500/20 text-slate-300 hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
