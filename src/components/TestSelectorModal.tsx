import React, { useState } from 'react';
import { IELTSTest, TestSection } from '../types';
import { GraduationCap, Play, BookOpen, Headphones, FileEdit, Mic, Sparkles, Check, User, ShieldCheck } from 'lucide-react';

interface TestSelectorModalProps {
  isOpen: boolean;
  availableTests: IELTSTest[];
  onStartTest: (test: IELTSTest, candidateName: string, candidateId: string, initialSection?: TestSection) => void;
  onClose?: () => void;
}

export const TestSelectorModal: React.FC<TestSelectorModalProps> = ({
  isOpen,
  availableTests,
  onStartTest,
  onClose,
}) => {
  const [selectedTestId, setSelectedTestId] = useState(availableTests[0]?.id || 'jj-ielts-acad-01');
  const [candidateName, setCandidateName] = useState('John Doe');
  const [candidateId, setCandidateId] = useState('JJ-883920');
  const [selectedSection, setSelectedSection] = useState<TestSection | 'full'>('full');

  if (!isOpen) return null;

  const currentSelectedTest = availableTests.find((t) => t.id === selectedTestId) || availableTests[0];

  const handleLaunch = () => {
    const sec = selectedSection === 'full' ? 'listening' : selectedSection;
    onStartTest(currentSelectedTest, candidateName, candidateId, sec);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
      <div className="bg-white rounded max-w-2xl w-full shadow-2xl border border-gray-300 overflow-hidden">
        {/* Top Branding Banner */}
        <div className="bg-[#214162] text-white p-6 text-center space-y-2 relative border-b border-[#1a334e]">
          <div className="w-12 h-12 rounded bg-white text-[#214162] flex items-center justify-center font-black text-xl mx-auto shadow-md">
            JJ
          </div>
          <div>
            <span className="px-3 py-0.5 bg-white/10 text-blue-200 border border-white/20 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest inline-block">
              OFFICIAL IELTS COMPUTER BASED TEST PORTAL
            </span>
            <h2 className="text-xl font-bold text-white mt-1">JJ ACADEMY</h2>
            <p className="text-xs text-gray-200 max-w-md mx-auto">
              Exact Inspera-style simulation player for Academic & General Training IELTS Computer Based Tests.
            </p>
          </div>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-5">
          {/* Candidate Profile Setup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded border border-gray-200">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-1">
                Candidate Name
              </label>
              <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded border border-gray-300">
                <User className="w-4 h-4 text-[#214162]" />
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full text-xs font-semibold bg-transparent text-gray-900 focus:outline-none"
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-1">
                Candidate ID
              </label>
              <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded border border-gray-300">
                <ShieldCheck className="w-4 h-4 text-[#214162]" />
                <input
                  type="text"
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  className="w-full text-xs font-mono font-semibold bg-transparent text-gray-900 focus:outline-none"
                  placeholder="Enter candidate ID"
                />
              </div>
            </div>
          </div>

          {/* Test Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
              Select Practice Test Package
            </label>
            <div className="space-y-2">
              {availableTests.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTestId(t.id)}
                  className={`w-full p-3.5 rounded border text-left transition-all flex items-center justify-between ${
                    t.id === selectedTestId
                      ? 'border-blue-500 bg-blue-50 text-gray-900 font-medium'
                      : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-[#214162] text-white">
                        {t.module}
                      </span>
                      <h4 className="font-bold text-xs text-gray-900">{t.title}</h4>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Listening (40Q) • Reading (40Q) • Writing (Task 1 & 2) • Speaking (Parts 1-3)
                    </p>
                  </div>
                  {t.id === selectedTestId && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section Mode Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
              Test Mode
            </label>
            <div className="grid grid-cols-5 gap-2 text-xs">
              {[
                { id: 'full', label: 'Full Mock Test' },
                { id: 'listening', label: 'Listening' },
                { id: 'reading', label: 'Reading' },
                { id: 'writing', label: 'Writing' },
                { id: 'speaking', label: 'Speaking' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedSection(m.id as any)}
                  className={`py-2 px-1.5 rounded border text-center font-medium transition-all text-xs ${
                    selectedSection === m.id
                      ? 'border-[#214162] bg-[#214162] text-white font-bold'
                      : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Trigger */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={handleLaunch}
            className="px-6 py-2.5 bg-[#214162] hover:bg-[#2b547e] text-white font-bold text-xs rounded transition-all flex items-center space-x-2 shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Launch JJ Academy CBT Test</span>
          </button>
        </div>
      </div>
    </div>
  );
};
