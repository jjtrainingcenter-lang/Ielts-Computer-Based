import React from 'react';
import { AlertTriangle, LogOut, ArrowLeft, ShieldAlert } from 'lucide-react';
import { TestSection } from '../types';

interface VoluntaryLogoutModalProps {
  isOpen: boolean;
  candidateName: string;
  candidateId: string;
  testTitle?: string;
  activeSection?: TestSection;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const VoluntaryLogoutModal: React.FC<VoluntaryLogoutModalProps> = ({
  isOpen,
  candidateName,
  candidateId,
  testTitle = 'IELTS Practice Exam',
  activeSection = 'listening',
  onCancel,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-rose-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Danger Header */}
        <div className="bg-rose-50 border-b border-rose-100 p-6 flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-200 text-rose-900 mb-1">
              Important Exam Warning
            </span>
            <h3 className="text-lg font-black text-rose-950 tracking-tight leading-tight">
              Are you sure you want to log out?
            </h3>
            <p className="text-xs text-rose-700 mt-1 font-medium">
              Voluntary log out will permanently terminate your active test session.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Candidate / Test Context */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Candidate:</span>
              <span className="font-bold text-slate-800">{candidateName} {candidateId ? `(#${candidateId})` : ''}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Exam:</span>
              <span className="font-bold text-slate-800 truncate max-w-[240px]">{testTitle}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Current Section:</span>
              <span className="font-bold text-indigo-700 capitalize">{activeSection}</span>
            </div>
          </div>

          {/* Strict Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-amber-900 font-black">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Consequences of Voluntary Log Out:</span>
            </div>
            <ul className="space-y-1.5 text-amber-900/90 pl-5 list-disc font-medium leading-relaxed">
              <li>
                <strong>You cannot continue from where you left off.</strong> Your exam will be stopped immediately.
              </li>
              <li>
                Your current responses up to this point will be finalized and submitted as a <strong>Terminated (Voluntary Logout)</strong> attempt.
              </li>
              <li>
                You will not be allowed to restart or resume this test on your next login unless an instructor or administrator grants permission.
              </li>
            </ul>
          </div>

          <p className="text-xs text-slate-500 text-center font-medium">
            If you only need a quick break or experienced a minor computer glitch, please <strong>cancel</strong> and remain on your exam screen.
          </p>
        </div>

        {/* Actions Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Continue Writing Exam</span>
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>{isSubmitting ? 'Terminating Session...' : 'Yes, End Exam & Log Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
