import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface VisualizerStep {
  line?: number;
  explanation: string;
  state: any;
  highlights?: {
    active?: number[];
    comparing?: number[];
    swapping?: number[];
    sorted?: number[];
    visited?: number[];
  };
}

interface VisualizerState {
  // Playback Control States
  isPlaying: boolean;
  speed: number; // Interval ms multiplier
  currentStepIndex: number;
  steps: VisualizerStep[];
  rawQuery: string;
  parsedData: any;
  sessionId: string | null;
  revealedHints: number;
  codeDrafts: Record<string, string>;
  activeLanguage: 'python' | 'cpp' | 'java' | 'javascript';
  
  // Execution Outputs
  codeRunnerResults: any;
  isExecuting: boolean;

  // Actions
  setRawQuery: (q: string) => void;
  setParsedData: (data: any) => void;
  setSessionId: (sessionId: string | null) => void;
  setRevealedHints: (count: number) => void;
  setCodeDraft: (language: string, code: string) => void;
  setSteps: (steps: VisualizerStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  jumpToStep: (index: number) => void;
  resetVisualizer: () => void;
  setLanguage: (lang: 'python' | 'cpp' | 'java' | 'javascript') => void;
  setExecutionState: (loading: boolean, results: any) => void;
}

export const useVisualizerStore = create<VisualizerState>()(persist((set, get) => ({
  isPlaying: false,
  speed: 1000,
  currentStepIndex: 0,
  steps: [],
  rawQuery: '',
  parsedData: null,
  sessionId: null,
  revealedHints: 0,
  codeDrafts: {},
  activeLanguage: 'python',
  codeRunnerResults: null,
  isExecuting: false,

  setRawQuery: (rawQuery) => set({ rawQuery }),
  setParsedData: (parsedData) => set({ parsedData, revealedHints: 0, codeDrafts: {} }),
  setSessionId: (sessionId) => set({ sessionId }),
  setRevealedHints: (revealedHints) => set({ revealedHints }),
  setCodeDraft: (language, code) => set((state) => ({
    codeDrafts: { ...state.codeDrafts, [language]: code },
  })),
  setSteps: (steps) => set({ steps, currentStepIndex: 0, isPlaying: false }),
  
  nextStep: () => set((state) => {
    if (state.currentStepIndex < state.steps.length - 1) {
      return { currentStepIndex: state.currentStepIndex + 1 };
    }
    return { isPlaying: false }; // stop at end
  }),

  prevStep: () => set((state) => {
    if (state.currentStepIndex > 0) {
      return { currentStepIndex: state.currentStepIndex - 1 };
    }
    return {};
  }),

  setPlaying: (isPlaying) => set({ isPlaying }),
  
  setSpeed: (speed) => set({ speed }),

  jumpToStep: (currentStepIndex) => set((state) => {
    if (currentStepIndex >= 0 && currentStepIndex < state.steps.length) {
      return { currentStepIndex };
    }
    return {};
  }),

  resetVisualizer: () => set({
    currentStepIndex: 0,
    isPlaying: false,
    codeRunnerResults: null,
  }),

  setLanguage: (activeLanguage) => set({ activeLanguage }),
  
  setExecutionState: (isExecuting, codeRunnerResults) => set({ isExecuting, codeRunnerResults }),
}), {
  name: 'algoverse-learning-session',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    currentStepIndex: state.currentStepIndex,
    steps: state.steps,
    rawQuery: state.rawQuery,
    parsedData: state.parsedData,
    sessionId: state.sessionId,
    revealedHints: state.revealedHints,
    codeDrafts: state.codeDrafts,
    activeLanguage: state.activeLanguage,
  }),
}));
