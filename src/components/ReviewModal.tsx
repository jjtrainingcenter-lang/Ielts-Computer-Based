import React from 'react';
import { Question, TestSection } from '../types';
import { Grid, Bookmark, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  questions: Question[];
  userAnswers: Record<string, string>;
  flaggedQuestions: Record<string, boolean>;
  onSelectQuestion: (idx: number) => void;
  onClose: () => void;
  activeSection: TestSection;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  questions,
  userAnswers,
  flaggedQuestions,
  onSelectQuestion,
  onClose,
  activeSection,
}) => {
  if (!isOpen) return null;

  const answeredCount = questions.filter((q) => !!userAnswers[q.id] && userAnswers[q.id].trim().length > 0).length;
  const flaggedCount = questions.filter((q) => !!flaggedQuestions[q.id]).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
              {activeSection} Questions Overview
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Summary Bar */}
        <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800 bg-slate-100/50 dark:bg-slate-800/40 text-center py-3 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block">Answered</span>
            <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
              {answeredCount} / {questions.length}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Unanswered</span>
            <span className="font-mono text-base font-bold text-amber-600 dark:text-amber-400">
              {unansweredCount}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Flagged for Review</span>
            <span className="font-mono text-base font-bold text-amber-500">
              {flaggedCount}
            </span>
          </div>
        </div>

        {/* Grid Matrix */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
            {questions.map((q, idx) => {
              const isAnswered = !!userAnswers[q.id] && userAnswers[q.id].trim().length > 0;
              const isFlagged = !!flaggedQuestions[q.id];

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    onSelectQuestion(idx);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 relative ${
                    isAnswered
                      ? 'bg-slate-900 text-white border-slate-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isFlagged && (
                    <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400 absolute top-1 right-1" />
                  )}
                  <span className="font-mono font-bold text-sm">{q.questionNumber}</span>
                  <span
                    className={`text-[9px] uppercase font-bold tracking-tight px-1 rounded ${
                      isAnswered ? 'bg-emerald-800/80 text-emerald-200' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {isAnswered ? 'Done' : 'Empty'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500">Click any question box above to jump directly to it.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
