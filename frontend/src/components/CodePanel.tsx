'use client';

import React, { useEffect, useState } from 'react';
import { useVisualizerStore } from '@/store/visualizerStore';
import { Play, CheckCircle2, XCircle, Terminal, HelpCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

interface CodePanelProps {
  starterCodes: Array<{ language: string; code: string }>;
  testCases: Array<{ input: string; output: string }>;
}

export const CodePanel: React.FC<CodePanelProps> = ({ starterCodes, testCases }) => {
  const {
    activeLanguage,
    setLanguage,
    steps,
    currentStepIndex,
    isExecuting,
    codeRunnerResults,
    setExecutionState,
    codeDrafts,
    setCodeDraft,
    parsedData,
  } = useVisualizerStore();

  // Load starter code matching selection
  const getStarterCode = (lang: string) => {
    return starterCodes.find((sc) => sc.language === lang)?.code || '';
  };

  const [editorCode, setEditorCode] = useState(
    codeDrafts[activeLanguage] || getStarterCode(activeLanguage),
  );

  useEffect(() => {
    const selectedCode = codeDrafts[activeLanguage] || getStarterCode(activeLanguage);
    if (selectedCode) {
      setEditorCode(selectedCode);
      return;
    }
    const first = starterCodes.find((starter) =>
      ['python', 'cpp', 'java', 'javascript'].includes(starter.language),
    );
    if (first) {
      setLanguage(first.language as 'python' | 'cpp' | 'java' | 'javascript');
      setEditorCode(first.code);
    } else {
      setEditorCode('');
    }
  }, [starterCodes]);

  const handleLanguageChange = (lang: 'python' | 'cpp' | 'java' | 'javascript') => {
    setLanguage(lang);
    setEditorCode(codeDrafts[lang] || getStarterCode(lang));
  };

  const handleRunCode = async () => {
    if (!editorCode.trim() || testCases.length === 0) {
      setExecutionState(false, {
        success: false,
        compileError: 'This import does not include executable starter code and complete input/output test cases.',
        feedback: {
          status: 'blocked',
          summary: 'No executable input/output test cases were available.',
          diagnostics: [{
            type: 'coverage',
            message: 'The imported artifact did not provide complete expected outputs.',
            suggestion: 'Add at least one concrete input and expected output before judging the solution.',
          }],
          nextAction: 'Provide a complete example or choose a catalog problem with test cases.',
        },
      });
      return;
    }
    setExecutionState(true, null);
    try {
      const res = await fetch(`${API_BASE_URL}/sandbox/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editorCode,
          language: activeLanguage,
          testCases,
          pattern: parsedData?.pattern,
        }),
      });

      const data = await res.json();
      setExecutionState(false, data);
    } catch (e) {
      setExecutionState(false, {
        success: false,
        compileError: 'Failed to connect to the backend sandbox executor.',
      });
    }
  };

  // Determine line highlight based on active visualization step
  const activeLine = steps[currentStepIndex]?.line;

  const lines = editorCode.split('\n');

  return (
    <div className="w-full glass-panel rounded-2xl p-6 shadow-xl flex flex-col h-full">
      {/* Header Tabs & Run Button */}
      <div className="flex items-center justify-between border-b border-card-border pb-3 mb-4">
        <div className="flex gap-2">
          {(['python', 'cpp', 'java', 'javascript'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeLanguage === lang ? 'bg-secondary border border-indigo-500/25 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'javascript' ? 'JS' : lang}
            </button>
          ))}
        </div>

        <button
          onClick={handleRunCode}
          disabled={isExecuting}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-primary hover:bg-primary-hover text-white transition-all disabled:opacity-45"
        >
          <Play className="w-3.5 h-3.5 fill-current" /> {isExecuting ? 'Running...' : 'Run Sandbox'}
        </button>
      </div>

      {/* Editor & Line Numbers */}
      <div className="flex-1 flex font-mono text-sm overflow-hidden bg-[#050508] border border-card-border rounded-xl min-h-[300px]">
        {/* Line Gutter */}
        <div className="py-4 select-none text-right pr-3 pl-4 border-r border-card-border text-slate-600 bg-slate-950/20 text-xs">
          {lines.map((_, idx) => (
            <div key={idx} className="h-5">{idx + 1}</div>
          ))}
        </div>

        {/* Code TextArea / Editable Div */}
        <div className="flex-1 relative overflow-auto">
          <textarea
            value={editorCode}
            onChange={(e) => {
              setEditorCode(e.target.value);
              setCodeDraft(activeLanguage, e.target.value);
            }}
            className="absolute inset-0 w-full h-full p-4 bg-transparent outline-none text-slate-300 resize-none font-mono text-xs leading-5 overflow-y-auto whitespace-pre z-10"
            spellCheck="false"
          />
          
          {/* Virtual overlays to show line highlights under textarea */}
          <div className="absolute inset-0 p-4 pointer-events-none text-transparent font-mono text-xs leading-5 select-none">
            {lines.map((lineText, idx) => {
              const isHighlighted = activeLine === idx + 1;
              return (
                <div
                  key={idx}
                  className={`h-5 ${isHighlighted ? 'bg-indigo-500/10 border-l-2 border-primary -ml-4 pl-3.5' : ''}`}
                >
                  {lineText || ' '}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Compiler / Output Terminal */}
      <div className="mt-4 border border-card-border rounded-xl bg-slate-950/50 p-4 flex flex-col font-mono text-xs gap-3">
        <div className="flex items-center gap-2 border-b border-card-border pb-2 text-slate-400">
          <Terminal className="w-4 h-4 text-primary" />
          <span>Execution Output Console</span>
        </div>

        <div className="max-h-[120px] overflow-y-auto space-y-2.5">
          {isExecuting && <p className="text-muted-foreground animate-pulse">Running test cases...</p>}
          
          {!isExecuting && !codeRunnerResults && (
            <p className="text-muted-foreground">Console output idle. Run code to evaluate.</p>
          )}

          {codeRunnerResults && (
            <div className="space-y-2">
              {codeRunnerResults.feedback && (
                <div className="border border-indigo-950/50 bg-indigo-950/10 p-3 rounded">
                  <p className="font-bold text-slate-200">{codeRunnerResults.feedback.summary}</p>
                  {codeRunnerResults.feedback.diagnostics.map((diagnostic: any, idx: number) => (
                    <div key={idx} className="mt-2 text-slate-400">
                      <p>{diagnostic.message}</p>
                      <p className="text-accent-cyan mt-1">{diagnostic.suggestion}</p>
                    </div>
                  ))}
                  <p className="text-slate-300 mt-2">Next: {codeRunnerResults.feedback.nextAction}</p>
                </div>
              )}
              {codeRunnerResults.compileError && (
                <div className="text-accent-rose whitespace-pre-wrap">
                  Compile Error:<br />
                  {codeRunnerResults.compileError}
                </div>
              )}

              {codeRunnerResults.results && codeRunnerResults.results.map((result: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-1 border border-slate-900 p-2.5 rounded bg-slate-950">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-400">Test Case {idx + 1}</span>
                    {result.passed ? (
                      <span className="flex items-center gap-1 text-accent-emerald">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-accent-rose">
                        <XCircle className="w-3.5 h-3.5" /> Failed
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] mt-1.5 text-slate-400">
                    <div>
                      <span className="text-muted-foreground">Input:</span>
                      <pre className="mt-1 bg-slate-900 p-1 rounded font-mono text-[9px]">{result.input}</pre>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expected:</span>
                      <pre className="mt-1 bg-slate-900 p-1 rounded font-mono text-[9px]">{result.expected}</pre>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Actual:</span>
                      <pre className={`mt-1 p-1 rounded font-mono text-[9px] ${result.passed ? 'bg-emerald-950/20 text-emerald-300' : 'bg-rose-950/20 text-rose-300'}`}>
                        {result.actual}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
