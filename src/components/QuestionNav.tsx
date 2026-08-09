import React, { useMemo } from 'react';
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

  const currentQ = questions[currentQuestionIndex];
  const currentPart = currentQ?.partNumber || (currentQ?.passageId ? parseInt(currentQ.passageId.replace('p', '')) : 1);

  const parts = useMemo(() => {
    const map = new Map<number, { questions: Question[], startIndex: number }>();
    questions.forEach((q, idx) => {
      const partNum = q.partNumber || (q.passageId ? parseInt(q.passageId.replace('p', '')) : 1);
      if (!map.has(partNum)) {
        map.set(partNum, { questions: [], startIndex: idx });
      }
      map.get(partNum)!.questions.push(q);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [questions]);

  return (
    <footer className="bg-white border-t border-gray-300 text-black flex flex-col shrink-0 select-none sticky bottom-0 z-40 h-16 justify-center">
      <div className="flex items-center justify-between px-6">
        
        <div className="flex items-center space-x-8">
          {parts.map(([partNum, data]) => {
            if (partNum === currentPart) {
              // Render expanded button list
              return (
                <div key={partNum} className="flex items-center space-x-4">
                  <span className="font-bold text-[15px]">Part {partNum}</span>
                  <div className="flex items-center space-x-1.5">
                    {data.questions.map((q, localIdx) => {
                      const globalIdx = data.startIndex + localIdx;
                      const isAnswered = (!!userAnswers[q.id] && userAnswers[q.id].trim().length > 0) ||
                        (!!userAnswers[`${q.id}_blank_1`] && userAnswers[`${q.id}_blank_1`].trim().length > 0);
                      const isCurrent = globalIdx === currentQuestionIndex;
                      
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => onSelectQuestionIndex(globalIdx)}
                          className={`relative flex items-center justify-center text-[15px] w-7 h-7 font-medium ${
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
              );
            } else {
              // Render summary block
              const answeredCount = data.questions.filter(q => 
                (!!userAnswers[q.id] && userAnswers[q.id].trim().length > 0) ||
                (!!userAnswers[`${q.id}_blank_1`] && userAnswers[`${q.id}_blank_1`].trim().length > 0)
              ).length;
              return (
                <button
                  key={partNum}
                  onClick={() => onSelectQuestionIndex(data.startIndex)}
                  className="flex items-center space-x-2 text-[15px] text-gray-500 hover:text-black transition-colors"
                >
                  <span className="font-bold">Part {partNum}</span>
                  <span>{answeredCount} of {data.questions.length}</span>
                </button>
              );
            }
          })}
        </div>

        {/* Right Side: Navigation Buttons */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => currentQuestionIndex > 0 && onSelectQuestionIndex(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
            className="w-10 h-10 bg-[#333] hover:bg-black text-white flex items-center justify-center disabled:opacity-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => currentQuestionIndex < questions.length - 1 && onSelectQuestionIndex(currentQuestionIndex + 1)}
            disabled={currentQuestionIndex === questions.length - 1}
            className="w-10 h-10 bg-[#333] hover:bg-black text-white flex items-center justify-center disabled:opacity-50 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="w-10 h-10 bg-[#e0e0e0] hover:bg-[#d0d0d0] text-[#333] flex items-center justify-center ml-4 rounded-sm transition-colors"
          >
            <Check className="w-6 h-6" />
          </button>
        </div>
      </div>
    </footer>
  );
};
