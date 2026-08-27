import React, { useState } from 'react';
import { Volume2, Play, CheckCircle2 } from 'lucide-react';

interface ExamDeviceCheckProps {
  onContinue: () => void;
}

export const ExamDeviceCheck: React.FC<ExamDeviceCheckProps> = ({ onContinue }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const handlePlayAudio = () => {
    setIsPlaying(true);
    // Normally play a short ping or test sound
    setTimeout(() => {
      setIsPlaying(false);
      setHasPlayed(true);
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8 h-full w-full absolute inset-0 z-50">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-8 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Volume2 className="w-8 h-8 text-blue-600" />
        </div>
        
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Audio Check</h2>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            Before we begin the Listening test, please check your audio. Make sure your headphones are connected and your volume is set to a comfortable level.
          </p>
        </div>

        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <button
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className={`mx-auto flex items-center space-x-2 px-6 py-3 rounded-full font-bold text-sm transition-colors ${
              isPlaying 
                ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isPlaying ? 'Playing...' : 'Play Test Audio'}</span>
          </button>
          
          {hasPlayed && (
            <p className="text-emerald-600 font-bold text-sm flex items-center justify-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Audio played successfully
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-center">
          <button
            onClick={onContinue}
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center space-x-2"
          >
            <span>Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
