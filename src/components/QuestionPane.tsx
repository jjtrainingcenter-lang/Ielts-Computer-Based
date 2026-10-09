import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Question, DisplaySettings, HighlightItem } from '../types';
import { ExamImageViewer } from './ExamImageViewer';
import { HighlightSelectionWrapper } from './HighlightSelectionWrapper';
import { HighlightText } from './HighlightText';
import { HighlightPaletteBar } from './HighlightPaletteBar';
import { HighlightColor } from '../lib/highlightColors';
import {
  Columns,
  Rows,
  Pin,
  Maximize2,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';

interface QuestionPaneProps {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<string, string>;
  onAnswerChange: (qId: string, answer: string) => void;
  flaggedQuestions: Record<string, boolean>;
  onToggleFlag: (qId: string) => void;
  settings: DisplaySettings;
  highlights?: HighlightItem[];
  onAddHighlight?: (highlight: Omit<HighlightItem, 'id' | 'createdAt'>) => void;
  onRemoveHighlight?: (id: string) => void;
  onUpdateHighlight?: (id: string, updates: Partial<HighlightItem>) => void;
  section?: 'listening' | 'reading' | 'writing' | 'speaking';
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

interface QuestionGroupBlock {
  key: string;
  groupId?: string;
  groupInstruction?: string;
  instruction?: string;
  groupImage?: {
    url: string;
    alt?: string;
    caption?: string;
    zoomable?: boolean;
  };
  questions: {
    q: Question;
    index: number;
  }[];
}

const parseQuestionRange = (text?: string): { start: number; end: number } | null => {
  if (!text) return null;
  const match = text.match(/(?:questions?|qs?)\s*(\d+)\s*(?:-|–|to)\s*(\d+)/i);
  if (match) {
    const start = parseInt(match[1], 10);
    const end = parseInt(match[2], 10);
    if (!isNaN(start) && !isNaN(end) && start <= end) {
      return { start, end };
    }
  }
  return null;
};

export const QuestionPane: React.FC<QuestionPaneProps> = ({
  questions,
  currentQuestionIndex,
  userAnswers,
  onAnswerChange,
  flaggedQuestions,
  onToggleFlag,
  settings,
  highlights = [],
  onAddHighlight,
  onRemoveHighlight,
  onUpdateHighlight,
  section,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Layout preference per block ('split' | 'stacked')
  const [blockLayouts, setBlockLayouts] = useState<Record<string, 'split' | 'stacked'>>({});

  // Pinned floating Picture-in-Picture reference
  const [pinnedImage, setPinnedImage] = useState<{
    url: string;
    alt?: string;
    caption?: string;
    title?: string;
  } | null>(null);
  const [isFloatingMinimized, setIsFloatingMinimized] = useState<boolean>(false);

  // Fullscreen Lightbox Modal
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    alt?: string;
    caption?: string;
  } | null>(null);

  const currentQuestion = questions?.[currentQuestionIndex];
  const isReadingSet = section ? section === 'reading' : (currentQuestion?.section === 'reading' || !!currentQuestion?.passageId);

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

  // Group questions into smart blocks
  const questionBlocks = useMemo<QuestionGroupBlock[]>(() => {
    if (!displayedQuestions.length) return [];

    const blocks: QuestionGroupBlock[] = [];
    let currentBlock: QuestionGroupBlock | null = null;
    let currentRange: { start: number; end: number } | null = null;

    displayedQuestions.forEach((q, index) => {
      const prevQ = index > 0 ? displayedQuestions[index - 1] : null;

      const explicitRange = parseQuestionRange(q.groupInstruction);
      const isNewGroupInstruction = !!q.groupInstruction && q.groupInstruction !== prevQ?.groupInstruction;
      const isNewGroupId = !!q.groupId && q.groupId !== prevQ?.groupId;
      const hasNewGroupMedia = !!q.groupMedia?.url && q.groupMedia?.url !== prevQ?.groupMedia?.url;
      const isPastRange = currentRange ? q.questionNumber > currentRange.end : false;

      const shouldStartNewBlock =
        !currentBlock ||
        isNewGroupInstruction ||
        (isNewGroupId && !currentRange) ||
        hasNewGroupMedia ||
        isPastRange ||
        (q.groupMedia?.url && !currentBlock.groupImage) ||
        (q.imageUrl && !currentBlock.groupImage && explicitRange != null);

      if (shouldStartNewBlock) {
        currentRange = explicitRange || null;

        const candidateImage = q.groupMedia?.url
          ? {
              url: q.groupMedia.url,
              alt: q.groupMedia.alt || `Visual Reference for Questions`,
              caption: undefined,
              zoomable: q.groupMedia.zoomable !== false,
            }
          : q.imageUrl && (explicitRange != null || q.groupId)
          ? {
              url: q.imageUrl,
              alt: q.imageAlt || `Visual Reference for Questions`,
              caption: q.imageCaption,
              zoomable: q.zoomable !== false,
            }
          : undefined;

        currentBlock = {
          key: `block-${q.id}-${index}`,
          groupId: q.groupId,
          groupInstruction: q.groupInstruction,
          instruction: q.instruction,
          groupImage: candidateImage,
          questions: [{ q, index }],
        };
        blocks.push(currentBlock);
      } else {
        currentBlock.questions.push({ q, index });
        if (!currentBlock.groupImage && q.groupMedia?.url) {
          currentBlock.groupImage = {
            url: q.groupMedia.url,
            alt: q.groupMedia.alt || `Visual Reference for Questions`,
            caption: undefined,
            zoomable: q.groupMedia.zoomable !== false,
          };
        }
      }
    });

    return blocks;
  }, [displayedQuestions]);

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

  const questionsContextId = isReadingSet ? 'reading_questions' : 'listening_questions';

  const handlePaletteHighlight = (color: HighlightColor) => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      const text = sel.toString().trim();
      if (text.length > 0 && onAddHighlight) {
        const segments = text
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        segments.forEach((seg) => {
          onAddHighlight({
            passageId: questionsContextId,
            text: seg,
            color,
          });
        });
        sel.removeAllRanges();
      }
    }
  };

  const currentContextHighlights = (highlights || []).filter((h) => {
    if (isReadingSet) return h.passageId === 'reading_questions' || h.passageId === 'questions';
    return h.passageId === 'listening_questions';
  });

  const firstVisibleQuestion = displayedQuestions[0]?.questionNumber;
  const lastVisibleQuestion = displayedQuestions[displayedQuestions.length - 1]?.questionNumber;

  const toggleBlockLayout = (blockKey: string, mode: 'split' | 'stacked') => {
    setBlockLayouts((prev) => ({ ...prev, [blockKey]: mode }));
  };

  const isBlockSplit = (blockKey: string) => {
    return blockLayouts[blockKey] !== undefined ? blockLayouts[blockKey] === 'split' : true;
  };

  const renderQuestionItem = (q: Question, indexInDisplayed: number, isInsideImageBlock = false) => {
    const currentAnswer = userAnswers[q.id] || '';
    const isSingleChoice = SINGLE_CHOICE_TYPES.has(q.type);
    const isMultiChoice = MULTI_CHOICE_TYPES.has(q.type);
    const isMatching = MATCHING_TYPES.has(q.type);
    const isCompletion = COMPLETION_TYPES.has(q.type);
    const hasOptions = !!q.options?.length;
    const shouldUseSelect =
      (isMatching || q.type === 'map-labeling' || q.type === 'diagram-labeling' || q.type === 'summary-completion') &&
      hasOptions;
    const shouldUseTextInput =
      isCompletion && !shouldUseSelect && !(q.type === 'table-completion' && q.tableData) && !hasInlineBlank(q.questionText);
    const isCurrent = displayedCurrentIndex === indexInDisplayed;

    return (
      <div
        key={q.id}
        ref={(el) => {
          questionRefs.current[indexInDisplayed] = el;
        }}
        className={`scroll-mt-32 flex flex-col select-text transition-all rounded-lg p-2.5 ${
          isCurrent ? 'bg-blue-50/50 ring-1 ring-blue-300' : ''
        }`}
      >
        {/* Render standalone image only if not already shown as the block group image */}
        {!isInsideImageBlock && q.media?.type === 'image' && q.media.url && (
          <div className="mb-4 flex flex-col items-start bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between w-full mb-1.5 pb-1 border-b border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> Reference Image
              </span>
              <button
                type="button"
                onClick={() =>
                  setPinnedImage({
                    url: q.media!.url,
                    alt: q.media!.alt || q.imageAlt,
                    caption: q.media!.caption,
                    title: `Question ${q.questionNumber} Image`,
                  })
                }
                className="text-[11px] text-[#00529b] hover:underline font-semibold flex items-center gap-1"
              >
                <Pin className="w-3 h-3" /> Pin Picture
              </button>
            </div>
            <ExamImageViewer
              imageUrl={q.media.url}
              imageAlt={q.media.alt || q.imageAlt}
              imageZoomable={q.zoomable !== false}
            />
            {q.media.caption && <p className="text-left text-xs text-slate-500 mt-2 italic">{q.media.caption}</p>}
          </div>
        )}

        {!isInsideImageBlock && !q.media && q.imageUrl && (
          <div className="mb-4 flex flex-col items-start bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between w-full mb-1.5 pb-1 border-b border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> Reference Image
              </span>
              <button
                type="button"
                onClick={() =>
                  setPinnedImage({
                    url: q.imageUrl!,
                    alt: q.imageAlt,
                    caption: q.imageCaption,
                    title: `Question ${q.questionNumber} Image`,
                  })
                }
                className="text-[11px] text-[#00529b] hover:underline font-semibold flex items-center gap-1"
              >
                <Pin className="w-3 h-3" /> Pin Picture
              </button>
            </div>
            <ExamImageViewer
              imageUrl={q.imageUrl}
              imageAlt={q.imageAlt}
              imageZoomable={q.zoomable !== false}
            />
            {q.imageCaption && <p className="text-left text-xs text-slate-500 mt-2 italic">{q.imageCaption}</p>}
          </div>
        )}

        <div className="flex items-start">
          <span className="w-8 h-8 border border-[#00529b] text-[#00529b] text-[15px] flex items-center justify-center shrink-0 mr-3 mt-0.5 rounded-sm shadow-[2px_0_0_#00529b] bg-white font-bold">
            {q.questionNumber}
          </span>
          <div className={`text-black pt-1 flex-1 select-text ${fontClass}`}>
            {isCompletion && hasInlineBlank(q.questionText) ? (
              renderInlineCompletion(q)
            ) : (
              <span className="whitespace-pre-wrap select-text">
                <HighlightText
                  text={q.questionText}
                  contextId={questionsContextId}
                  highlights={highlights}
                  onRemoveHighlight={(id) => onRemoveHighlight && onRemoveHighlight(id)}
                  onUpdateHighlight={onUpdateHighlight}
                />
              </span>
            )}
          </div>
        </div>

        {(isSingleChoice || isMultiChoice) && (
          <div className="mt-4 space-y-3 pl-[3.25rem] select-text">
            {hasOptions ? (
              q.options!.map((opt) => {
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
                  <div
                    key={opt.value}
                    onClick={() => {
                      const sel = window.getSelection();
                      if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
                        return;
                      }
                      handleToggle();
                    }}
                    className="flex items-center cursor-pointer group select-text py-1"
                  >
                    <input
                      type={isMultiChoice ? 'checkbox' : 'radio'}
                      name={`q-${q.id}`}
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-[16px] h-[16px] border-gray-400 text-black focus:ring-0 cursor-pointer accent-black shrink-0"
                    />
                    <span className="ml-3 text-[15px] text-black tracking-wide select-text">
                      <HighlightText
                        text={opt.label || ''}
                        contextId={questionsContextId}
                        highlights={highlights}
                        onRemoveHighlight={(id) => onRemoveHighlight && onRemoveHighlight(id)}
                        onUpdateHighlight={onUpdateHighlight}
                      />
                    </span>
                  </div>
                );
              })
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

        {shouldUseSelect && (
          <div className="mt-3 pl-[3.25rem]">
            <select
              value={currentAnswer}
              onChange={(e) => onAnswerChange(q.id, e.target.value)}
              className="border border-[#444] bg-white text-black font-bold focus:outline-none focus:ring-2 focus:ring-[#0066cc] px-3 py-1.5 text-[15px] rounded-[2px] shadow-sm max-w-full"
            >
              <option value="">Select...</option>
              {q.options!.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {q.type === 'table-completion' && q.tableData && (
          <div className="mt-4 pl-[3.25rem] overflow-x-auto w-full select-text">
            <table className="w-full min-w-[400px] border-collapse border border-[#444] text-[15px] select-text">
              <thead>
                <tr>
                  {q.tableData.headers.map((h, i) => (
                    <th
                      key={i}
                      className="border border-[#444] p-2 bg-slate-100 font-bold text-left text-slate-800 select-text"
                    >
                      <HighlightText
                        text={h}
                        contextId={questionsContextId}
                        highlights={highlights}
                        onRemoveHighlight={(id) => onRemoveHighlight && onRemoveHighlight(id)}
                        onUpdateHighlight={onUpdateHighlight}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {q.tableData.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="border border-[#444] p-2 align-top text-slate-800 select-text">
                        {typeof cell === 'string' ? (
                          <HighlightText
                            text={cell}
                            contextId={questionsContextId}
                            highlights={highlights}
                            onRemoveHighlight={(id) => onRemoveHighlight && onRemoveHighlight(id)}
                            onUpdateHighlight={onUpdateHighlight}
                          />
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
                {q.options!.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
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
    );
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden select-text relative">
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
            <div className="flex items-center space-x-3">
              <HighlightPaletteBar
                compact
                onChangeColor={handlePaletteHighlight}
                highlightCount={currentContextHighlights.length}
              />
              <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 rounded px-2.5 py-1">
                Questions {firstVisibleQuestion}–{lastVisibleQuestion}
              </span>
            </div>
          </div>
        </div>
      )}

      {!isReadingSet && currentQuestion && (
        <div className="shrink-0 px-8 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#214162]">
              Part {currentQuestion.partNumber || 1}
            </span>
            <span className="text-xs text-slate-500">
              · Question {currentQuestion.questionNumber} of {questions.length}
            </span>
          </div>
          <HighlightPaletteBar
            compact
            onChangeColor={handlePaletteHighlight}
            highlightCount={currentContextHighlights.length}
          />
        </div>
      )}

      <HighlightSelectionWrapper
        contextId={questionsContextId}
        onAddHighlight={(highlight) => onAddHighlight && onAddHighlight(highlight)}
        className="p-4 sm:p-8 flex flex-col gap-8 overflow-y-auto flex-1 ielts-scroll select-text"
      >
        <div ref={containerRef} className="flex flex-col gap-8">
          {questionBlocks.map((block) => {
            const hasImage = !!block.groupImage?.url;
            const isSplit = isBlockSplit(block.key);

            return (
              <div key={block.key} className="flex flex-col gap-4">
                {/* Image Block: Header with Layout Toggles & Pin Reference */}
                {hasImage ? (
                  <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs transition-all">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-100 text-[#00529b] border border-blue-200">
                          <ImageIcon className="w-3.5 h-3.5" />
                          {block.groupInstruction || `Questions ${block.questions[0].q.questionNumber}–${block.questions[block.questions.length - 1].q.questionNumber}`}
                        </span>
                      </div>

                      {/* View & Pin Controls */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg text-xs shadow-2xs">
                        <button
                          type="button"
                          onClick={() => toggleBlockLayout(block.key, 'split')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                            isSplit
                              ? 'bg-[#00529b] text-white shadow-xs font-bold'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                          title="Side-by-Side: Keep picture pinned on left while answering on right (No scrolling!)"
                        >
                          <Columns className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Side-by-Side</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleBlockLayout(block.key, 'stacked')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                            !isSplit
                              ? 'bg-[#00529b] text-white shadow-xs font-bold'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                          title="Stacked: Picture on top, questions below"
                        >
                          <Rows className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Stacked</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (pinnedImage?.url === block.groupImage!.url) {
                              setPinnedImage(null);
                            } else {
                              setPinnedImage({
                                url: block.groupImage!.url,
                                alt: block.groupImage!.alt,
                                caption: block.groupImage!.caption,
                                title: block.groupInstruction || `Questions Reference`,
                              });
                              setIsFloatingMinimized(false);
                            }
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                            pinnedImage?.url === block.groupImage!.url
                              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                          title="Pin Picture as floating card so it stays in view wherever you scroll"
                        >
                          <Pin className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">
                            {pinnedImage?.url === block.groupImage!.url ? 'Pinned' : 'Pin Picture'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Group Instruction */}
                    {block.groupInstruction && (
                      <p className="font-bold text-slate-800 text-sm whitespace-pre-wrap select-text mb-3">
                        <HighlightText
                          text={block.groupInstruction}
                          contextId={questionsContextId}
                          highlights={highlights}
                          onRemoveHighlight={(id) => onRemoveHighlight && onRemoveHighlight(id)}
                          onUpdateHighlight={onUpdateHighlight}
                        />
                      </p>
                    )}

                    {/* Sub-instruction if any */}
                    {block.instruction && (
                      <div className="text-xs font-semibold text-slate-700 bg-blue-50/70 border border-blue-100 rounded-lg px-3.5 py-2 mb-4 whitespace-pre-wrap select-text">
                        <HighlightText
                          text={block.instruction}
                          contextId={questionsContextId}
                          highlights={highlights}
                          onRemoveHighlight={(id) => onRemoveHighlight && onRemoveHighlight(id)}
                          onUpdateHighlight={onUpdateHighlight}
                        />
                      </div>
                    )}

                    {/* Layout Body: Side-by-Side vs Stacked */}
                    {isSplit ? (
                      /* SIDE BY SIDE: Picture Sticky on Left, Questions on Right */
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Sticky Reference Image */}
                        <div className="lg:col-span-6 xl:col-span-6 sticky top-4 self-start bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-[#00529b]" />
                              <span>Reference Picture (Pinned beside questions)</span>
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setLightboxImage(block.groupImage!)}
                                className="p-1 text-slate-500 hover:text-[#00529b] hover:bg-slate-100 rounded transition-colors"
                                title="Fullscreen / Enlarge"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="max-h-[calc(100vh-220px)] overflow-auto bg-slate-50/50 rounded-lg border border-slate-100 p-2 flex justify-center ielts-scroll">
                            <ExamImageViewer
                              imageUrl={block.groupImage.url}
                              imageAlt={block.groupImage.alt}
                              imageZoomable={block.groupImage.zoomable !== false}
                            />
                          </div>
                          {block.groupImage.caption && (
                            <p className="text-xs text-slate-500 mt-2 italic text-center select-text">
                              {block.groupImage.caption}
                            </p>
                          )}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Image remains visible while scrolling</span>
                            <button
                              type="button"
                              onClick={() => {
                                setPinnedImage({
                                  url: block.groupImage!.url,
                                  alt: block.groupImage!.alt,
                                  caption: block.groupImage!.caption,
                                  title: block.groupInstruction || `Questions Reference`,
                                });
                                setIsFloatingMinimized(false);
                              }}
                              className="text-[#00529b] hover:underline font-semibold flex items-center gap-1"
                            >
                              <Pin className="w-3 h-3" /> Pin Floating
                            </button>
                          </div>
                        </div>

                        {/* Right Questions Column */}
                        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6 bg-white p-3 sm:p-4 rounded-xl border border-slate-200">
                          {block.questions.map(({ q, index }) => renderQuestionItem(q, index, true))}
                        </div>
                      </div>
                    ) : (
                      /* STACKED: Picture on Top, Questions Below */
                      <div className="space-y-6">
                        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                          <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-100">
                            <span className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-[#00529b]" />
                              <span>Reference Picture</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setPinnedImage({
                                    url: block.groupImage!.url,
                                    alt: block.groupImage!.alt,
                                    caption: block.groupImage!.caption,
                                    title: block.groupInstruction || `Questions Reference`,
                                  });
                                  setIsFloatingMinimized(false);
                                }}
                                className="text-xs text-[#00529b] hover:underline font-semibold flex items-center gap-1"
                              >
                                <Pin className="w-3.5 h-3.5" /> Pin
                              </button>
                              <button
                                type="button"
                                onClick={() => setLightboxImage(block.groupImage!)}
                                className="p-1 text-slate-500 hover:text-[#00529b] rounded"
                                title="Fullscreen"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-center bg-slate-50/50 rounded-lg p-2">
                            <ExamImageViewer
                              imageUrl={block.groupImage.url}
                              imageAlt={block.groupImage.alt}
                              imageZoomable={block.groupImage.zoomable !== false}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-6 bg-white p-3 sm:p-4 rounded-xl border border-slate-200">
                          {block.questions.map(({ q, index }) => renderQuestionItem(q, index, true))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Block without Image */
                  <div className="space-y-4">
                    {block.groupInstruction && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="font-bold text-slate-800 whitespace-pre-wrap select-text">
                          <HighlightText
                            text={block.groupInstruction}
                            contextId={questionsContextId}
                            highlights={highlights}
                            onRemoveHighlight={(id) => onRemoveHighlight && onRemoveHighlight(id)}
                            onUpdateHighlight={onUpdateHighlight}
                          />
                        </p>
                      </div>
                    )}

                    {block.instruction && (
                      <div className="text-sm font-semibold text-slate-800 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 whitespace-pre-wrap select-text">
                        <HighlightText
                          text={block.instruction}
                          contextId={questionsContextId}
                          highlights={highlights}
                          onRemoveHighlight={(id) => onRemoveHighlight && onRemoveHighlight(id)}
                          onUpdateHighlight={onUpdateHighlight}
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-6">
                      {block.questions.map(({ q, index }) => renderQuestionItem(q, index, false))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </HighlightSelectionWrapper>

      {/* Floating Picture-in-Picture Reference Card */}
      {pinnedImage && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white border-2 border-[#00529b] rounded-xl shadow-2xl transition-all duration-200 overflow-hidden ${
            isFloatingMinimized ? 'w-64' : 'w-80 sm:w-96 max-h-[85vh] flex flex-col'
          }`}
        >
          {/* Floating Header */}
          <div className="flex items-center justify-between bg-[#00529b] text-white px-3 py-2 select-none">
            <span className="text-xs font-bold flex items-center gap-1.5 truncate">
              <Pin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">{pinnedImage.title || 'Pinned Reference Picture'}</span>
            </span>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                type="button"
                onClick={() => setIsFloatingMinimized(!isFloatingMinimized)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title={isFloatingMinimized ? 'Expand' : 'Minimize'}
              >
                {isFloatingMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setLightboxImage(pinnedImage)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPinnedImage(null)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Close Pinned Picture"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Floating Image Body */}
          {!isFloatingMinimized && (
            <div className="p-3 bg-slate-50 flex-1 overflow-auto flex flex-col items-center max-h-[380px] ielts-scroll">
              <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-inner w-full flex justify-center">
                <img
                  src={pinnedImage.url}
                  alt={pinnedImage.alt || 'Reference Image'}
                  className="max-h-[320px] w-auto object-contain rounded"
                />
              </div>
              {pinnedImage.caption && (
                <p className="text-[11px] text-slate-500 mt-2 text-center italic">{pinnedImage.caption}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-5xl max-h-[92vh] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col w-full">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white">
              <span className="text-sm font-bold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                {lightboxImage.alt || 'High-Resolution Visual Reference'}
              </span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1.5 hover:bg-white/20 rounded text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-100 flex-1 min-h-[300px]">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.alt || 'Full Resolution'}
                className="max-h-[80vh] max-w-full object-contain rounded shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
