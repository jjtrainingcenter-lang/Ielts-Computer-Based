import React from 'react';
import { Question, DisplaySettings } from '../types';
import { Bookmark, HelpCircle } from 'lucide-react';

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
  const currentQ = questions[currentQuestionIndex] || questions[0];
  if (!currentQ) return null;

  const currentAnswer = userAnswers[currentQ.id] || '';
  const isFlagged = !!flaggedQuestions[currentQ.id];

  const fontClass =
    settings.fontSize === 'large'
      ? 'text-lg leading-relaxed'
      : settings.fontSize === 'large'
      ? 'text-xl leading-relaxed'
      : 'text-base leading-normal';

  return (
    <div className="flex flex-col h-full bg-[#F4F7F9] overflow-y-auto">
      {/* Pane Subheader */}
      <div className="p-4 border-b border-gray-300 flex justify-between items-center bg-white shrink-0">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Questions 1-{questions.length} (Current: Question {currentQ.questionNumber})
        </h2>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => onToggleFlag(currentQ.id)}
            className={`flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded border transition-colors ${
              isFlagged
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'border-gray-300 text-gray-600 hover:text-gray-900 bg-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{isFlagged ? 'Flagged' : 'Flag'}</span>
          </button>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-xs text-gray-600 font-medium">Standard Test Format</span>
          </div>
        </div>
      </div>

      {/* Question Content Area */}
      <div className="p-8 flex flex-col gap-6 overflow-y-auto flex-1">
        {currentQ.instruction && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded text-xs font-semibold text-blue-900">
            📌 {currentQ.instruction}
          </div>
        )}

        <div className="bg-white p-6 rounded shadow-xs border border-gray-200 space-y-5">
          <div className="flex items-start space-x-3">
            <span className="w-7 h-7 rounded bg-[#214162] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {currentQ.questionNumber}
            </span>
            <p className={`text-sm font-bold text-gray-800 leading-relaxed pt-0.5 ${fontClass}`}>
              {currentQ.questionText}
            </p>
          </div>

          {/* Input Controls Based on Question Type */}
          <div className="pt-2 pl-10">
            {/* Multiple Choice or True/False options */}
            {(currentQ.type === 'multiple-choice' ||
              currentQ.type === 'true-false-not-given' ||
              currentQ.type === 'yes-no-not-given') &&
              currentQ.options && (
                <div className="space-y-3 max-w-xl">
                  {currentQ.options.map((opt) => {
                    const isSelected = currentAnswer === opt.value;
                    return (
                      <label
                        key={opt.value}
                        onClick={() => onAnswerChange(currentQ.id, opt.value)}
                        className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-gray-900 font-medium'
                            : 'border-gray-200 hover:bg-blue-50/50 text-gray-700 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${currentQ.id}`}
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
            {currentQ.type === 'fill-blank' && (
              <div className="space-y-2 max-w-md">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Type your answer below:
                </span>
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => onAnswerChange(currentQ.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-3 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white text-gray-800 font-medium"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
