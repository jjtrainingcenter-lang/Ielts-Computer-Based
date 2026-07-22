import React, { useEffect, useRef } from 'react';
import { Question, DisplaySettings } from '../types';

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
  settings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const targetRef = questionRefs.current[currentQuestionIndex];
    if (targetRef && containerRef.current) {
      targetRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentQuestionIndex]);

  if (!questions || questions.length === 0) return null;

  const fontClass =
    settings.fontSize === 'large'
      ? 'text-lg leading-relaxed'
      : settings.fontSize === 'medium'
      ? 'text-base leading-relaxed'
      : 'text-[15px] leading-relaxed';

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Question Content Area */}
      <div ref={containerRef} className="p-8 flex flex-col gap-10 overflow-y-auto flex-1">
        {questions.map((q, index) => {
          const currentAnswer = userAnswers[q.id] || '';
          
          return (
            <div
              key={q.id}
              ref={(el) => (questionRefs.current[index] = el)}
              className="scroll-mt-32 flex flex-col"
            >
              {/* Options above text for True/False/Not Given or Multiple Choice as per IELTS sometimes, but typically IELTS shows options then text? Actually it usually shows the question first for MC. Let's just put options above if True/False. */}
              
              <div className="flex items-start">
                <span className="w-8 h-8 border border-[#00529b] text-[#00529b] text-[15px] flex items-center justify-center shrink-0 mr-3 mt-0.5 rounded-sm shadow-[2px_0_0_#00529b]">
                  {q.questionNumber}
                </span>
                
                <div className={`text-black pt-1 ${fontClass}`}>
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
                                    className="border border-[#767676] text-center bg-white text-black focus:outline-none focus:ring-1 focus:ring-black px-2 py-0.5 min-w-[120px] max-w-[200px] text-[15px]"
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

              {/* Options below text for True/False/Not Given or Multiple Choice */}
              {(q.type === 'true-false-not-given' || q.type === 'yes-no-not-given' || q.type === 'multiple-choice') && q.options && (
                <div className="mt-4 space-y-3 pl-[3.25rem]">
                  {q.options.map((opt) => {
                    const isSelected = currentAnswer === opt.value;
                    return (
                      <label
                        key={opt.value}
                        onClick={() => onAnswerChange(q.id, opt.value)}
                        className="flex items-center cursor-pointer group"
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-[16px] h-[16px] border-gray-400 text-black focus:ring-0 cursor-pointer accent-black"
                          />
                        </div>
                        <span className="ml-3 text-[15px] text-black uppercase tracking-wide">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Input Controls Based on Question Type (For Fill in Blank only, since MC/TF is above) */}
              <div className="mt-4 pl-[3.25rem]">
                {/* Fill In Blank / Text Box Input */}
                {q.type === 'fill-blank' && !q.questionText.includes('___') && !q.questionText.includes('[BLANK]') && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => onAnswerChange(q.id, e.target.value)}
                      className="w-full max-w-[240px] p-1.5 border border-[#767676] text-[15px] focus:outline-none focus:border-black bg-white text-black"
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
