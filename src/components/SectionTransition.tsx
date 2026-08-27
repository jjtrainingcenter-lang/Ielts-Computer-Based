import React from 'react';
import { TestSection } from '../types';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface SectionTransitionProps {
  completedSection: TestSection;
  nextSection: TestSection | 'submit';
  onContinue: () => void;
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({ completedSection, nextSection, onContinue }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8 h-full w-full absolute inset-0 z-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
            {completedSection} Completed
          </h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed font-medium">
            Your answers have been securely saved.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-center space-x-3">
          <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Next:</span>
          <span className="text-slate-900 text-sm font-bold capitalize">
            {nextSection === 'submit' ? 'Review & Submit' : nextSection}
          </span>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-center">
          <button
            onClick={onContinue}
            className="px-8 py-3 bg-[#214162] hover:bg-[#1a334e] text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center space-x-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
