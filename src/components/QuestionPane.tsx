import React, { useEffect, useRef } from 'react';
import { Question, DisplaySettings } from '../types';
import { ExamImageViewer } from './ExamImageViewer';

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
      <div ref={containerRef} className="p-8 flex flex-col gap-10 overflow-y-auto flex-1 ielts-scroll">
        {questions.map((q, index) => {
          const currentAnswer = userAnswers[q.id] || '';
          const prevQ = index > 0 ? questions[index - 1] : null;
          const isNewGroup = q.groupId && q.groupId !== prevQ?.groupId;
          
          return (
            <React.Fragment key={q.id}>
              {isNewGroup && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  {q.groupInstruction && <p className="font-bold text-slate-800 mb-4 whitespace-pre-wrap">{q.groupInstruction}</p>}
                  {q.groupMedia && q.groupMedia.type === 'image' && (
                    <div className="mb-4 flex justify-center">
                      <ExamImageViewer imageUrl={q.groupMedia.url} imageAlt={q.groupMedia.alt} imageZoomable={q.groupMedia.zoomable} />
                    </div>
                  )}
                </div>
              )}
              <div
                ref={(el) => (questionRefs.current[index] = el)}
                className="scroll-mt-32 flex flex-col"
              >
                {/* Question Image if present directly on the question */}
                {q.imageUrl && (
                  <div className={`mb-4 flex ${q.imagePosition === 'left' ? 'justify-start' : q.imagePosition === 'right' ? 'justify-end' : 'justify-center'}`}>
                    <ExamImageViewer imageUrl={q.imageUrl} imageAlt={q.imageAlt} imageZoomable={q.zoomable} />
                  </div>
                )}
                
                <div className="flex items-start">
                  <span className="w-8 h-8 border border-[#00529b] text-[#00529b] text-[15px] flex items-center justify-center shrink-0 mr-3 mt-0.5 rounded-sm shadow-[2px_0_0_#00529b]">
                    {q.questionNumber}
                  </span>
                  
                  <div className={`text-black pt-1 flex-1 ${fontClass}`}>
                    {(() => {
                      if (q.type === 'fill-blank' && (q.questionText.includes('___') || q.questionText.includes('[BLANK]'))) {
                        const parts = q.questionText.split(/___|\[BLANK\]/g);
                        return (
                          <span className="leading-loose inline-flex items-center flex-wrap gap-y-2">
                            {parts.map((part, i) => {
                              const blankKey = i === 0 ? q.id : `${q.id}_blank_${i}`;
                              const blankAnswer = userAnswers[blankKey] || '';
                              const boxNumber = q.questionNumber + i;

                              return (
                                <React.Fragment key={i}>
                                  <span>{part}</span>
                                  {i < parts.length - 1 && (
                                    <span className="inline-block relative mx-2 align-middle">
                                      <input
                                        type="text"
                                        value={blankAnswer}
                                        onChange={(e) => onAnswerChange(blankKey, e.target.value)}
                                        placeholder={String(boxNumber)}
                                        className="border border-[#444] text-center bg-white text-black font-bold focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] px-3 py-1 min-w-[130px] max-w-[190px] text-[15px] placeholder:text-black placeholder:opacity-100 placeholder:font-bold placeholder:text-center rounded-[2px] shadow-sm transition-all"
                                      />
                                    </span>
                                  )}
                                </React.Fragment>
                              );
                            })}
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
                          <span className="ml-3 text-[15px] text-black tracking-wide">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Dropdown / Matching */}
                {(q.type === 'dropdown' || q.type === 'matching' || q.type === 'matching-headings') && q.options && (
                  <div className="mt-3 pl-[3.25rem]">
                    <select
                      value={currentAnswer}
                      onChange={(e) => onAnswerChange(q.id, e.target.value)}
                      className="border border-[#444] bg-white text-black font-bold focus:outline-none focus:ring-2 focus:ring-[#0066cc] px-3 py-1.5 text-[15px] rounded-[2px] shadow-sm"
                    >
                      <option value="" disabled>Select...</option>
                      {q.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Table Completion */}
                {q.type === 'table-completion' && q.tableData && (
                  <div className="mt-4 pl-[3.25rem] overflow-x-auto w-full">
                    <table className="w-full min-w-[400px] border-collapse border border-[#444] text-[15px]">
                      <thead>
                        <tr>
                          {q.tableData.headers.map((h, i) => (
                            <th key={i} className="border border-[#444] p-2 bg-slate-100 font-bold text-left text-slate-800">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {q.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="border border-[#444] p-2 align-top text-slate-800">
                                {typeof cell === 'string' ? (
                                  <span>{cell}</span>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-slate-500 text-sm">{cell.placeholder}</span>
                                    <input
                                      type="text"
                                      value={userAnswers[cell.inputId] || ''}
                                      onChange={(e) => onAnswerChange(cell.inputId, e.target.value)}
                                      className="flex-1 border border-[#444] bg-white text-black font-bold focus:outline-none focus:ring-2 focus:ring-[#0066cc] px-2 py-1 max-w-[200px] shadow-sm"
                                    />
                                  </div>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                        placeholder={String(q.questionNumber)}
                        className="w-full max-w-[200px] border border-[#444] bg-white text-black font-bold focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] px-3 py-1.5 text-[15px] placeholder:text-black placeholder:opacity-50 placeholder:font-normal rounded-[2px] shadow-sm transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
