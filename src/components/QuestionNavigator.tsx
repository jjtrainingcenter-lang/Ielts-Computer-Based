import React from 'react';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { Question } from '../types';

interface QuestionNavigatorProps {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<string, string>;
  markedQuestions: Record<string, boolean>;
  onSelectQuestion: (index: number) => void;
  onToggleMark: (questionId: string) => void;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  currentQuestionIndex,
  userAnswers,
  markedQuestions,
  onSelectQuestion,
  onToggleMark
}) => {
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;
  
  const isMarked = markedQuestions[currentQuestion.id];

  return (
    <div className="bg-slate-50 border-t border-slate-300 p-4 shrink-0 flex flex-col space-y-4">
      {/* Navigation Buttons */}
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <button
          disabled={currentQuestionIndex === 0}
          onClick={() => onSelectQuestion(currentQuestionIndex - 1)}
          className="flex items-center space-x-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={() => onToggleMark(currentQuestion.id)}
          className={`flex items-center space-x-2 px-6 py-2.5 border font-bold text-sm rounded-lg transition-colors ${
            isMarked 
              ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200' 
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Flag className={`w-4 h-4 ${isMarked ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span>{isMarked ? 'Unmark for Review' : 'Mark for Review'}</span>
        </button>

        <button
          disabled={currentQuestionIndex === questions.length - 1}
          onClick={() => onSelectQuestion(currentQuestionIndex + 1)}
          className="flex items-center space-x-2 px-6 py-2.5 bg-[#214162] hover:bg-[#1a334e] text-white font-bold text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Question Grid */}
      <div className="max-w-7xl mx-auto w-full flex flex-wrap gap-1.5 justify-center">
        {questions.map((q, idx) => {
          const isAnswered = (userAnswers[q.id] || '').trim().length > 0;
          const marked = markedQuestions[q.id];
          const isCurrent = idx === currentQuestionIndex;
          
          let btnClass = "w-8 h-8 flex items-center justify-center text-xs font-bold rounded cursor-pointer border transition-colors relative ";
          
          if (isCurrent) {
            btnClass += "bg-blue-600 text-white border-blue-700 shadow-sm ";
          } else if (marked) {
            btnClass += "bg-amber-50 text-amber-900 border-amber-400 hover:bg-amber-100 ";
          } else if (isAnswered) {
            btnClass += "bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300 ";
          } else {
            btnClass += "bg-white text-slate-600 border-slate-300 hover:bg-slate-100 ";
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(idx)}
              className={btnClass}
              title={`Question ${idx + 1}`}
            >
              {idx + 1}
              {marked && !isCurrent && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
