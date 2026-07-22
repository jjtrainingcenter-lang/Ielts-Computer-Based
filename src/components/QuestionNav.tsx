import React from 'react';
import { Question, TestSection } from '../types';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface QuestionNavProps {
  questions: Question[];
  currentQuestionIndex: number;
  onSelectQuestionIndex: (idx: number) => void;
  userAnswers: Record<string, string>;
  flaggedQuestions: Record<string, boolean>;
  onToggleFlag: (qId: string) => void;
  onOpenReviewModal: () => void;
  activeSection: TestSection;
  onAdminClick?: () => void;
}

export const QuestionNav: React.FC<QuestionNavProps> = ({
  questions,
  currentQuestionIndex,
  onSelectQuestionIndex,
  userAnswers,
}) => {
  if (!questions || questions.length === 0) return null;

  return (
    <footer className="bg-white border-t border-gray-300 text-black flex flex-col shrink-0 select-none sticky bottom-0 z-40 h-16 justify-center">
      <div className="flex items-center justify-between px-6">
        
        {/* Left Side: Questions list for Part 1 */}
        <div className="flex items-center space-x-4">
          <span className="font-bold text-sm">Part 1</span>
          <div className="flex items-center space-x-1.5">
            {questions.map((q, idx) => {
              const isAnswered = !!userAnswers[q.id] && userAnswers[q.id].trim().length > 0;
              const isCurrent = idx === currentQuestionIndex;
              
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => onSelectQuestionIndex(idx)}
                  className={`relative flex items-center justify-center text-sm w-7 h-7 font-medium ${
                    isCurrent 
                      ? 'border-2 border-[#00529b] text-black font-bold' 
                      : 'text-black hover:bg-gray-100'
                  }`}
                >
                  {q.questionNumber}
                  {isAnswered && !isCurrent && (
                    <span className="absolute bottom-0.5 left-1 right-1 h-[2px] bg-black"></span>
                  )}
                  {isAnswered && isCurrent && (
                    <span className="absolute bottom-0 left-1 right-1 h-[2px] bg-black"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Other parts (placeholder for now) */}
        <div className="flex items-center space-x-8 text-sm text-gray-500">
          <div>Part 2 <span className="ml-2">0 of 13</span></div>
          <div>Part 3 <span className="ml-2">0 of 14</span></div>
        </div>

        {/* Right Side: Navigation Buttons */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => currentQuestionIndex > 0 && onSelectQuestionIndex(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
            className="w-10 h-10 bg-[#333] hover:bg-black text-white flex items-center justify-center disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => currentQuestionIndex < questions.length - 1 && onSelectQuestionIndex(currentQuestionIndex + 1)}
            disabled={currentQuestionIndex === questions.length - 1}
            className="w-10 h-10 bg-[#333] hover:bg-black text-white flex items-center justify-center disabled:opacity-50"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="w-10 h-10 bg-[#e0e0e0] hover:bg-[#d0d0d0] text-[#333] flex items-center justify-center ml-4 rounded-sm"
          >
            <Check className="w-6 h-6" />
          </button>
        </div>

      </div>
    </footer>
  );
};
