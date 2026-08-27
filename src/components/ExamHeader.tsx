import React, { useEffect, useState } from 'react';
import { Settings, HelpCircle } from 'lucide-react';
import { TestSection } from '../types';

interface ExamHeaderProps {
  candidateName: string;
  candidateId: string;
  activeSection: TestSection;
  currentQuestionIndex: number;
  totalQuestions: number;
  deadline: number | null;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onTimeExpired: () => void;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
  candidateName,
  candidateId,
  activeSection,
  currentQuestionIndex,
  totalQuestions,
  deadline,
  onOpenSettings,
  onOpenHelp,
  onTimeExpired
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (!deadline) return;
    
    const updateTime = () => {
      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.floor((deadline - now) / 1000));
      setTimeRemaining(remainingSeconds);
      
      if (remainingSeconds === 0) {
        onTimeExpired();
      }
    };
    
    updateTime(); // initial
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [deadline, onTimeExpired]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isLowTime = timeRemaining > 0 && timeRemaining < 300; // < 5 mins

  return (
    <header className="bg-white border-b border-gray-300 select-none sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Left: Brand */}
        <div className="flex items-center space-x-6">
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 leading-none">JJ IELTS</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Training Center</span>
          </div>
          <div className="text-sm cursor-default flex flex-col justify-center border-l pl-5 border-gray-200">
            <span className="text-[11px] text-gray-500 font-medium leading-none mb-0.5">Candidate</span>
            <span className="font-bold text-black text-[13px] leading-tight">
              {candidateName} {candidateId ? `(#${candidateId})` : ''}
            </span>
          </div>
        </div>

        {/* Center: Section & Question Progress */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <div className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            {activeSection} SECTION
          </div>
          {totalQuestions > 0 && (
            <div className="text-xs text-slate-500 font-medium">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
          )}
        </div>

        {/* Right: Timer & Tools */}
        <div className="flex items-center space-x-5">
          {deadline && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase text-slate-500">Time remaining:</span>
              <span className={`font-mono text-xl font-bold tracking-wider ${isLowTime ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-2 border-l border-gray-200 pl-5">
            <button
              type="button"
              onClick={onOpenHelp}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Help</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
