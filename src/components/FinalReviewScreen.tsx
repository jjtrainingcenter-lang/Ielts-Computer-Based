import React from 'react';
import { IELTSTest, TestSection } from '../types';
import { ClipboardCheck, ListChecks, CheckCircle2, Clock } from 'lucide-react';

interface FinalReviewScreenProps {
  currentTest: IELTSTest;
  userAnswers: Record<string, string>;
  flaggedQuestions: Record<string, boolean>;
  writingTask1: string;
  writingTask2: string;
  onReviewSection: (section: TestSection) => void;
  onSubmit: () => void;
}

export const FinalReviewScreen: React.FC<FinalReviewScreenProps> = ({
  currentTest,
  userAnswers,
  flaggedQuestions,
  writingTask1,
  writingTask2,
  onReviewSection,
  onSubmit
}) => {
  const getListeningStats = () => {
    let answered = 0, flagged = 0;
    currentTest.listeningQuestions.forEach(q => {
      if (userAnswers[q.id]?.trim()) answered++;
      if (flaggedQuestions[q.id]) flagged++;
    });
    return { answered, total: currentTest.listeningQuestions.length, flagged };
  };

  const getReadingStats = () => {
    let answered = 0, flagged = 0;
    currentTest.readingQuestions.forEach(q => {
      if (userAnswers[q.id]?.trim()) answered++;
      if (flaggedQuestions[q.id]) flagged++;
    });
    return { answered, total: currentTest.readingQuestions.length, flagged };
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const ls = getListeningStats();
  const rs = getReadingStats();
  const w1Count = getWordCount(writingTask1);
  const w2Count = getWordCount(writingTask2);

  const [isConfirming, setIsConfirming] = React.useState(false);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden h-full w-full absolute inset-0 z-50">
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-blue-600" />
          Test Review
        </h1>
        <div className="flex items-center space-x-2 text-slate-500 text-sm font-semibold">
          <Clock className="w-4 h-4" />
          <span>Timer Paused</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <p className="text-slate-600 text-sm mb-4">
            Review your progress below. You can return to any section to review or change your answers before final submission.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Listening */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-900 text-lg">Listening</h3>
                {ls.answered === ls.total && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              </div>
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-600">Answered</span>
                  <span className="font-bold text-slate-900">{ls.answered} / {ls.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Unanswered</span>
                  <span className="font-bold text-amber-600">{ls.total - ls.answered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Marked for Review</span>
                  <span className="font-bold text-blue-600">{ls.flagged}</span>
                </div>
              </div>
            </div>

            {/* Reading */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-900 text-lg">Reading</h3>
                {rs.answered === rs.total && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              </div>
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-600">Answered</span>
                  <span className="font-bold text-slate-900">{rs.answered} / {rs.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Unanswered</span>
                  <span className="font-bold text-amber-600">{rs.total - rs.answered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Marked for Review</span>
                  <span className="font-bold text-blue-600">{rs.flagged}</span>
                </div>
              </div>
            </div>

            {/* Writing */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm md:col-span-2">
              <h3 className="font-bold text-slate-900 text-lg mb-4">Writing</h3>
              <div className="grid sm:grid-cols-2 gap-6 text-sm mb-6">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="block text-slate-500 font-semibold mb-1">Task 1</span>
                  <span className={`font-bold ${w1Count >= 150 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {w1Count} words
                  </span>
                  {w1Count < 150 && <span className="text-xs text-amber-600 block mt-1">(Minimum 150 recommended)</span>}
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="block text-slate-500 font-semibold mb-1">Task 2</span>
                  <span className={`font-bold ${w2Count >= 250 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {w2Count} words
                  </span>
                  {w2Count < 250 && <span className="text-xs text-amber-600 block mt-1">(Minimum 250 recommended)</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-slate-200 p-6 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            {isConfirming && (
              <p className="text-amber-600 font-bold text-sm flex items-center gap-2">
                Once submitted, you cannot change your answers.
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {isConfirming ? (
              <>
                <button
                  onClick={() => setIsConfirming(false)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={onSubmit}
                  className="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center space-x-2"
                >
                  <span>Confirm Submission</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsConfirming(true)}
                className="px-8 py-3 bg-[#214162] hover:bg-[#1a334e] text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center space-x-2"
              >
                <span>Submit Test</span>
                <ListChecks className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
