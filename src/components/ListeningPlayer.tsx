import React, { useState, useEffect, useRef } from 'react';
import { ListeningSectionData } from '../types';
import { Play, Pause, RotateCcw, Volume2, FileText, FastForward } from 'lucide-react';

interface ListeningPlayerProps {
  partData: ListeningSectionData;
  masterVolume: number;
}

export const ListeningPlayer: React.FC<ListeningPlayerProps> = ({ partData, masterVolume }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressSeconds, setProgressSeconds] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showTranscript, setShowTranscript] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated audio playback progress timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgressSeconds((prev) => {
          if (prev >= partData.audioDuration) {
            setIsPlaying(false);
            return partData.audioDuration;
          }
          return prev + 1 * playbackSpeed;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, partData.audioDuration]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const resetAudio = () => {
    setIsPlaying(false);
    setProgressSeconds(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.min(100, (progressSeconds / partData.audioDuration) * 100);

  return (
    <div className="bg-[#214162] border-b border-[#1a334e] p-3 text-white shadow-md">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded bg-white/10 border border-white/20 flex items-center justify-center text-blue-300">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider block">
              Audio Recording
            </span>
            <h3 className="text-xs font-semibold text-white">{partData.title}</h3>
          </div>
        </div>

        {/* Center Player Controls */}
        <div className="flex-1 max-w-md w-full flex items-center space-x-3 bg-[#1a334e] px-4 py-2 rounded border border-white/15">
          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-xs"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={resetAudio}
            className="text-gray-300 hover:text-white p-1"
            title="Restart Audio"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-gray-300">
              <span>{formatTime(progressSeconds)}</span>
              <span>{formatTime(partData.audioDuration)}</span>
            </div>
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickPos = (e.clientX - rect.left) / rect.width;
                setProgressSeconds(clickPos * partData.audioDuration);
              }}
              className="w-full h-2 bg-slate-800 rounded cursor-pointer overflow-hidden relative"
            >
              <div
                className="h-full bg-blue-500 rounded transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center space-x-1">
            {[0.8, 1.0, 1.25].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPlaybackSpeed(s)}
                className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded ${
                  playbackSpeed === s
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Right Transcript toggle */}
        <button
          type="button"
          onClick={() => setShowTranscript(!showTranscript)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded border text-xs font-bold transition-colors ${
            showTranscript
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{showTranscript ? 'Hide Audio Script' : 'Audio Script'}</span>
        </button>
      </div>

      {/* Transcript Box */}
      {showTranscript && partData.transcript && (
        <div className="max-w-5xl mx-auto mt-3 p-3 bg-[#13263b] rounded border border-white/10 text-xs font-mono text-gray-200 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
          {partData.transcript}
        </div>
      )}
    </div>
  );
};
