import React, { useEffect, useRef } from 'react';
import { Question, DisplaySettings } from '../types';
import { Bookmark } from 'lucide-react';

interface QuestionPaneProps {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<string, string>;
  onAnswerChange: (qId: string, answer: string) => void;
  flaggedQuestions: Record<string, boolean>;
  onToggleFlag: (qId: string) => void;
  settings: DisplaySettings;
}

export const QuestionPane: React.FC<QuestionPaneProps> = ({
  questions,
  currentQuestionIndex,
  userAnswers,
  onAnswerChange,
  flaggedQuestions,
  onToggleFlag,
  settings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const targetRef = questionRefs.current[currentQuestionIndex];
    if (targetRef && containerRef.current) {
      targetRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentQuestionIndex]);

  if (!questions || questions.length === 0) return null;

  const fontClass =
    settings.fontSize === 'large'
      ? 'text-lg leading-relaxed'
      : settings.fontSize === 'large'
      ? 'text-xl leading-relaxed'
      : 'text-base leading-normal';

  return (
    <div className="flex flex-col h-full bg-[#F4F7F9] overflow-hidden">
      {/* Pane Subheader */}
      <div className="p-4 border-b border-gray-300 flex justify-between items-center bg-white shrink-0 shadow-sm z-10">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Questions {questions[0]?.questionNumber}-{questions[questions.length - 1]?.questionNumber}
        </h2>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span className="text-xs text-gray-600 font-medium">Standard Test Format</span>
        </div>
      </div>

      {/* Question Content Area */}
      <div ref={containerRef} className="p-8 flex flex-col gap-6 overflow-y-auto flex-1">
        {questions.map((q, index) => {
          const currentAnswer = userAnswers[q.id] || '';
          const isFlagged = !!flaggedQuestions[q.id];

          return (
            <div
              key={q.id}
              ref={(el) => (questionRefs.current[index] = el)}
              className="bg-white p-6 rounded shadow-xs border border-gray-200 space-y-5 scroll-mt-6"
            >
              <div className="flex justify-between items-start mb-2">
                {q.instruction && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded text-xs font-semibold text-blue-900 flex-1 mr-4">
                    📌 {q.instruction}
                  </div>
                )}
                {!q.instruction && <div className="flex-1"></div>}
                
                <button
                  type="button"
                  onClick={() => onToggleFlag(q.id)}
                  className={`flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded border transition-colors shrink-0 ${
                    isFlagged
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'border-gray-300 text-gray-600 hover:text-gray-900 bg-white'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{isFlagged ? 'Flagged' : 'Flag'}</span>
                </button>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-7 h-7 rounded bg-[#214162] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {q.questionNumber}
                </span>
                <div className={`text-sm font-bold text-gray-800 leading-relaxed pt-0.5 flex-1 ${fontClass}`}>
                  {(() => {
                    if (q.type === 'fill-blank' && (q.questionText.includes('___') || q.questionText.includes('[BLANK]'))) {
                      const parts = q.questionText.split(/___|\[BLANK\]/g);
                      return (
                        <span className="leading-loose inline-flex items-center flex-wrap gap-y-2">
                          {parts.map((part, i) => (
                            <React.Fragment key={i}>
                              <span>{part}</span>
                              {i < parts.length - 1 && (
                                <span className="inline-block relative mx-2 align-middle">
                                  <input
                                    type="text"
                                    value={currentAnswer}
                                    onChange={(e) => onAnswerChange(q.id, e.target.value)}
                                    className="border-2 border-[#214162] text-center font-bold bg-blue-50 focus:bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#214162] rounded px-2 py-1 w-32 md:w-48 text-sm"
                                    placeholder={q.questionNumber.toString()}
                                  />
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </span>
                      );
                    }
                    return <span>{q.questionText}</span>;
                  })()}
                </div>
              </div>

              {/* Input Controls Based on Question Type */}
              <div className="pt-2 pl-10">
                {/* Multiple Choice or True/False options */}
                {(q.type === 'multiple-choice' ||
                  q.type === 'true-false-not-given' ||
                  q.type === 'yes-no-not-given') &&
                  q.options && (
                    <div className="space-y-3 max-w-xl">
                      {q.options.map((opt) => {
                        const isSelected = currentAnswer === opt.value;
                        return (
                          <label
                            key={opt.value}
                            onClick={() => onAnswerChange(q.id, opt.value)}
                            className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 text-gray-900 font-medium'
                                : 'border-gray-200 hover:bg-blue-50/50 text-gray-700 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-sm">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                {/* Fill In Blank / Text Box Input */}
                {q.type === 'fill-blank' && !q.questionText.includes('___') && !q.questionText.includes('[BLANK]') && (
                  <div className="space-y-2 max-w-md">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                      Type your answer below:
                    </span>
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => onAnswerChange(q.id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full p-3 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white text-gray-800 font-medium"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
