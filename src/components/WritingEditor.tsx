import React, { useState } from 'react';
import { WritingTaskData, DisplaySettings } from '../types';
import { ExamImageViewer } from './ExamImageViewer';
import {
  FileText,
  CheckCircle,
  BarChart3,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Check,
  BookOpen,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface WritingEditorProps {
  tasks: WritingTaskData[];
  task1Text: string;
  task2Text: string;
  onChangeTask1: (val: string) => void;
  onChangeTask2: (val: string) => void;
  settings: DisplaySettings;
  onEvaluateAI?: () => void;
  isEvaluatingAI?: boolean;
}

export const WritingEditor: React.FC<WritingEditorProps> = ({
  tasks,
  task1Text,
  task2Text,
  onChangeTask1,
  onChangeTask2,
  settings,
  onEvaluateAI,
  isEvaluatingAI,
}) => {
  const [activeTaskNum, setActiveTaskNum] = useState<1 | 2>(1);
  const [showTips, setShowTips] = useState(false);

  // Fallback if tasks are empty or undefined
  const defaultTasks: WritingTaskData[] = [
    {
      taskNumber: 1,
      title: 'Writing Task 1',
      prompt: 'Summarize the given information, charts, or prompt in your own words. Write at least 150 words.',
      minWordCount: 150,
      timeLimitMinutes: 20,
    },
    {
      taskNumber: 2,
      title: 'Writing Task 2',
      prompt: 'Write an essay responding to the point of view, argument, or problem presented. Write at least 250 words.',
      minWordCount: 250,
      timeLimitMinutes: 40,
    }
  ];

  const currentTaskList = tasks && tasks.length > 0 ? tasks : defaultTasks;
  const currentTask = currentTaskList.find((t) => t.taskNumber === activeTaskNum) || currentTaskList[0];

  const currentText = activeTaskNum === 1 ? task1Text : task2Text;
  const onChangeText = activeTaskNum === 1 ? onChangeTask1 : onChangeTask2;

  // Calculate live word count & stats
  const countWords = (str: string) => {
    const trimmed = str.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };

  const countCharacters = (str: string) => str.length;
  const countParagraphs = (str: string) => {
    const trimmed = str.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\n+/).filter((p) => p.trim().length > 0).length;
  };

  const wordCount1 = countWords(task1Text);
  const wordCount2 = countWords(task2Text);
  const wordCount = activeTaskNum === 1 ? wordCount1 : wordCount2;
  const minWords = currentTask.minWordCount || (activeTaskNum === 1 ? 150 : 250);
  const isTargetReached = wordCount >= minWords;
  const progressPercent = Math.min(100, Math.round((wordCount / minWords) * 100));

  // Font size mapping based on settings
  const fontSizeClass =
    settings.fontSize === 'large'
      ? 'text-base leading-relaxed'
      : settings.fontSize === 'small'
      ? 'text-xs leading-normal'
      : 'text-sm leading-relaxed';

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#F4F7F9] border-t border-gray-300 select-text overflow-hidden">
      {/* Left Pane: Question Prompt, Instructions & Graphic Diagram */}
      <div className="lg:w-1/2 p-5 sm:p-6 overflow-y-auto border-r border-gray-300 space-y-5 bg-white">
        {/* Task Switcher Ribbon */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3.5">
          <div className="flex items-center space-x-2">
            {[1, 2].map((num) => {
              const t = currentTaskList.find((item) => item.taskNumber === num) || {
                taskNumber: num as 1 | 2,
                minWordCount: num === 1 ? 150 : 250,
                timeLimitMinutes: num === 1 ? 20 : 40,
              };
              const taskWords = num === 1 ? wordCount1 : wordCount2;
              const isDone = taskWords >= t.minWordCount;

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setActiveTaskNum(num as 1 | 2)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-2 ${
                    num === activeTaskNum
                      ? 'bg-[#214162] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>Task {num}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                      num === activeTaskNum
                        ? isDone
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/20 text-white'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-800 font-bold'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {taskWords}/{t.minWordCount}w
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-medium text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Suggested: {currentTask.timeLimitMinutes || (activeTaskNum === 1 ? 20 : 40)} mins</span>
            </span>
          </div>
        </div>

        {/* Task Title & Question Prompt */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-[#214162] border border-blue-200">
              <BookOpen className="w-3.5 h-3.5 text-[#214162]" />
              <span>Writing Task {currentTask.taskNumber} Question</span>
            </span>

            <button
              type="button"
              onClick={() => setShowTips(!showTips)}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center space-x-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showTips ? 'Hide Tips' : 'Examiner Criteria'}</span>
              {showTips ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentTask.title}
          </h2>

          {/* Examiner Criteria Accordion */}
          {showTips && (
            <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-200 text-xs text-blue-950 space-y-2">
              <h4 className="font-bold text-[#214162] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>IELTS Official Band Criteria ({activeTaskNum === 1 ? 'Task 1' : 'Task 2'}):</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                <li className="bg-white/80 p-2 rounded border border-blue-100">
                  <strong>Task {activeTaskNum === 1 ? 'Achievement' : 'Response'}:</strong> Address all parts of prompt; minimum {minWords} words.
                </li>
                <li className="bg-white/80 p-2 rounded border border-blue-100">
                  <strong>Coherence & Cohesion:</strong> Logical paragraphing and clear connectors.
                </li>
                <li className="bg-white/80 p-2 rounded border border-blue-100">
                  <strong>Lexical Resource:</strong> Wide range of vocabulary and precise collocations.
                </li>
                <li className="bg-white/80 p-2 rounded border border-blue-100">
                  <strong>Grammar & Accuracy:</strong> Complex sentence structures with minimal error.
                </li>
              </ul>
            </div>
          )}

          {/* Prompt Box */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm leading-relaxed text-slate-800 whitespace-pre-line shadow-2xs font-sans">
            {currentTask.prompt}
          </div>

          {/* Optional Task Image (Map, Graph, Diagram) */}
          {currentTask.imageUrl && (
            <div className="mb-4">
              <ExamImageViewer 
                imageUrl={currentTask.imageUrl} 
                imageAlt={currentTask.imageAlt || `Visual Reference for Task ${activeTaskNum}`} 
                imageZoomable={currentTask.imageZoomable !== false} 
              />
            </div>
          )}
        </div>

        {/* Bar Chart Visualization for Task 1 (if available) */}
        {activeTaskNum === 1 && currentTask.chartData && (
          <div className="p-5 bg-white rounded-lg border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Reference Visual Data / Diagram</span>
              </h4>
            </div>

            {/* SVG Bar Chart */}
            <div className="space-y-3 pt-1">
              {currentTask.chartData.labels.map((country, idx) => (
                <div key={country} className="space-y-1">
                  <span className="text-xs font-semibold text-slate-700">
                    {country}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {currentTask.chartData?.datasets.map((dataset) => {
                      const val = dataset.data[idx];
                      return (
                        <div key={dataset.label} className="space-y-0.5">
                          <div className="flex justify-between text-[10px] font-mono text-slate-500">
                            <span>{dataset.label}</span>
                            <span className="font-bold text-slate-800">{val}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded overflow-hidden">
                            <div
                              className="h-full rounded transition-all duration-500"
                              style={{
                                width: `${val}%`,
                                backgroundColor: dataset.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-4 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
              {currentTask.chartData.datasets.map((d) => (
                <div key={d.label} className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Pane: Student Writing Text Editor & Live Word Counter */}
      <div className="lg:w-1/2 p-5 sm:p-6 flex flex-col bg-white overflow-hidden">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3 shrink-0">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#214162]" />
            <h3 className="text-sm font-bold text-slate-900">
              Task {activeTaskNum} Response
            </h3>
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <Check className="w-3 h-3" /> Auto-saved
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Live Word Count Badge */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-bold border transition-colors ${
                isTargetReached
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              {isTargetReached ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>
                {wordCount} / {minWords} words
              </span>
            </div>

            {/* AI Grading Trigger button */}
            {onEvaluateAI && (
              <button
                type="button"
                onClick={onEvaluateAI}
                disabled={isEvaluatingAI}
                className="flex items-center space-x-1.5 px-3 py-1 bg-[#214162] hover:bg-[#1a334e] text-white font-bold text-xs rounded-md transition-all disabled:opacity-50 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isEvaluatingAI ? 'Grading...' : 'AI Band Score'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Textarea Area */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          <textarea
            value={currentText}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder={`Type your Task ${activeTaskNum} answer here...\n\nInstructions:\n• Write your response directly in this text box.\n• Minimum requirement: ${minWords} words.\n• Your response is recorded live and will be submitted for examiner assessment.`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className={`w-full flex-1 p-4 bg-slate-50/60 hover:bg-slate-50 focus:bg-white rounded-lg border border-slate-300 focus:border-[#214162] focus:ring-1 focus:ring-[#214162] focus:outline-none font-sans ${fontSizeClass} text-slate-900 resize-none transition-all`}
          />

          {/* Bottom Word Progress & Text Statistics Bar */}
          <div className="mt-3 pt-2 border-t border-slate-100 space-y-1.5 shrink-0">
            <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
              <div className="flex items-center space-x-3">
                <span>Words: <strong className="text-slate-800">{wordCount}</strong></span>
                <span>Chars: <strong className="text-slate-800">{countCharacters(currentText)}</strong></span>
                <span>Paragraphs: <strong className="text-slate-800">{countParagraphs(currentText)}</strong></span>
              </div>
              <div>
                <span className={isTargetReached ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
                  {progressPercent}% of minimum target
                </span>
              </div>
            </div>

            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isTargetReached ? 'bg-emerald-500' : 'bg-[#214162]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
