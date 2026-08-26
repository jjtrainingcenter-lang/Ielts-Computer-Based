import React from 'react';
import { Candidate, IELTSTest } from '../types';
import { BookOpen, Headphones, FileEdit, Mic, Play, Clock, CheckCircle, ShieldCheck, User, LogOut, ArrowRight, Sparkles } from 'lucide-react';

interface CandidateTestSelectionProps {
  candidate: Candidate;
  availableTests: IELTSTest[];
  onSelectTest: (test: IELTSTest) => void;
  onLogout: () => void;
}

export const CandidateTestSelection: React.FC<CandidateTestSelectionProps> = ({
  candidate,
  availableTests,
  onSelectTest,
  onLogout
}) => {
  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col font-sans select-none">
      {/* Top Banner / Header */}
      <header className="bg-[#214162] text-white px-6 py-4 flex items-center justify-between border-b border-[#17304a] shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded bg-white text-[#214162] font-black text-lg flex items-center justify-center shadow-xs">
            JJ
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">JJ ACADEMY</h1>
              <span className="bg-blue-500/30 text-blue-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-blue-400/30 uppercase tracking-widest">
                Candidate CBT Portal
              </span>
            </div>
            <p className="text-xs text-blue-200">Official Computer-Delivered IELTS Testing System</p>
          </div>
        </div>

        {/* Candidate Info Badge & Logout */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 bg-[#17304a] px-4 py-2 rounded-lg border border-blue-400/20">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-white leading-tight">{candidate.name}</p>
              <p className="font-mono text-blue-300">Reg #: <span className="font-bold text-yellow-300">{candidate.id}</span></p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold text-gray-200 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Candidate Welcome Banner */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-1 border border-blue-100">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Identity Verified</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Welcome, {candidate.name}!
            </h2>
            <p className="text-sm text-slate-600">
              The following IELTS examinations and mock tests are currently assigned to your 6-digit Registration ID (<span className="font-mono font-bold text-blue-800">{candidate.id}</span>).
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 shrink-0">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Tests</span>
              <span className="text-base font-bold text-slate-900">{availableTests.length}</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Birth</span>
              <span className="font-mono text-slate-800">{candidate.dob}</span>
            </div>
          </div>
        </div>

        {/* Tests Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide text-xs">
              Available Tests to Write ({availableTests.length})
            </h3>
            <span className="text-xs text-slate-500">
              Select any assigned test to begin
            </span>
          </div>

          {availableTests.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">No Tests Currently Assigned</h4>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                There are no active tests assigned to Registration ID #{candidate.id}. Please contact the test administrator at JJ Academy to assign your examination.
              </p>
              <button
                onClick={onLogout}
                className="mt-2 inline-flex items-center space-x-2 px-4 py-2 bg-[#214162] text-white rounded text-xs font-bold hover:bg-[#1a334e]"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {availableTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-blue-300"
                >
                  <div className="p-6 space-y-4">
                    {/* Header: Module badge & sections count */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        test.module === 'general'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        IELTS {test.module === 'general' ? 'General Training' : 'Academic'}
                      </span>
                      <span className="flex items-center space-x-1 text-xs text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Approx. 2 hrs 45 mins</span>
                      </span>
                    </div>

                    {/* Test Title & Description */}
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {test.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {test.description || 'Complete official IELTS Computer-Delivered simulation test covering Listening, Reading, Writing, and Speaking modules.'}
                      </p>
                    </div>

                    {/* Test Modules Breakdown Pills with Section Timers */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {(() => {
                        const timers = {
                          listening: candidate.customTimers?.listening ?? test.sectionTimers?.listening ?? 30,
                          reading: candidate.customTimers?.reading ?? test.sectionTimers?.reading ?? 60,
                          writing: candidate.customTimers?.writing ?? test.sectionTimers?.writing ?? 60,
                          speaking: candidate.customTimers?.speaking ?? test.sectionTimers?.speaking ?? 14,
                        };
                        return (
                          <>
                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 text-xs text-slate-700">
                              <div className="flex items-center space-x-1.5 truncate">
                                <Headphones className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span className="truncate">Listening</span>
                              </div>
                              <span className="font-mono font-bold text-[11px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{timers.listening}m</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 text-xs text-slate-700">
                              <div className="flex items-center space-x-1.5 truncate">
                                <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span className="truncate">Reading</span>
                              </div>
                              <span className="font-mono font-bold text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{timers.reading}m</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 text-xs text-slate-700">
                              <div className="flex items-center space-x-1.5 truncate">
                                <FileEdit className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span className="truncate">Writing</span>
                              </div>
                              <span className="font-mono font-bold text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">{timers.writing}m</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 text-xs text-slate-700">
                              <div className="flex items-center space-x-1.5 truncate">
                                <Mic className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                <span className="truncate">Speaking</span>
                              </div>
                              <span className="font-mono font-bold text-[11px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">{timers.speaking}m</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] font-mono text-slate-400">
                      ID: {test.id}
                    </div>

                    <button
                      onClick={() => onSelectTest(test)}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm group-hover:bg-blue-700 transition-colors"
                    >
                      <span>Take Test</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
