import React from 'react';
import { Question, TestSection } from '../types';
import { Bookmark, ChevronLeft, ChevronRight, Grid, HelpCircle } from 'lucide-react';

interface QuestionNavProps {
  questions: Question[];
  currentQuestionIndex: number;
  onSelectQuestionIndex: (idx: number) => void;
  userAnswers: Record<string, string>;
  flaggedQuestions: Record<string, boolean>;
  onToggleFlag: (qId: string) => void;
  onOpenReviewModal: () => void;
  activeSection: TestSection;
}

export const QuestionNav: React.FC<QuestionNavProps> = ({
  questions,
  currentQuestionIndex,
  onSelectQuestionIndex,
  userAnswers,
  flaggedQuestions,
  onToggleFlag,
  onOpenReviewModal,
  activeSection,
}) => {
  if (!questions || questions.length === 0) return null;

  const currentQ = questions[currentQuestionIndex] || questions[0];
  const isFlagged = !!flaggedQuestions[currentQ.id];

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      onSelectQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      onSelectQuestionIndex(currentQuestionIndex + 1);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-300 text-gray-800 flex flex-col shrink-0 select-none sticky bottom-0 z-40">
      {/* Upper Control Strip */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-gray-200 gap-4">
        {/* Left: Flag for Review */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => onToggleFlag(currentQ.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded border transition-all flex items-center space-x-1.5 ${
              isFlagged
                ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{isFlagged ? 'Flagged' : 'Flag for Review'}</span>
          </button>
        </div>

        {/* Center: Scrollable Question Dock Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto py-1 px-2 max-w-2xl scrollbar-none">
          {questions.map((q, idx) => {
            const isAnswered = !!userAnswers[q.id] && userAnswers[q.id].trim().length > 0;
            const isCurrent = idx === currentQuestionIndex;
            const qFlagged = !!flaggedQuestions[q.id];

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onSelectQuestionIndex(idx)}
                className={`relative shrink-0 w-8 h-8 rounded text-xs font-bold transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isAnswered
                    ? 'bg-gray-200 text-gray-800 border border-gray-300'
                    : 'bg-white text-gray-400 border border-gray-200 hover:border-gray-300 hover:text-gray-600'
                }`}
              >
                {q.questionNumber}
                {/* Yellow Flag Dot */}
                {qFlagged && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Review & Back/Next Controls */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={onOpenReviewModal}
            className="px-5 py-2 border border-gray-300 rounded font-bold text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Review Matrix
          </button>

          <div className="flex rounded overflow-hidden border border-gray-300 shadow-xs">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="px-5 py-2 bg-white hover:bg-gray-50 text-[#214162] font-bold text-xs border-r border-gray-300 disabled:opacity-40 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
              className="px-5 py-2 bg-[#214162] hover:bg-[#2b547e] text-white font-bold text-xs disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Footer Candidate Metadata Line */}
      <div className="h-6 bg-[#214162]/5 flex items-center justify-between px-6 text-[10px] text-gray-500 font-medium uppercase tracking-tight">
        <span>IELTS Computer Based Test • Section: {activeSection}</span>
        <span>JJ ACADEMY Inspera Engine v2.4</span>
      </div>
    </footer>
  );
};
