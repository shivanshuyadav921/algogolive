'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, BookOpen, Layers, Sparkles, Filter, ChevronRight } from 'lucide-react';

export default function ProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'neetcode' | 'blind75' | 'grind169'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        let url = 'http://localhost:4000/api/problems';
        const params = [];
        if (activeFilter !== 'all') {
          params.push(`sheet=${activeFilter}`);
        }
        if (categoryFilter !== 'all') {
          params.push(`category=${encodeURIComponent(categoryFilter)}`);
        }
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const list = await res.json();
          setProblems(list);
        } else {
          // Mock problems if server is launching/migrating
          setProblems([
            { id: '1', title: 'Two Sum', slug: 'two-sum', difficulty: 'EASY', category: 'Arrays', neetcodeSheet: true, blind75Sheet: true, grind169Sheet: true },
            { id: '2', title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'EASY', category: 'Stacks', neetcodeSheet: true, blind75Sheet: true, grind169Sheet: true },
            { id: '3', title: 'Binary Search', slug: 'binary-search', difficulty: 'EASY', category: 'Binary Search', neetcodeSheet: true, blind75Sheet: false, grind169Sheet: true },
            { id: '4', title: 'Longest Common Subsequence', slug: 'longest-common-subsequence', difficulty: 'MEDIUM', category: 'Dynamic Programming', neetcodeSheet: true, blind75Sheet: true, grind169Sheet: false }
          ]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [activeFilter, categoryFilter]);

  const categories = ['all', 'Arrays', 'Stacks', 'Binary Search', 'Dynamic Programming'];

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5.5 h-5.5 text-primary" /> Problem Explorer
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Explore standard coding interview tasks and practice sheets.</p>
        </div>

        {/* Dynamic Sheets filter */}
        <div className="flex gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-card-border">
          {['all', 'neetcode', 'blind75', 'grind169'].map((sheet) => (
            <button
              key={sheet}
              onClick={() => setActiveFilter(sheet as any)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeFilter === sheet ? 'bg-secondary text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {sheet === 'all' ? 'All Problems' : sheet}
            </button>
          ))}
        </div>
      </div>

      {/* Problem list layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left column filter category cards */}
        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 border-b border-card-border pb-2.5">
            <Filter className="w-4 h-4 text-primary" /> Category Filter
          </h3>

          <div className="flex flex-col gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  categoryFilter === cat ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'Show All' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Right column: list of matching problems */}
        <div className="lg:col-span-3 space-y-3">
          {loading ? (
            <div className="h-40 flex items-center justify-center border border-card-border rounded-2xl bg-card">
              <p className="text-muted-foreground text-xs animate-pulse">Loading problem set...</p>
            </div>
          ) : problems.length === 0 ? (
            <div className="h-40 flex items-center justify-center border border-dashed border-card-border rounded-2xl bg-card">
              <p className="text-muted-foreground text-xs">No matching exercises found.</p>
            </div>
          ) : (
            problems.map((prob) => {
              let diffColor = 'border-slate-800 text-slate-400';
              if (prob.difficulty === 'EASY') diffColor = 'border-emerald-950 bg-emerald-950/10 text-accent-emerald';
              else if (prob.difficulty === 'MEDIUM') diffColor = 'border-amber-950 bg-amber-950/10 text-accent-amber';

              return (
                <div
                  key={prob.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-card-border bg-slate-950/10 hover:bg-slate-950/20 transition-all hover:border-primary/25"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">{prob.title}</h4>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] text-muted-foreground">{prob.category}</span>
                      <span className="text-[10px] text-slate-650">•</span>
                      {prob.neetcodeSheet && <span className="text-[9px] text-primary font-bold">NeetCode 150</span>}
                      {prob.blind75Sheet && <span className="text-[9px] text-accent-violet font-bold">Blind 75</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold ${diffColor}`}>
                      {prob.difficulty}
                    </span>
                    <Link
                      href="/visualize"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary-hover border border-indigo-500/20 text-xs font-bold text-white transition-all shadow"
                    >
                      Visualize <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
