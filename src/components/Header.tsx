import React from 'react';
import { TestSection, DisplaySettings } from '../types';
import { Clock, Eye, HelpCircle, GraduationCap, CheckCircle2, ChevronRight } from 'lucide-react';

interface HeaderProps {
  academyName?: string;
  candidateName: string;
  candidateId: string;
  testTitle: string;
  activeSection: TestSection;
  onSelectSection: (sec: TestSection) => void;
  timeRemainingSeconds: number;
  settings: DisplaySettings;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onFinishTest: () => void;
  answeredCount: number;
  totalQuestions: number;
}

export const Header: React.FC<HeaderProps> = ({
  academyName = 'JJ ACADEMY',
  candidateName,
  candidateId,
  testTitle,
  activeSection,
  onSelectSection,
  timeRemainingSeconds,
  settings,
  onOpenSettings,
  onOpenHelp,
  onFinishTest,
  answeredCount,
  totalQuestions,
}) => {
  // Format timer
  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = timeRemainingSeconds <= 600 && timeRemainingSeconds > 0; // 10 minutes left warning

  const sections: { id: TestSection; label: string }[] = [
    { id: 'listening', label: '1. Listening' },
    { id: 'reading', label: '2. Reading' },
    { id: 'writing', label: '3. Writing' },
    { id: 'speaking', label: '4. Speaking' },
  ];

  return (
    <header className="bg-[#214162] text-white border-b border-[#1a334e] shadow-md select-none sticky top-0 z-40">
      {/* Top Identity & Status Bar */}
      <div className="max-w-[1920px] mx-auto px-6 h-14 flex items-center justify-between gap-4 border-b border-white/10">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-4">
          <div className="bg-white p-1 rounded-sm shadow-xs shrink-0">
            <div className="text-[#214162] font-black text-xs px-1.5 py-0.5 tracking-tight">
              {academyName}
            </div>
          </div>
          <div className="h-6 w-px bg-white/20 hidden sm:block"></div>
          <div>
            <h1 className="text-sm font-medium text-white truncate max-w-xs md:max-w-lg">
              {testTitle}
            </h1>
          </div>
        </div>

        {/* Center: Countdown Timer */}
        {settings.showTimer && (
          <div className="flex items-center space-x-3">
            <div
              className={`flex flex-col items-end px-3 py-1 rounded border transition-colors ${
                isWarning
                  ? 'bg-red-600/90 border-red-400 text-white animate-pulse'
                  : 'bg-white/10 border-white/20 text-white'
              }`}
            >
              <span className="text-[10px] uppercase opacity-75 tracking-wider font-semibold">
                Time Left
              </span>
              <span className="text-lg font-mono font-bold leading-tight">{formattedTime}</span>
            </div>
          </div>
        )}

        {/* Right Controls & Candidate Badge */}
        <div className="flex items-center space-x-3">
          {/* Candidate Profile Pill */}
          <div className="hidden lg:flex flex-col items-end px-3 py-1 bg-white/10 rounded border border-white/20 text-xs">
            <span className="font-semibold text-white truncate max-w-[140px]">{candidateName}</span>
            <span className="text-[10px] font-mono opacity-75">ID: {candidateId}</span>
          </div>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded border border-white/20 text-xs font-medium transition-colors text-white"
            title="Display & Contrast Settings"
          >
            Settings
          </button>

          {/* Help Button */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded border border-white/20 text-xs font-medium transition-colors text-white"
            title="Test Instructions & Help"
          >
            Help
          </button>

          {/* Finish Test Button */}
          <button
            type="button"
            onClick={onFinishTest}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-bold text-white transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <span>Finish Test</span>
            <span className="text-[10px] bg-red-800/80 px-1.5 py-0.2 rounded font-mono">
              {answeredCount}/{totalQuestions}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Section Navigation Ribbon */}
      <div className="bg-[#1a334e] px-6 py-1 flex items-center justify-between text-xs overflow-x-auto">
        <div className="flex items-center space-x-1">
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectSection(sec.id)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all flex items-center space-x-1 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[10px] text-blue-200/70 hidden sm:block font-medium uppercase tracking-tight">
          High Density Computer Based Testing Interface
        </div>
      </div>
    </header>
  );
};
