'use client';

import React from 'react';
import { User, Award, Zap, BookOpen, Layers } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full gap-6">
      
      {/* Profile Header Widget */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-accent-violet flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-indigo-500/10">
          U
        </div>

        <div className="space-y-1 text-center md:text-left flex-1">
          <h3 className="text-lg font-bold text-slate-100">Candidate Demo User</h3>
          <p className="text-xs text-muted-foreground">Premium Pro Subscriber</p>
          <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
            <span className="px-2.5 py-1 rounded bg-[#1e1b4b] border border-indigo-500/20 text-[10px] font-bold text-indigo-300">
              Rank: FAANG Candidate
            </span>
            <span className="px-2.5 py-1 rounded bg-orange-950/20 border border-orange-500/20 text-[10px] font-bold text-orange-400">
              Streak: 5 Days
            </span>
          </div>
        </div>
      </div>

      {/* Profile Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Achievements Card */}
        <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Achievements</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border border-card-border bg-slate-950/10 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-orange-950/30 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xs">
                🔥
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-200">5-Day Heat Streak</h5>
                <p className="text-[10px] text-slate-500">Solved coding challenges for 5 consecutive days.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border border-card-border bg-slate-950/10 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-center text-primary font-bold text-xs">
                💡
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-200">DP Pathfinder</h5>
                <p className="text-[10px] text-slate-500">Successfully visualized 3 different Dynamic Programming matrices.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown of difficulties resolved */}
        <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Difficulty Breakdown</h4>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-350">Easy Exercises</span>
                <span className="font-mono text-slate-400">12 / 50</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div style={{ width: '24%' }} className="h-full bg-accent-emerald rounded-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-350">Medium Exercises</span>
                <span className="font-mono text-slate-400">5 / 80</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div style={{ width: '6.2%' }} className="h-full bg-accent-amber rounded-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-350">Hard Exercises</span>
                <span className="font-mono text-slate-400">1 / 20</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div style={{ width: '5%' }} className="h-full bg-accent-rose rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
