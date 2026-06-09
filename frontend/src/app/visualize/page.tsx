'use client';

import React, { useState } from 'react';
import { useVisualizerStore } from '@/store/visualizerStore';
import { VisualizerCanvas } from '@/components/VisualizerCanvas';
import { PlaybackControls } from '@/components/PlaybackControls';
import { TutorPanel } from '@/components/TutorPanel';
import { CodePanel } from '@/components/CodePanel';
import { QuizPanel } from '@/components/QuizPanel';
import { NotesPanel } from '@/components/NotesPanel';
import { Search, Sparkles, BookOpen, AlertCircle, FileText, Compass } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export default function VisualizePage() {
  const { setSteps, setRawQuery } = useVisualizerStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Track parsed visualizer details
  const [parsedData, setParsedData] = useState<any>(null);
  const [activeRightTab, setActiveRightTab] = useState<'tutor' | 'quiz' | 'notes'>('tutor');

  const handleParse = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setParsedData(null);
    try {
      const res = await fetch(`${API_BASE_URL}/visualizer/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error('Failed to parse input');

      const data = await res.json();
      setParsedData(data);
      
      // Update global step traces
      setSteps(data.visualizationData.steps);
      setRawQuery(query);
    } catch (e) {
      alert('Error: Could not process algorithm name or code snippet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full gap-6">
      {/* 1. Universal Search / Parser Input Bar */}
      <div className="w-full glass-panel rounded-2xl p-5 flex flex-col md:flex-row items-stretch md:items-center gap-4 shadow-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Paste a problem URL, code snippet, pseudocode, or natural-language algorithm prompt..."
            className="w-full pl-12 pr-4 py-3 bg-slate-950/40 border border-card-border rounded-xl text-sm text-slate-200 outline-none focus:border-primary placeholder:text-slate-500 font-medium transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleParse()}
          />
        </div>
        <button
          onClick={handleParse}
          disabled={loading || !query.trim()}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-sm font-bold text-white transition-all disabled:opacity-40"
        >
          <Sparkles className="w-4 h-4" /> {loading ? 'Analyzing...' : 'Visualize Engine'}
        </button>
      </div>

      {/* 2. Visualizer Layout Grid */}
      {!parsedData ? (
        // Empty state before the parser receives a query.
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-card-border rounded-2xl bg-card p-12 text-center gap-4 min-h-[400px]">
          <div className="w-12 h-12 rounded-full bg-indigo-950/40 flex items-center justify-center text-primary">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-250">No Active Algorithm Visualization</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mx-auto leading-relaxed">
              Enter a problem statement, choose a pattern, or input a valid code block to begin step-by-step trace simulation.
            </p>
          </div>
          {/* Quick presets tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {['Array pattern', 'Graph traversal', 'Dynamic programming', 'Stack workflow', 'Tree recursion'].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setQuery(preset);
                }}
                className="px-3.5 py-1.5 rounded-lg border border-card-border hover:border-primary/30 bg-slate-950/20 text-[10px] font-semibold text-slate-400 hover:text-white transition-all"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Block: Canvas + Playback + Code Panel (Col span 7) */}
          <div className="lg:col-span-7 space-y-4 flex flex-col h-full">
            <VisualizerCanvas type={parsedData.visualizationData.type} />
            <PlaybackControls />
            
            {/* Styled Code editor panel */}
            <div className="flex-1 min-h-[400px]">
              <CodePanel
                starterCodes={[
                  { language: 'python', code: 'def analyze(values):\n    state = []\n    for index, value in enumerate(values):\n        state.append((index, value))\n    return state\n\nprint(analyze([4, 1, 7, 3]))' },
                  { language: 'cpp', code: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> values = {4, 1, 7, 3};\n    for (int i = 0; i < values.size(); i++) {\n        cout << i << ":" << values[i] << " ";\n    }\n    return 0;\n}' },
                  { language: 'java', code: 'class Main {\n    public static void main(String[] args) {\n        int[] values = {4, 1, 7, 3};\n        for (int index = 0; index < values.length; index++) {\n            System.out.print(index + ":" + values[index] + " ");\n        }\n    }\n}' },
                  { language: 'javascript', code: 'function analyze(values) {\n  return values.map((value, index) => `${index}:${value}`);\n}\n\nconsole.log(analyze([4, 1, 7, 3]).join(" "));' }
                ]}
                testCases={[
                  { input: '[4, 1, 7, 3]', output: '0:4 1:1 2:7 3:3' }
                ]}
              />
            </div>
          </div>

          {/* Right Block: Tutor Mode / Quizzes / Notes tabs (Col span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Header Right Sidebar Tabs */}
            <div className="w-full glass-panel rounded-xl p-2 flex gap-1.5 shadow">
              <button
                onClick={() => setActiveRightTab('tutor')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeRightTab === 'tutor' ? 'bg-secondary text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Tutor Mode
              </button>

              <button
                onClick={() => setActiveRightTab('quiz')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeRightTab === 'quiz' ? 'bg-secondary text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlertCircle className="w-4 h-4" /> Quizzes
              </button>

              <button
                onClick={() => setActiveRightTab('notes')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeRightTab === 'notes' ? 'bg-secondary text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" /> Notes Workspace
              </button>
            </div>

            {/* Render right panels */}
            <div className="min-h-[500px]">
              {activeRightTab === 'tutor' && <TutorPanel data={parsedData.tutorMode} />}
              {activeRightTab === 'quiz' && <QuizPanel quiz={parsedData.quiz} />}
              {activeRightTab === 'notes' && <NotesPanel problemId="demo-problem-id" userId="demo-user-id" />}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
