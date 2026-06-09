'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, Sparkles, BookOpen, Award, CheckCircle2, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [demoArray, setDemoArray] = useState([5, 2, 4, 1, 3]);
  const [demoStep, setDemoStep] = useState(0);
  const [demoPlaying, setDemoPlaying] = useState(false);

  // Landing page mini visualizer simulator
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (demoPlaying) {
      timer = setInterval(() => {
        setDemoStep((prev) => {
          if (prev >= 4) {
            setDemoPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [demoPlaying]);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const getDemoLabel = () => {
    switch(demoStep) {
      case 0: return 'Initial unsorted sequence: [5, 2, 4, 1, 3]';
      case 1: return 'Comparing element 5 and 2. Since 5 > 2, swap them.';
      case 2: return 'Comparing 5 and 4. Swap them: [2, 4, 5, 1, 3]';
      case 3: return 'Comparing 5 and 1. Swap them: [2, 4, 1, 5, 3]';
      case 4: return 'Comparing 5 and 3. Swap them: 5 is sorted at the end!';
      default: return 'Sequence is ordered!';
    }
  };

  const faqData = [
    {
      q: 'How does the universal parser work?',
      a: 'You can paste code, problem URLs from LeetCode or Codeforces, or simply type an algorithm name. Our system analyzes the query, extracts loop patterns, constraints, and dependencies, and maps it to a reactive layout visualizer step-by-step.',
    },
    {
      q: 'What languages does the execution sandbox support?',
      a: 'The local Docker sandbox compiles and executes Python, C++, and JavaScript in a secure runtime container, comparing standard outputs against your custom inputs or pre-defined test cases.',
    },
    {
      q: 'Is there a progress tracker?',
      a: 'Yes! AlgoVerse tracks your streaks, bookmarks, problem completion rates, and highlights your weakest topics on a personal analytics dashboard.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center text-center px-6 border-b border-card-border overflow-hidden">
        {/* Glow dots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-bold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Algorithm Visualization
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            The Ultimate Interactive <br />
            <span className="bg-gradient-to-r from-primary via-accent-violet to-accent-cyan bg-clip-text text-transparent">
              DSA Learning Engine
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop memorizing algorithms. Paste code, input LeetCode links, or type problem statements to compile, dry-run, and visualize execution steps dynamically.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/visualize"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-sm font-bold text-white transition-all shadow-lg shadow-indigo-500/20"
            >
              <Compass className="w-4.5 h-4.5" /> Launch Playground
            </Link>
            <Link
              href="/problems"
              className="px-8 py-3.5 rounded-xl border border-card-border hover:bg-slate-900 text-sm font-bold text-slate-300 transition-all"
            >
              Browse Problem Sheets
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Interactive Demo Section */}
      <section className="py-20 px-6 border-b border-card-border bg-slate-950/20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Watch Execution Steps <br />
              <span className="text-primary font-bold">Unfold in Real Time</span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every operation on arrays, trees, graphs, and DP tables is captured down to the variables. Toggle playback, step backwards, or inspect memory addresses in our reactive visualizer.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent-emerald shrink-0" />
                <span className="text-xs text-slate-300 font-semibold">Step-by-step variable highlights</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent-emerald shrink-0" />
                <span className="text-xs text-slate-300 font-semibold">Tutor modes with time/space complexities</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent-emerald shrink-0" />
                <span className="text-xs text-slate-300 font-semibold">Interactive practice quizzes</span>
              </div>
            </div>
            <div>
              <button
                onClick={() => setDemoPlaying(!demoPlaying)}
                className="px-6 py-2.5 rounded-xl bg-secondary border border-indigo-500/20 hover:border-indigo-500/40 text-xs font-bold text-white transition-all"
              >
                {demoPlaying ? 'Pause Simulation' : 'Run Demo Simulation'}
              </button>
            </div>
          </div>

          {/* Interactive Demo Board */}
          <div className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between h-[360px]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] text-accent-cyan uppercase tracking-widest bg-cyan-950/10 px-2 py-0.5 rounded border border-accent-cyan/15 font-semibold">
                Pattern Trace Simulator
              </span>
              <span className="text-xs text-slate-500">Step {demoStep + 1} of 5</span>
            </div>

            <div className="flex items-end justify-center gap-4 h-40">
              {demoArray.map((val, idx) => {
                let color = 'bg-[#1e1b4b] border-indigo-900';
                
                // Emulate step highlights
                if (demoStep === 1 && (idx === 0 || idx === 1)) color = 'bg-accent-amber border-amber-400';
                if (demoStep === 2 && (idx === 1 || idx === 2)) color = 'bg-accent-amber border-amber-400';
                if (demoStep === 3 && (idx === 2 || idx === 3)) color = 'bg-accent-amber border-amber-400';
                if (demoStep === 4 && (idx === 3 || idx === 4)) color = 'bg-accent-amber border-amber-400';
                
                if (demoStep >= 4 && idx === 4) color = 'bg-accent-emerald border-emerald-400';

                return (
                  <div key={idx} className="flex flex-col items-center w-12">
                    <div
                      style={{ height: `${val * 24}px` }}
                      className={`w-full rounded-t-lg border flex items-center justify-center text-xs font-bold text-white transition-all duration-300 ${color}`}
                    >
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-card-border pt-4 text-xs font-medium text-slate-300">
              {getDemoLabel()}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section className="py-20 px-6 border-b border-card-border">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold">Everything You Need to Ace the Interview</h2>
            <p className="text-sm text-slate-400 mt-2">Curated resources, custom roadmaps, and code compilers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-card-border rounded-2xl p-6 bg-slate-950/25 space-y-4 hover:border-primary/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/40 border border-primary/20 flex items-center justify-center text-primary">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm">Algorithm Playground</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste LeetCode problem URLs, algorithm names, or code snippets, and watch the system construct interactive steps instantly.
              </p>
            </div>

            <div className="border border-card-border rounded-2xl p-6 bg-slate-950/25 space-y-4 hover:border-primary/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-accent-violet/20 flex items-center justify-center text-accent-violet">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm">Tutor Mode</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                For every problem, view detailed intuition breakdowns, brute-force algorithms, optimized plans, complex big-O analyses, and common mistakes.
              </p>
            </div>

            <div className="border border-card-border rounded-2xl p-6 bg-slate-950/25 space-y-4 hover:border-primary/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm">Concept Quizzes</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Test your understanding of edge cases, space complexities, and dry run questions with automated quizzes tailored to each topic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pricing Section */}
      <section className="py-20 px-6 border-b border-card-border bg-slate-950/10">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold">Clear, Simple Pricing</h2>
            <p className="text-sm text-slate-400 mt-2">Unlock unlimited visualizations and sandboxed execution runs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="border border-card-border rounded-2xl p-6 bg-slate-950/20 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Standard Tier</span>
                <h4 className="text-xl font-bold">Free Basic</h4>
                <div className="text-3xl font-extrabold">$0</div>
                <p className="text-xs text-slate-450">Perfect for students learning core algorithms and traversing sorting visualizations.</p>
                <div className="border-t border-card-border my-4" />
                <ul className="space-y-2.5 text-xs text-slate-350">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Basic Sorting & Search visualizer</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Access to standard explanations</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Track streaks and dashboard stats</li>
                </ul>
              </div>
              <Link href="/visualize" className="w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary-hover border border-indigo-500/25 text-center text-xs font-bold text-white transition-all mt-4">
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="border border-primary/30 rounded-2xl p-6 bg-indigo-950/5 flex flex-col justify-between gap-6 relative">
              <div className="absolute -top-3.5 right-4 px-2.5 py-1 rounded-full bg-primary text-[9px] uppercase font-black text-white tracking-widest">Popular</div>
              <div className="space-y-4">
                <span className="text-[10px] text-primary uppercase font-bold tracking-widest">Mastery Tier</span>
                <h4 className="text-xl font-bold">AlgoVerse Pro</h4>
                <div className="text-3xl font-extrabold">$12<span className="text-xs font-medium text-slate-500"> / mo</span></div>
                <p className="text-xs text-slate-350">For candidate software developers studying for FAANG internships and system mock interviews.</p>
                <div className="border-t border-card-border my-4" />
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0" /> Unlimited Code Execution in Sandbox</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0" /> Advanced DP, Trees, & Graphs layouts</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0" /> Personalized Weak Topics recommendations</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0" /> NeetCode 150 & Blind 75 sheets</li>
                </ul>
              </div>
              <Link href="/visualize" className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-center text-xs font-bold text-white transition-all shadow-md shadow-indigo-500/10 mt-4">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQs Section */}
      <section className="py-20 px-6 max-w-3xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3.5">
          {faqData.map((faq, idx) => (
            <div key={idx} className="border border-card-border rounded-xl bg-slate-950/20 overflow-hidden">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-5 flex items-center justify-between text-sm font-semibold text-slate-200 transition-all hover:bg-slate-950/40"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-450 transition-all ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-card-border py-8 px-6 text-center text-xs text-slate-500 bg-background">
        <p>Copyright 2026 AlgoVerse. All rights reserved. Built with Next.js, NestJS, and Tailwind CSS.</p>
      </footer>
    </div>
  );
}
