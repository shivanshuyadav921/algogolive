'use client';

import React, { useEffect, useRef } from 'react';
import { useVisualizerStore } from '@/store/visualizerStore';
import { Play, Pause, SkipBack, ChevronLeft, ChevronRight, RotateCcw, FastForward } from 'lucide-react';

export const PlaybackControls: React.FC = () => {
  const {
    steps,
    currentStepIndex,
    isPlaying,
    speed,
    nextStep,
    prevStep,
    setPlaying,
    setSpeed,
    jumpToStep,
    resetVisualizer,
  } = useVisualizerStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < steps.length - 1) {
          nextStep();
        } else {
          setPlaying(false);
        }
      }, speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, currentStepIndex, steps.length, nextStep, setPlaying]);

  if (steps.length === 0) return null;

  return (
    <div className="w-full glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-4 shadow-lg">
      {/* Step Info / Progress */}
      <div className="text-sm font-semibold text-slate-300">
        Execution Progress: {Math.round((currentStepIndex / (steps.length - 1 || 1)) * 100)}%
      </div>

      {/* Primary Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={resetVisualizer}
          className="p-2.5 rounded-lg border border-card-border hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          title="Restart"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={prevStep}
          disabled={currentStepIndex === 0}
          className="p-2.5 rounded-lg border border-card-border hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Previous Step"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => setPlaying(!isPlaying)}
          className="p-3.5 rounded-full bg-primary hover:bg-primary-hover text-white transition-all shadow-md shadow-indigo-500/20"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <button
          onClick={nextStep}
          disabled={currentStepIndex === steps.length - 1}
          className="p-2.5 rounded-lg border border-card-border hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Next Step"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => jumpToStep(steps.length - 1)}
          disabled={currentStepIndex === steps.length - 1}
          className="p-2.5 rounded-lg border border-card-border hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Jump to End"
        >
          <FastForward className="w-4 h-4" />
        </button>
      </div>

      {/* Speed Slider Controls */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Speed:</span>
        <input
          type="range"
          min="200"
          max="2000"
          step="200"
          value={2200 - speed}
          onChange={(e) => setSpeed(2200 - Number(e.target.value))}
          className="w-full md:w-32 accent-primary h-1 bg-slate-800 rounded-lg cursor-pointer"
        />
        <span className="text-xs font-mono text-slate-400 w-10">
          {Math.round((1000 / speed) * 10) / 10}x
        </span>
      </div>
    </div>
  );
};
