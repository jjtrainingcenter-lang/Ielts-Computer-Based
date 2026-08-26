import React from 'react';
import { ArrowLeft, Play, ShieldCheck, Clock, BookOpen, Headphones, FileEdit, Mic, Sparkles } from 'lucide-react';
import { IELTSSectionTimers } from '../types';

interface CandidateInstructionsProps {
  candidateName: string;
  candidateId: string;
  testTitle?: string;
  testModule?: 'academic' | 'general';
  sectionTimers?: IELTSSectionTimers;
  timerBadgeText?: string;
  hasMultipleTests?: boolean;
  onBackToSelection?: () => void;
  onStart: () => void;
}

export const CandidateInstructions: React.FC<CandidateInstructionsProps> = ({
  candidateName,
  candidateId,
  testTitle = 'IELTS Academic Practice Test',
  testModule = 'academic',
  sectionTimers = { listening: 30, reading: 60, writing: 60, speaking: 14 },
  timerBadgeText,
  hasMultipleTests = false,
  onBackToSelection,
  onStart,
}) => {
  const totalMinutes = sectionTimers.listening + sectionTimers.reading + sectionTimers.writing + sectionTimers.speaking;

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center p-4 font-sans select-none">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-3xl border-t-8 border-[#214162]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-[#214162] text-white flex items-center justify-center font-black text-xl shadow-md">
              JJ
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#214162] tracking-tight">JJ ACADEMY</h1>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Official Computer-Delivered Examination
              </p>
            </div>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Candidate</span>
          </div>
        </div>

        {/* Selected Test Information Banner */}
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                testModule === 'general' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-200 text-blue-900 border border-blue-300'
              }`}>
                IELTS {testModule === 'general' ? 'General Training' : 'Academic'}
              </span>
              <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Total Time: {Math.floor(totalMinutes / 60)}h {totalMinutes % 60 > 0 ? `${totalMinutes % 60}m` : ''}</span>
              </span>
              {timerBadgeText && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>{timerBadgeText}</span>
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900">{testTitle}</h2>
          </div>

          {hasMultipleTests && onBackToSelection && (
            <button
              onClick={onBackToSelection}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 shrink-0 self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Selected Test</span>
            </button>
          )}
        </div>

        {/* IELTS Part Timers Card */}
        <div className="mb-6 border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>IELTS Part Timers (Configured Timing)</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Auto-timed per module</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center shadow-xs">
              <div className="flex items-center justify-center space-x-1 text-indigo-700 mb-0.5">
                <Headphones className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Listening</span>
              </div>
              <p className="text-base font-black text-slate-900 font-mono">{sectionTimers.listening} <span className="text-[10px] font-normal text-slate-500">mins</span></p>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center shadow-xs">
              <div className="flex items-center justify-center space-x-1 text-emerald-700 mb-0.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Reading</span>
              </div>
              <p className="text-base font-black text-slate-900 font-mono">{sectionTimers.reading} <span className="text-[10px] font-normal text-slate-500">mins</span></p>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center shadow-xs">
              <div className="flex items-center justify-center space-x-1 text-amber-700 mb-0.5">
                <FileEdit className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Writing</span>
              </div>
              <p className="text-base font-black text-slate-900 font-mono">{sectionTimers.writing} <span className="text-[10px] font-normal text-slate-500">mins</span></p>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center shadow-xs">
              <div className="flex items-center justify-center space-x-1 text-purple-700 mb-0.5">
                <Mic className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Speaking</span>
              </div>
              <p className="text-base font-black text-slate-900 font-mono">{sectionTimers.speaking} <span className="text-[10px] font-normal text-slate-500">mins</span></p>
            </div>
          </div>
        </div>

        {/* Candidate Details Card */}
        <div className="mb-6 border border-slate-200 rounded-xl p-5 bg-slate-50 text-xs">
          <h3 className="font-bold text-sm mb-3 text-slate-900 uppercase tracking-wider">
            Candidate Identity Confirmation
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 font-semibold mb-0.5 uppercase text-[10px]">Candidate Full Name</p>
              <p className="font-bold text-base text-slate-900">{candidateName}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold mb-0.5 uppercase text-[10px]">6-Digit Registration ID</p>
              <p className="font-mono font-bold text-base text-blue-900">{candidateId}</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-800" />
            <span>Standard CBT Exam Instructions</span>
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <li>Answer all questions across all 4 modules (Listening, Reading, Writing, Speaking).</li>
            <li>Each module timer counts down independently according to official IELTS part guidelines.</li>
            <li>You can navigate between questions and change your answers at any time during the active section.</li>
            <li>Highlight passage text or take notes using the built-in highlighter toolbar.</li>
            <li>Your answers and timer are continuously saved. Do not close or refresh the test window.</li>
            <li>When you have reviewed all answers, click <strong>"Finish Test"</strong> to submit your score.</li>
          </ul>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-200">
          {hasMultipleTests && onBackToSelection ? (
            <button
              onClick={onBackToSelection}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Assigned Tests</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onStart}
            className="bg-[#214162] hover:bg-[#1a334e] text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition-all text-sm flex items-center space-x-2"
          >
            <span>Start Test Now</span>
            <Play className="w-4 h-4 fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
};


