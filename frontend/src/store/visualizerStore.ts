import { create } from 'zustand';

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
  activeLanguage: 'python' | 'cpp' | 'java' | 'javascript';
  
  // Execution Outputs
  codeRunnerResults: any;
  isExecuting: boolean;

  // Actions
  setRawQuery: (q: string) => void;
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

export const useVisualizerStore = create<VisualizerState>((set, get) => ({
  isPlaying: false,
  speed: 1000,
  currentStepIndex: 0,
  steps: [],
  rawQuery: '',
  activeLanguage: 'python',
  codeRunnerResults: null,
  isExecuting: false,

  setRawQuery: (rawQuery) => set({ rawQuery }),
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
}));
