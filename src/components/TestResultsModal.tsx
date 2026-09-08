import React, { useState } from 'react';
import { IELTSTest, WritingEvaluation, SpeakingEvaluation } from '../types';
import { Award, CheckCircle2, XCircle, FileText, Sparkles, Download, RotateCcw, ChevronDown, ChevronUp, Printer } from 'lucide-react';

interface TestResultsModalProps {
  isOpen: boolean;
  test: IELTSTest;
  userAnswers: Record<string, string>;
  writingTask1: string;
  writingTask2: string;
  writingEvaluation?: WritingEvaluation | null;
  speakingEvaluation?: SpeakingEvaluation | null;
  onClose: () => void;
  onRestartTest: () => void;
}

export const TestResultsModal: React.FC<TestResultsModalProps> = ({
  isOpen,
  test,
  userAnswers,
  writingTask1,
  writingTask2,
  writingEvaluation,
  speakingEvaluation,
  onClose,
  onRestartTest,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'listening' | 'reading' | 'writing' | 'trf'>('summary');
  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(null);

  if (!isOpen) return null;

  // Helper for scoring
  const checkCorrect = (q: any, userAns: string) => {
    if (!userAns || !q.correctAnswer) return false;
    const cAnsArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : q.correctAnswer.split('|');
    if (q.type === 'multiple-response') {
      const uSet = userAns.split('|').map(s => s.trim().toLowerCase()).sort();
      const cSet = cAnsArr.map((s: string) => s.trim().toLowerCase()).sort();
      return uSet.join('|') === cSet.join('|') && uSet.length > 0;
    } else {
      const validAnswers = cAnsArr.map((s: string) => s.trim().toLowerCase());
      return validAnswers.includes(userAns.trim().toLowerCase());
    }
  };

  // Calculate Listening Score & Band
  const listeningScore = (test.listeningQuestions || []).reduce((acc, q) => {
    return checkCorrect(q, userAnswers[q.id]) ? acc + 1 : acc;
  }, 0);

  // Calculate Reading Score & Band
  const readingScore = (test.readingQuestions || []).reduce((acc, q) => {
    return checkCorrect(q, userAnswers[q.id]) ? acc + 1 : acc;
  }, 0);

  // Score to IELTS Band Conversion Table (Academic)
  const getBandFromScore = (score: number, total: number = 40): number => {
    const ratio = score / total;
    if (ratio >= 0.95) return 9.0;
    if (ratio >= 0.88) return 8.5;
    if (ratio >= 0.82) return 8.0;
    if (ratio >= 0.75) return 7.5;
    if (ratio >= 0.68) return 7.0;
    if (ratio >= 0.58) return 6.5;
    if (ratio >= 0.48) return 6.0;
    if (ratio >= 0.38) return 5.5;
    if (ratio >= 0.28) return 5.0;
    return 4.5;
  };

  const listeningTotal = (test.listeningQuestions || []).length;
  const readingTotal = (test.readingQuestions || []).length;
  const listeningBand = getBandFromScore(listeningScore, listeningTotal || 40);
  const readingBand = getBandFromScore(readingScore, readingTotal || 40);
  const writingBand = writingEvaluation?.overallWritingBand || 7.0;
  const speakingBand = speakingEvaluation?.speakingBand || 7.0;

  // Overall Band Score calculation (average rounded to nearest 0.5)
  const rawOverall = (listeningBand + readingBand + writingBand + speakingBand) / 4;
  const overallBand = Math.round(rawOverall * 2) / 2;

  const handlePrintTRF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded max-w-4xl w-full shadow-2xl border border-gray-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-[#214162] text-white px-6 py-4 flex items-center justify-between border-b border-[#1a334e]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-white text-[#214162] flex items-center justify-center font-black text-lg shadow-md">
              JJ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                  JJ ACADEMY TEST CENTER
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  TEST COMPLETED
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">{test.title}</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrintTRF}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded border border-white/20 transition-colors flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-blue-200" />
              <span>Print TRF</span>
            </button>
            <button
              type="button"
              onClick={onRestartTest}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Test</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 px-6 py-2 bg-gray-100 border-b border-gray-300 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'summary', label: '📊 Band Score Summary' },
            { id: 'listening', label: `🎧 Listening (${listeningScore}/${listeningTotal})` },
            { id: 'reading', label: `📖 Reading (${readingScore}/${readingTotal})` },
            { id: 'writing', label: '✍️ Writing AI Feedback' },
            { id: 'trf', label: '📜 Official Test Report Form' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded transition-all ${
                activeTab === tab.id
                  ? 'bg-[#214162] text-white shadow-xs font-bold'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Overall Band Hero Card */}
              <div className="p-6 bg-[#214162] text-white rounded border border-[#1a334e] shadow-md flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div className="space-y-2">
                  <span className="px-3 py-0.5 bg-white/10 text-blue-200 border border-white/20 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest inline-block">
                    OFFICIAL OVERALL BAND SCORE
                  </span>
                  <h3 className="text-xl font-bold text-white">JJ Academy IELTS Computer Based Test</h3>
                  <p className="text-xs text-gray-200 max-w-md">
                    Congratulations! Your test performance has been processed according to official IELTS band score criteria.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-5 bg-[#1a334e] rounded border border-white/20 min-w-[150px]">
                  <span className="text-4xl font-black text-amber-400 font-mono tracking-tight">
                    {overallBand.toFixed(1)}
                  </span>
                  <span className="text-[10px] font-bold text-blue-200 mt-1 uppercase tracking-widest">
                    CEFR Level C1/C2
                  </span>
                </div>
              </div>

              {/* 4 Module Scores Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded border border-gray-200 text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Listening</span>
                  <p className="text-2xl font-black font-mono text-[#214162]">
                    {listeningBand.toFixed(1)}
                  </p>
                  <p className="text-[11px] text-gray-500">Raw: {listeningScore} / 40</p>
                </div>

                <div className="p-4 bg-gray-50 rounded border border-gray-200 text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Reading</span>
                  <p className="text-2xl font-black font-mono text-[#214162]">
                    {readingBand.toFixed(1)}
                  </p>
                  <p className="text-[11px] text-gray-500">Raw: {readingScore} / 40</p>
                </div>

                <div className="p-4 bg-gray-50 rounded border border-gray-200 text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Writing</span>
                  <p className="text-2xl font-black font-mono text-[#214162]">
                    {writingBand.toFixed(1)}
                  </p>
                  <p className="text-[11px] text-gray-500">Task 1 & Task 2</p>
                </div>

                <div className="p-4 bg-gray-50 rounded border border-gray-200 text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Speaking</span>
                  <p className="text-2xl font-black font-mono text-[#214162]">
                    {speakingBand.toFixed(1)}
                  </p>
                  <p className="text-[11px] text-gray-500">Parts 1, 2, & 3</p>
                </div>
              </div>
            </div>
          )}

          {/* Listening Review */}
          {activeTab === 'listening' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900">
                Listening Section Question Answers
              </h3>
              <div className="space-y-3">
                {(test.listeningQuestions || []).map((q) => {
                  const uAns = userAnswers[q.id] || '(No Answer)';
                  const isCorrect = checkCorrect(q, uAns);
                  const isExp = expandedExplanation === q.id;

                  return (
                    <div
                      key={q.id}
                      className="p-4 bg-gray-50 rounded border border-gray-200 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-3">
                          <span className="w-6 h-6 rounded bg-[#214162] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {q.questionNumber}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900 text-xs">
                              {q.questionText}
                            </p>
                            <div className="flex items-center space-x-4 mt-1.5 font-mono">
                              <span className="text-gray-500">
                                Your Answer:{' '}
                                <strong className={isCorrect ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                                  {uAns}
                                </strong>
                              </span>
                              <span className="text-gray-500">
                                Correct Answer: <strong className="text-gray-900">{Array.isArray(q.correctAnswer) ? q.correctAnswer.join(", ") : q.correctAnswer}</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isCorrect ? (
                            <span className="flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> <span>Correct</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-red-700 font-bold bg-red-50 px-2.5 py-1 rounded border border-red-200">
                              <XCircle className="w-3.5 h-3.5" /> <span>Incorrect</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setExpandedExplanation(isExp ? null : q.id)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {isExp && (
                        <p className="mt-2 pt-2 border-t border-gray-200 text-gray-600 italic">
                          💡 Explanation: {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reading Review */}
          {activeTab === 'reading' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900">
                Reading Section Question Answers
              </h3>
              <div className="space-y-3">
                {(test.readingQuestions || []).map((q) => {
                  const uAns = userAnswers[q.id] || '(No Answer)';
                  const isCorrect = checkCorrect(q, uAns);
                  const isExp = expandedExplanation === q.id;

                  return (
                    <div
                      key={q.id}
                      className="p-4 bg-gray-50 rounded border border-gray-200 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-3">
                          <span className="w-6 h-6 rounded bg-[#214162] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {q.questionNumber}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900 text-xs">
                              {q.questionText}
                            </p>
                            <div className="flex items-center space-x-4 mt-1.5 font-mono">
                              <span className="text-gray-500">
                                Your Answer:{' '}
                                <strong className={isCorrect ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                                  {uAns}
                                </strong>
                              </span>
                              <span className="text-gray-500">
                                Correct Answer: <strong className="text-gray-900">{Array.isArray(q.correctAnswer) ? q.correctAnswer.join(", ") : q.correctAnswer}</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isCorrect ? (
                            <span className="flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> <span>Correct</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-red-700 font-bold bg-red-50 px-2.5 py-1 rounded border border-red-200">
                              <XCircle className="w-3.5 h-3.5" /> <span>Incorrect</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setExpandedExplanation(isExp ? null : q.id)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {isExp && (
                        <p className="mt-2 pt-2 border-t border-gray-200 text-gray-600 italic">
                          💡 Explanation: {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Writing AI Evaluation Tab */}
          {activeTab === 'writing' && (
            <div className="space-y-6">
              {writingEvaluation ? (
                <div className="space-y-6">
                  <div className="p-6 bg-[#214162] text-white rounded border border-[#1a334e] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#1a334e] pb-4">
                      <div>
                        <span className="text-xs font-mono text-blue-200 uppercase font-bold tracking-widest">
                          Official Examiner Feedback
                        </span>
                        <h3 className="text-base font-bold text-white">Writing Band Score Evaluation</h3>
                      </div>
                      <span className="text-3xl font-black font-mono text-amber-400">
                        Band {writingEvaluation.overallWritingBand.toFixed(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-[#1a334e] rounded border border-white/10">
                        <span className="text-gray-300 block">Task Achievement</span>
                        <strong className="text-base text-white font-mono">
                          {writingEvaluation.criteriaScores.taskAchievement.score.toFixed(1)}
                        </strong>
                      </div>
                      <div className="p-3 bg-[#1a334e] rounded border border-white/10">
                        <span className="text-gray-300 block">Coherence & Cohesion</span>
                        <strong className="text-base text-white font-mono">
                          {writingEvaluation.criteriaScores.coherenceCohesion.score.toFixed(1)}
                        </strong>
                      </div>
                      <div className="p-3 bg-[#1a334e] rounded border border-white/10">
                        <span className="text-gray-300 block">Lexical Resource</span>
                        <strong className="text-base text-white font-mono">
                          {writingEvaluation.criteriaScores.lexicalResource.score.toFixed(1)}
                        </strong>
                      </div>
                      <div className="p-3 bg-[#1a334e] rounded border border-white/10">
                        <span className="text-gray-300 block">Grammatical Range</span>
                        <strong className="text-base text-white font-mono">
                          {writingEvaluation.criteriaScores.grammaticalAccuracy.score.toFixed(1)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-5 bg-emerald-50 rounded border border-emerald-200 space-y-2">
                      <h4 className="font-bold text-emerald-900 text-xs">
                        ✅ Key Strengths
                      </h4>
                      <ul className="space-y-1 list-disc pl-4 text-emerald-800">
                        {writingEvaluation.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-5 bg-amber-50 rounded border border-amber-200 space-y-2">
                      <h4 className="font-bold text-amber-900 text-xs">
                        ⚠️ Recommendations for Improvement
                      </h4>
                      <ul className="space-y-1 list-disc pl-4 text-amber-800">
                        {writingEvaluation.improvements.map((imp, i) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <Sparkles className="w-10 h-10 text-blue-600 mx-auto animate-pulse" />
                  <h4 className="text-sm font-bold text-gray-900">
                    Writing Essays Submitted
                  </h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Click the "AI Band Score" button in the writing editor or summary screen to generate instant examiner grading.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Test Report Form (TRF) Printable Certificate View */}
          {activeTab === 'trf' && (
            <div className="p-8 bg-amber-50/40 rounded border-2 border-[#214162]/30 text-gray-900 space-y-6 shadow-md print:p-0 font-serif">
              {/* TRF Header */}
              <div className="flex justify-between items-start border-b-2 border-[#214162] pb-6">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-wider text-[#214162]">
                    JJ ACADEMY - IELTS TEST REPORT FORM
                  </h1>
                  <p className="text-xs text-gray-600 font-sans mt-0.5">
                    Official Computer Based Test Verification Record
                  </p>
                </div>
                <div className="text-right font-sans text-xs">
                  <p className="font-bold text-[#214162]">Center Number: JJ-9842</p>
                  <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Candidate Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans text-xs bg-white p-4 rounded border border-gray-200">
                <div>
                  <span className="text-gray-500 block uppercase text-[10px] font-bold tracking-widest">Candidate Name</span>
                  <strong className="text-gray-900 font-semibold">Student Candidate</strong>
                </div>
                <div>
                  <span className="text-gray-500 block uppercase text-[10px] font-bold tracking-widest">Candidate ID</span>
                  <strong className="font-mono text-gray-900">JJ-2026-8839</strong>
                </div>
                <div>
                  <span className="text-gray-500 block uppercase text-[10px] font-bold tracking-widest">Test Scheme</span>
                  <strong className="capitalize text-gray-900">{test.module} Module</strong>
                </div>
                <div>
                  <span className="text-gray-500 block uppercase text-[10px] font-bold tracking-widest">Administrator</span>
                  <strong className="text-gray-900">JJ Academy Exam Board</strong>
                </div>
              </div>

              {/* Band Score Table */}
              <div className="space-y-2 font-sans">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Official Test Results</h4>
                <div className="grid grid-cols-5 text-center font-mono border-2 border-[#214162] rounded overflow-hidden bg-white">
                  <div className="p-3 border-r border-gray-200">
                    <span className="text-[10px] text-gray-500 uppercase block font-sans font-bold">Listening</span>
                    <strong className="text-xl text-[#214162]">{listeningBand.toFixed(1)}</strong>
                  </div>
                  <div className="p-3 border-r border-gray-200">
                    <span className="text-[10px] text-gray-500 uppercase block font-sans font-bold">Reading</span>
                    <strong className="text-xl text-[#214162]">{readingBand.toFixed(1)}</strong>
                  </div>
                  <div className="p-3 border-r border-gray-200">
                    <span className="text-[10px] text-gray-500 uppercase block font-sans font-bold">Writing</span>
                    <strong className="text-xl text-[#214162]">{writingBand.toFixed(1)}</strong>
                  </div>
                  <div className="p-3 border-r border-gray-200">
                    <span className="text-[10px] text-gray-500 uppercase block font-sans font-bold">Speaking</span>
                    <strong className="text-xl text-[#214162]">{speakingBand.toFixed(1)}</strong>
                  </div>
                  <div className="p-3 bg-[#214162] text-white">
                    <span className="text-[10px] text-blue-200 uppercase block font-sans font-bold">Overall Band</span>
                    <strong className="text-2xl text-amber-400 font-bold">{overallBand.toFixed(1)}</strong>
                  </div>
                </div>
              </div>

              {/* Seal & Validation */}
              <div className="pt-6 border-t border-gray-300 flex items-center justify-between font-sans text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full border-2 border-amber-600 text-amber-600 flex items-center justify-center font-extrabold text-[9px]">
                    JJ SEAL
                  </div>
                  <span className="text-gray-500">Digitally authenticated by JJ Academy Test Service</span>
                </div>
                <span className="font-mono text-gray-400">TRF No: 26JJ883901AC</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
