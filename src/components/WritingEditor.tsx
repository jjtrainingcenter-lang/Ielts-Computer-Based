import React, { useState } from 'react';
import { WritingTaskData, DisplaySettings } from '../types';
import { FileText, CheckCircle, BarChart3, AlertCircle, Sparkles } from 'lucide-react';

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
  const currentTask = tasks.find((t) => t.taskNumber === activeTaskNum) || tasks[0];

  const currentText = activeTaskNum === 1 ? task1Text : task2Text;
  const onChangeText = activeTaskNum === 1 ? onChangeTask1 : onChangeTask2;

  // Calculate live word count
  const countWords = (str: string) => {
    const trimmed = str.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };

  const wordCount = countWords(currentText);
  const minWords = currentTask.minWordCount;
  const isTargetReached = wordCount >= minWords;
  const progressPercent = Math.min(100, Math.round((wordCount / minWords) * 100));

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#F4F7F9] border-t border-gray-300">
      {/* Left Pane: Prompt & Graphic Diagram */}
      <div className="lg:w-1/2 p-6 overflow-y-auto border-r border-gray-300 space-y-6 bg-white">
        {/* Task Switcher Ribbon */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-2">
            {tasks.map((t) => (
              <button
                key={t.taskNumber}
                type="button"
                onClick={() => setActiveTaskNum(t.taskNumber)}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
                  t.taskNumber === activeTaskNum
                    ? 'bg-[#214162] text-white shadow-xs'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Task {t.taskNumber} ({t.minWordCount}+ words)
              </button>
            ))}
          </div>

          <span className="text-xs font-mono font-medium text-gray-500">
            Suggested Time: {currentTask.timeLimitMinutes} mins
          </span>
        </div>

        {/* Task Title & Prompt */}
        <div className="space-y-3">
          <span className="inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-[#214162] border border-blue-200">
            Academic Writing Task {currentTask.taskNumber}
          </span>
          <h2 className="text-lg font-bold text-gray-900">
            {currentTask.title}
          </h2>
          <div className="p-4 bg-gray-50 rounded border border-gray-200 text-sm leading-relaxed text-gray-800 whitespace-pre-line">
            {currentTask.prompt}
          </div>
        </div>

        {/* Bar Chart Visualization for Task 1 */}
        {activeTaskNum === 1 && currentTask.chartData && (
          <div className="p-5 bg-white rounded border border-gray-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center space-x-1.5">
                <BarChart3 className="w-4 h-4 text-blue-600" /> Electricity Generation from Renewables (%)
              </h4>
            </div>

            {/* SVG Bar Chart */}
            <div className="space-y-3 pt-2">
              {currentTask.chartData.labels.map((country, idx) => (
                <div key={country} className="space-y-1">
                  <span className="text-xs font-semibold text-gray-700">
                    {country}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {currentTask.chartData?.datasets.map((dataset) => {
                      const val = dataset.data[idx];
                      return (
                        <div key={dataset.label} className="space-y-0.5">
                          <div className="flex justify-between text-[10px] font-mono text-gray-500">
                            <span>{dataset.label}</span>
                            <span className="font-bold text-gray-800">{val}%</span>
                          </div>
                          <div className="w-full bg-gray-100 h-3 rounded overflow-hidden">
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
            <div className="flex items-center justify-center space-x-4 border-t border-gray-100 pt-3 text-[11px] text-gray-500">
              {currentTask.chartData.datasets.map((d) => (
                <div key={d.label} className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Pane: Writing Text Editor & Word Counter */}
      <div className="lg:w-1/2 p-6 flex flex-col bg-white">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#214162]" />
            <h3 className="text-sm font-bold text-gray-900">
              Task {activeTaskNum} Response
            </h3>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live Word Count Badge */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-bold border transition-colors ${
                isTargetReached
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
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
                className="flex items-center space-x-1.5 px-3 py-1 bg-[#214162] hover:bg-[#2b547e] text-white font-bold text-xs rounded transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEvaluatingAI ? 'Grading...' : 'AI Band Score'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Textarea */}
        <div className="flex-1 flex flex-col relative">
          <textarea
            value={currentText}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder={`Type your Task ${activeTaskNum} essay response here... (Aim for at least ${minWords} words)`}
            className="w-full flex-1 p-4 bg-gray-50 rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:outline-none font-sans text-sm leading-relaxed text-gray-800 resize-none"
          />

          {/* Bottom Word Progress Bar */}
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[11px] text-gray-500 font-mono">
              <span>Target: Minimum {minWords} words</span>
              <span>{progressPercent}% completed</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded overflow-hidden">
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
