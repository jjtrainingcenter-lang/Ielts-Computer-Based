import React, { useState, useEffect } from 'react';
import { TestSection } from '../types';
import { CheckCircle2, ArrowRight, Clock } from 'lucide-react';

interface SectionTransitionProps {
  completedSection: TestSection;
  nextSection: TestSection | 'submit';
  onContinue: () => void;
  isTimeExpired?: boolean;
  autoCountdown?: number;
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({
  completedSection,
  nextSection,
  onContinue,
  isTimeExpired = false,
  autoCountdown = 5,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(autoCountdown);

  useEffect(() => {
    // If autoCountdown is provided, count down and auto-proceed when it reaches 0
    if (secondsLeft <= 0) {
      onContinue();
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, onContinue]);

  const nextTitle = nextSection === 'submit' ? 'Submit Test & Finalize' : `${nextSection} Section`;

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-100/90 backdrop-blur-xs p-6 h-full w-full absolute inset-0 z-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 text-center space-y-6">
        <div
          className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            isTimeExpired ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
          }`}
        >
          {isTimeExpired ? <Clock className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
        </div>

        <div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-slate-100 text-slate-700">
            {isTimeExpired ? 'Time Expired • Section Closed' : 'Section Finished'}
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
            {completedSection} Ended
          </h2>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            {isTimeExpired
              ? `The time limit for the ${completedSection} section has ended. All your answers have been safely saved.`
              : `Your answers for the ${completedSection} section have been safely recorded.`}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider">Next Session</span>
            <span className="font-extrabold text-[#214162] capitalize text-sm">{nextTitle}</span>
          </div>
          {secondsLeft > 0 && (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>Automatically advancing in:</span>
              <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {secondsLeft}s
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
          <button
            onClick={onContinue}
            className="w-full py-3 bg-[#214162] hover:bg-[#1a334e] text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center space-x-2"
          >
            <span>{nextSection === 'submit' ? 'Submit Test Now' : `Start ${nextSection} Now`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-slate-400">
            You will not be able to return to the completed section once advanced.
          </span>
        </div>
      </div>
    </div>
  );
};
