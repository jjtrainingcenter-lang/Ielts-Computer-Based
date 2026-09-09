import React, { useEffect, useMemo, useRef } from 'react';
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

const SINGLE_CHOICE_TYPES = new Set([
  'multiple-choice',
  'multiple-choice-single-answer',
  'true-false-not-given',
  'yes-no-not-given',
]);

const MULTI_CHOICE_TYPES = new Set([
  'multiple-response',
  'multiple-choice-multiple-answer',
]);

const MATCHING_TYPES = new Set([
  'dropdown',
  'matching',
  'matching-information',
  'matching-features',
  'matching-sentence-endings',
  'matching-headings',
  'paragraph-matching',
]);

const COMPLETION_TYPES = new Set([
  'fill-blank',
  'sentence-completion',
  'note-completion',
  'form-completion',
  'summary-completion',
  'table-completion',
  'flow-chart-completion',
  'diagram-labeling',
  'map-labeling',
  'short-answer',
]);

const hasInlineBlank = (text: string) => /___|\[BLANK\]|_{3,}/.test(text || '');

export const QuestionPane: React.FC<QuestionPaneProps> = ({
  questions,
  currentQuestionIndex,
  userAnswers,
  onAnswerChange,
  settings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const currentQuestion = questions?.[currentQuestionIndex];
  const isReadingSet = currentQuestion?.section === 'reading';

  // IELTS Reading is presented passage-by-passage. When the candidate is on a
  // question from Passage 1, only that passage's questions are shown beside it;
  // moving to the first question of Passage 2 automatically swaps to the next set.
  const displayedQuestions = useMemo(() => {
    if (!questions?.length || !isReadingSet || !currentQuestion) return questions || [];

    const activePart = currentQuestion.partNumber;
    const activePassageId = currentQuestion.passageId;

    return questions.filter((q) => {
      if (activePart != null && q.partNumber != null) return q.partNumber === activePart;
      if (activePassageId) return q.passageId === activePassageId;
      return true;
    });
  }, [questions, currentQuestion, isReadingSet]);

  const displayedCurrentIndex = Math.max(
    0,
    displayedQuestions.findIndex((q) => q.id === currentQuestion?.id),
  );

  useEffect(() => {
    questionRefs.current = [];
    const targetRef = questionRefs.current[displayedCurrentIndex];
    if (targetRef && containerRef.current) {
      targetRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [displayedCurrentIndex, displayedQuestions]);

  if (!questions || questions.length === 0) return null;

  const fontClass =
    settings.fontSize === 'large'
      ? 'text-lg leading-relaxed'
      : settings.fontSize === 'medium'
      ? 'text-base leading-relaxed'
      : 'text-[15px] leading-relaxed';

  const textInputClass =
    'w-full max-w-[240px] border border-[#444] bg-white text-black font-bold focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] px-3 py-1.5 text-[15px] placeholder:text-black placeholder:opacity-50 placeholder:font-normal rounded-[2px] shadow-sm transition-all';

  const renderInlineCompletion = (q: Question) => {
    const parts = (q.questionText || '').split(/___|\[BLANK\]|_{3,}/g);
    return (
      <span className="leading-loose inline-flex items-center flex-wrap gap-y-2">
        {parts.map((part, i) => {
          const blankKey = i === 0 ? q.id : `${q.id}_blank_${i}`;
          const blankAnswer = userAnswers[blankKey] || '';
          const boxNumber = q.questionNumber + i;
          return (
            <React.Fragment key={`${q.id}-${i}`}>
              <span>{part}</span>
              {i < parts.length - 1 && (
                <span className="inline-block relative mx-2 align-middle">
                  <input
                    type="text"
                    value={blankAnswer}
                    onChange={(e) => onAnswerChange(blankKey, e.target.value)}
                    placeholder={String(boxNumber)}
                    className="border border-[#444] text-center bg-white text-black font-bold focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] px-3 py-1 min-w-[130px] max-w-[210px] text-[15px] placeholder:text-black placeholder:opacity-100 placeholder:font-bold placeholder:text-center rounded-[2px] shadow-sm transition-colors"
                  />
                </span>
              )}
            </React.Fragment>
          );
        })}
      </span>
    );
  };

  const firstVisibleQuestion = displayedQuestions[0]?.questionNumber;
  const lastVisibleQuestion = displayedQuestions[displayedQuestions.length - 1]?.questionNumber;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {isReadingSet && displayedQuestions.length > 0 && (
        <div className="shrink-0 px-8 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#214162]">
                Reading Passage {currentQuestion?.partNumber || ''}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Answer Questions {firstVisibleQuestion}–{lastVisibleQuestion} for this passage.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 rounded px-2.5 py-1">
              Questions {firstVisibleQuestion}–{lastVisibleQuestion}
            </span>
          </div>
        </div>
      )}

      <div ref={containerRef} className="p-8 flex flex-col gap-10 overflow-y-auto flex-1 ielts-scroll">
        {displayedQuestions.map((q, index) => {
          const currentAnswer = userAnswers[q.id] || '';
          const prevQ = index > 0 ? displayedQuestions[index - 1] : null;
          const isNewGroup = !!q.groupId && q.groupId !== prevQ?.groupId;
          const isNewInstruction = !!q.instruction && q.instruction !== prevQ?.instruction && !q.groupInstruction;
          const isSingleChoice = SINGLE_CHOICE_TYPES.has(q.type);
          const isMultiChoice = MULTI_CHOICE_TYPES.has(q.type);
          const isMatching = MATCHING_TYPES.has(q.type);
          const isCompletion = COMPLETION_TYPES.has(q.type);
          const hasOptions = !!q.options?.length;
          const shouldUseSelect = (isMatching || q.type === 'map-labeling' || q.type === 'diagram-labeling' || q.type === 'summary-completion') && hasOptions;
          const shouldUseTextInput = isCompletion && !shouldUseSelect && !(q.type === 'table-completion' && q.tableData) && !hasInlineBlank(q.questionText);

          return (
            <React.Fragment key={q.id}>
              {isNewGroup && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                  {q.groupInstruction && (
                    <p className="font-bold text-slate-800 whitespace-pre-wrap">{q.groupInstruction}</p>
                  )}
                  {q.groupMedia?.type === 'image' && q.groupMedia.url && (
                    <div className="flex justify-center">
                      <ExamImageViewer
                        imageUrl={q.groupMedia.url}
                        imageAlt={q.groupMedia.alt}
                        imageZoomable={q.groupMedia.zoomable}
                      />
                    </div>
                  )}
                </div>
              )}

              {isNewInstruction && (
                <div className="text-sm font-semibold text-slate-800 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 whitespace-pre-wrap">
                  {q.instruction}
                </div>
              )}

              <div
                ref={(el) => (questionRefs.current[index] = el)}
                className="scroll-mt-32 flex flex-col"
              >
                {q.media?.type === 'image' && q.media.url && (
                  <div className={`mb-4 flex flex-col ${q.imagePosition === 'left' ? 'items-start' : q.imagePosition === 'right' ? 'items-end' : 'items-center'}`}>
                    <ExamImageViewer
                      imageUrl={q.media.url}
                      imageAlt={q.media.alt || q.imageAlt}
                      imageZoomable={q.zoomable}
                    />
                    {q.media.caption && <p className="text-center text-xs text-slate-500 mt-2 italic">{q.media.caption}</p>}
                  </div>
                )}

                {!q.media && q.imageUrl && (
                  <div className={`mb-4 flex flex-col ${q.imagePosition === 'left' ? 'items-start' : q.imagePosition === 'right' ? 'items-end' : 'items-center'}`}>
                    <ExamImageViewer
                      imageUrl={q.imageUrl}
                      imageAlt={q.imageAlt}
                      imageZoomable={q.zoomable}
                    />
                    {q.imageCaption && <p className="text-center text-xs text-slate-500 mt-2 italic">{q.imageCaption}</p>}
                  </div>
                )}

                <div className="flex items-start">
                  <span className="w-8 h-8 border border-[#00529b] text-[#00529b] text-[15px] flex items-center justify-center shrink-0 mr-3 mt-0.5 rounded-sm shadow-[2px_0_0_#00529b]">
                    {q.questionNumber}
                  </span>
                  <div className={`text-black pt-1 flex-1 ${fontClass}`}>
                    {isCompletion && hasInlineBlank(q.questionText)
                      ? renderInlineCompletion(q)
                      : <span className="whitespace-pre-wrap">{q.questionText}</span>}
                  </div>
                </div>

                {(isSingleChoice || isMultiChoice) && (
                  <div className="mt-4 space-y-3 pl-[3.25rem]">
                    {hasOptions ? q.options!.map((opt) => {
                      const selectedValues = currentAnswer.split('|').filter(Boolean);
                      const isSelected = isMultiChoice ? selectedValues.includes(opt.value) : currentAnswer === opt.value;
                      const handleToggle = () => {
                        if (isMultiChoice) {
                          const next = isSelected
                            ? selectedValues.filter((v) => v !== opt.value)
                            : [...selectedValues, opt.value];
                          onAnswerChange(q.id, [...new Set(next)].sort().join('|'));
                        } else {
                          onAnswerChange(q.id, opt.value);
                        }
                      };

                      return (
                        <label
                          key={opt.value}
                          onClick={(e) => { e.preventDefault(); handleToggle(); }}
                          className="flex items-center cursor-pointer group"
                        >
                          <input
                            type={isMultiChoice ? 'checkbox' : 'radio'}
                            name={`q-${q.id}`}
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-[16px] h-[16px] border-gray-400 text-black focus:ring-0 cursor-pointer accent-black"
                          />
                          <span className="ml-3 text-[15px] text-black tracking-wide">{opt.label}</span>
                        </label>
                      );
                    }) : (
                      <input
                        type="text"
                        value={currentAnswer}
                        onChange={(e) => onAnswerChange(q.id, e.target.value)}
                        placeholder="Type answer here..."
                        className={textInputClass}
                      />
                    )}
                  </div>
                )}

                {shouldUseSelect && (
                  <div className="mt-3 pl-[3.25rem]">
                    <select
                      value={currentAnswer}
                      onChange={(e) => onAnswerChange(q.id, e.target.value)}
                      className="border border-[#444] bg-white text-black font-bold focus:outline-none focus:ring-2 focus:ring-[#0066cc] px-3 py-1.5 text-[15px] rounded-[2px] shadow-sm max-w-full"
                    >
                      <option value="">Select...</option>
                      {q.options!.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}

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
                                      className="flex-1 border border-[#444] bg-white text-black font-bold focus:outline-none focus:ring-2 focus:ring-[#0066cc] px-2 py-1 max-w-[220px] shadow-sm"
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

                {shouldUseTextInput && (
                  <div className="mt-4 pl-[3.25rem]">
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => onAnswerChange(q.id, e.target.value)}
                      placeholder={String(q.questionNumber)}
                      className={textInputClass}
                    />
                  </div>
                )}

                {!isSingleChoice && !isMultiChoice && !isCompletion && !isMatching && (
                  <div className="mt-4 pl-[3.25rem]">
                    {hasOptions ? (
                      <select
                        value={currentAnswer}
                        onChange={(e) => onAnswerChange(q.id, e.target.value)}
                        className="border border-[#444] bg-white text-black font-bold focus:outline-none focus:ring-2 focus:ring-[#0066cc] px-3 py-1.5 text-[15px] rounded-[2px] shadow-sm max-w-full"
                      >
                        <option value="">Select...</option>
                        {q.options!.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={currentAnswer}
                        onChange={(e) => onAnswerChange(q.id, e.target.value)}
                        placeholder="Type answer here..."
                        className={textInputClass}
                      />
                    )}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
