'use client';

import React, { useState } from 'react';
import { HelpCircle, Check, X, AlertCircle } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface QuizPanelProps {
  quiz: QuizQuestion[];
}

export const QuizPanel: React.FC<QuizPanelProps> = ({ quiz }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeQuestion = quiz[currentIdx];

  const handleOptionSelect = (optIdx: number) => {
    if (submitted) return;
    setSelectedOpt(optIdx);
  };

  const handleSubmit = () => {
    if (selectedOpt === null || submitted) return;
    setSubmitted(true);
    if (selectedOpt === activeQuestion.answerIndex) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setSubmitted(false);
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  if (quiz.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center border border-dashed border-card-border rounded-xl bg-card">
        <p className="text-muted-foreground text-sm">No quizzes available for this topic</p>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="w-full glass-panel rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center gap-4">
        <h3 className="text-lg font-bold text-slate-100">Quiz Completed!</h3>
        <p className="text-sm text-slate-400">
          You scored <span className="font-bold text-primary">{score}</span> out of <span className="font-bold">{quiz.length}</span> questions.
        </p>
        <button
          onClick={handleRestart}
          className="mt-2 px-6 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/10"
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="w-full glass-panel rounded-2xl p-6 shadow-xl flex flex-col h-full justify-between">
      <div>
        {/* Progress Header */}
        <div className="flex justify-between items-center border-b border-card-border pb-3 mb-4">
          <span className="flex items-center gap-1.5 text-xs text-primary font-bold">
            <HelpCircle className="w-4 h-4" /> Concept Quiz
          </span>
          <span className="text-[10px] text-muted-foreground">
            Question {currentIdx + 1} of {quiz.length}
          </span>
        </div>

        {/* Question Statement */}
        <h4 className="text-sm font-semibold text-slate-200 mb-4 leading-relaxed">
          {activeQuestion.question}
        </h4>

        {/* Options */}
        <div className="space-y-2.5">
          {activeQuestion.options.map((option, idx) => {
            let borderStyle = 'border-card-border bg-slate-950/20 text-slate-300';
            
            if (selectedOpt === idx && !submitted) {
              borderStyle = 'border-primary bg-indigo-950/20 text-indigo-200';
            }

            if (submitted) {
              if (idx === activeQuestion.answerIndex) {
                borderStyle = 'border-accent-emerald bg-emerald-950/20 text-emerald-300';
              } else if (selectedOpt === idx) {
                borderStyle = 'border-accent-rose bg-rose-950/20 text-rose-300';
              } else {
                borderStyle = 'border-card-border bg-slate-950/10 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={submitted}
                className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between gap-3 ${borderStyle}`}
              >
                <span>{option}</span>
                {submitted && idx === activeQuestion.answerIndex && (
                  <Check className="w-4 h-4 text-accent-emerald shrink-0" />
                )}
                {submitted && selectedOpt === idx && idx !== activeQuestion.answerIndex && (
                  <X className="w-4 h-4 text-accent-rose shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Answer Explanation Banner */}
        {submitted && (
          <div className="mt-4 border border-indigo-950/50 p-4 rounded-xl bg-indigo-950/10 flex gap-2.5">
            <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Explanation</span>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">{activeQuestion.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="mt-6 flex justify-end">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOpt === null}
            className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-lg bg-secondary border border-indigo-500/25 hover:border-indigo-500/40 text-white text-xs font-bold transition-all"
          >
            {currentIdx < quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </button>
        )}
      </div>
    </div>
  );
};
