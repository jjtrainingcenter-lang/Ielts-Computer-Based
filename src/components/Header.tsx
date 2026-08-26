import React from 'react';
import { Wifi, Bell, Clock, Settings, HelpCircle, Eye, EyeOff, Headphones, BookOpen, FileEdit, Mic } from 'lucide-react';
import { TestSection } from '../types';

interface HeaderProps {
  candidateName: string;
  candidateId: string;
  timeRemainingSeconds?: number;
  activeSection?: TestSection;
  timerBadgeText?: string;
  showTimer?: boolean;
  onToggleTimer?: () => void;
  onAdminClick?: () => void;
  onFinishTest?: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  candidateName,
  candidateId,
  timeRemainingSeconds,
  activeSection,
  timerBadgeText,
  showTimer = true,
  onToggleTimer,
  onAdminClick,
  onFinishTest,
  onOpenSettings,
  onOpenHelp,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isLowTime = typeof timeRemainingSeconds === 'number' && timeRemainingSeconds < 300; // < 5 mins

  const getSectionIcon = () => {
    switch (activeSection) {
      case 'listening': return <Headphones className="w-3.5 h-3.5 text-indigo-600" />;
      case 'reading': return <BookOpen className="w-3.5 h-3.5 text-emerald-600" />;
      case 'writing': return <FileEdit className="w-3.5 h-3.5 text-amber-600" />;
      case 'speaking': return <Mic className="w-3.5 h-3.5 text-purple-600" />;
      default: return <Clock className="w-3.5 h-3.5 text-gray-600" />;
    }
  };

  const getSectionLabel = () => {
    switch (activeSection) {
      case 'listening': return 'Listening Part';
      case 'reading': return 'Reading Part';
      case 'writing': return 'Writing Part';
      case 'speaking': return 'Speaking Part';
      default: return 'Exam Timer';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 select-none sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Brand Logo & Test Taker Info */}
        <div className="flex items-center space-x-6">
          <div className="flex items-start text-red-600">
            <span className="font-extrabold text-3xl tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>IELTS</span>
            <span className="text-[10px] mt-1 ml-0.5 font-bold">TM</span>
          </div>
          <div className="text-sm cursor-default flex flex-col justify-center border-l pl-5 border-gray-200">
            <span className="text-[11px] text-gray-500 font-medium leading-none mb-0.5">JJ ACADEMY CBT</span>
            <span className="font-bold text-black text-[13px] leading-tight">
              {candidateName || 'Candidate'} {candidateId ? `· ID: ${candidateId}` : ''}
            </span>
          </div>
        </div>

        {/* Center: Real-time Section Countdown Timer */}
        {typeof timeRemainingSeconds === 'number' && (
          <div className="flex items-center space-x-2.5">
            <div className={`flex items-center space-x-2 border px-3.5 py-1.5 rounded-lg shadow-xs ${
              isLowTime ? 'bg-red-50 border-red-300 animate-pulse' : 'bg-slate-50 border-slate-200'
            }`}>
              {getSectionIcon()}
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 hidden sm:inline">
                {getSectionLabel()}:
              </span>
              {showTimer ? (
                <span className={`font-mono text-base font-bold tracking-wider ${isLowTime ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemainingSeconds)} <span className="text-xs font-normal text-gray-500 font-sans">left</span>
                </span>
              ) : (
                <span className="text-xs text-gray-500 font-medium">Timer hidden</span>
              )}
              {onToggleTimer && (
                <button
                  type="button"
                  onClick={onToggleTimer}
                  title={showTimer ? "Hide timer" : "Show timer"}
                  className="ml-1 text-gray-400 hover:text-gray-700 transition-colors p-0.5"
                >
                  {showTimer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {timerBadgeText && (
              <span className="hidden md:inline-flex items-center text-[10px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
                ⏱️ {timerBadgeText}
              </span>
            )}
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center space-x-4 text-black">
          {onOpenHelp && (
            <button
              type="button"
              onClick={onOpenHelp}
              title="Help & Instructions"
              className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          )}

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              title="Display & Contrast Settings"
              className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center space-x-3 text-gray-600 pl-1">
            <span title="Connected"><Wifi className="w-4 h-4 text-green-600" /></span>
            <span title="Notifications"><Bell className="w-4 h-4" /></span>
          </div>

          {onAdminClick && (
            <button
              type="button"
              onClick={onAdminClick}
              className="text-xs font-semibold text-gray-500 hover:text-black px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            >
              Admin
            </button>
          )}

          {onFinishTest && (
            <button
              onClick={onFinishTest}
              className="ml-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded shadow transition-colors"
            >
              Finish Test
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

