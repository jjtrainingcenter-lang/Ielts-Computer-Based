import React from 'react';
import { DisplaySettings } from '../types';
import { Eye, Sun, Moon, Type, Volume2, Clock, Check, X } from 'lucide-react';

interface DisplaySettingsModalProps {
  isOpen: boolean;
  settings: DisplaySettings;
  onUpdateSettings: (newSettings: Partial<DisplaySettings>) => void;
  onClose: () => void;
}

export const DisplaySettingsModal: React.FC<DisplaySettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Display & Accessibility Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contrast Mode */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 block">
              Color Scheme / Contrast
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onUpdateSettings({ contrast: 'standard' })}
                className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${
                  settings.contrast === 'standard'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" /> Standard
                </span>
                {settings.contrast === 'standard' && <Check className="w-4 h-4 text-indigo-600" />}
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ contrast: 'yellow-black' })}
                className={`flex items-center justify-between p-3 rounded-xl border text-sm font-bold transition-all ${
                  settings.contrast === 'yellow-black'
                    ? 'border-yellow-400 bg-black text-yellow-300 ring-2 ring-yellow-400'
                    : 'border-slate-800 bg-slate-950 text-yellow-400 hover:border-yellow-500'
                }`}
              >
                <span>Yellow on Black</span>
                {settings.contrast === 'yellow-black' && <Check className="w-4 h-4 text-yellow-300" />}
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ contrast: 'blue-white' })}
                className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${
                  settings.contrast === 'blue-white'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-blue-50/40 text-blue-900 hover:border-blue-300'
                }`}
              >
                <span>Blue on White</span>
                {settings.contrast === 'blue-white' && <Check className="w-4 h-4 text-blue-600" />}
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ contrast: 'dark' })}
                className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${
                  settings.contrast === 'dark'
                    ? 'border-slate-600 bg-slate-900 text-white ring-2 ring-slate-500'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" /> Dark Mode
                </span>
                {settings.contrast === 'dark' && <Check className="w-4 h-4 text-indigo-400" />}
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 block flex items-center gap-1.5">
              <Type className="w-4 h-4" /> Text Scale
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onUpdateSettings({ fontSize: size })}
                  className={`py-2.5 px-3 rounded-xl border text-center transition-all font-medium capitalize ${
                    settings.fontSize === size
                      ? 'border-indigo-600 bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {size === 'small' ? 'Standard (16px)' : size === 'medium' ? 'Large (18px)' : 'X-Large (20px)'}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Show Countdown Timer</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Display test time remaining in header</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ showTimer: !settings.showTimer })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.showTimer ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.showTimer ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Audio Volume */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-600" /> Master Volume
              </label>
              <span className="text-xs font-mono text-slate-500">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => onUpdateSettings({ volume: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};
