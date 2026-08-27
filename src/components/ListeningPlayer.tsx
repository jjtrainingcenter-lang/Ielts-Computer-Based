import React, { useState, useEffect, useRef } from 'react';
import { ListeningSectionData } from '../types';
import { Play, Pause, Volume2, VolumeX, AlertCircle, Loader2 } from 'lucide-react';

interface ListeningPlayerProps {
  partData: ListeningSectionData;
  masterVolume: number;
}

export const ListeningPlayer: React.FC<ListeningPlayerProps> = ({ partData, masterVolume }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressSeconds, setProgressSeconds] = useState(0);
  const [duration, setDuration] = useState(partData.audioDuration || 0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audioError, setAudioError] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // In a real strict exam, pause might be disallowed. We'll use a hardcoded safe default for now,
  // but it can be tied to test config later.
  const allowPause = true; 

  useEffect(() => {
    // Reset state if partData changes
    setProgressSeconds(0);
    setHasStarted(false);
    setIsCompleted(false);
    setIsPlaying(false);
    setIsBlocked(false);
    setAudioError(false);
    setIsLoading(true);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [partData.audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : masterVolume;
    }
  }, [masterVolume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgressSeconds(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    setIsLoading(false);
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
    
    // Attempt autoplay if not already started
    if (!hasStarted) {
      attemptPlay();
    }
  };

  const attemptPlay = () => {
    if (!audioRef.current || isCompleted) return;
    
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setHasStarted(true);
          setIsBlocked(false);
        })
        .catch(error => {
          console.warn("Autoplay blocked by browser:", error);
          setIsBlocked(true);
          setIsLoading(false);
        });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || isCompleted) return;
    
    if (isPlaying) {
      if (!allowPause) return;
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      attemptPlay();
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsCompleted(true);
  };

  const handleError = () => {
    setIsLoading(false);
    setAudioError(true);
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (progressSeconds / duration) * 100) : 0;

  return (
    <div className="bg-[#214162] border-b border-[#1a334e] p-3 text-white shadow-md select-none shrink-0">
      <audio
        ref={audioRef}
        src={partData.audioUrl} // If empty, handleError will fire
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
        preload="auto"
      />
      
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded bg-white/10 border border-white/20 flex items-center justify-center text-blue-300 shrink-0">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
          </div>
          <div className="flex-1 overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider block">
              Audio Recording
            </span>
            <h3 className="text-sm font-semibold text-white truncate" title={partData.title}>
              {partData.title}
            </h3>
          </div>
        </div>

        {/* Center Player Controls */}
        <div className="flex-1 max-w-lg w-full flex items-center space-x-4 bg-[#1a334e] px-4 py-2.5 rounded border border-white/15">
          {isBlocked && !hasStarted ? (
            <button
              onClick={attemptPlay}
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-amber-950 px-4 py-1.5 rounded text-xs font-bold shadow-sm transition-colors animate-pulse"
            >
              <Play className="w-4 h-4" />
              <span>START AUDIO</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={togglePlay}
              disabled={isCompleted || isLoading || (!allowPause && isPlaying)}
              className={`w-9 h-9 rounded flex items-center justify-center transition-transform shadow-xs shrink-0 ${
                isCompleted || (!allowPause && isPlaying)
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
          )}

          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono font-bold text-gray-300">
              <span>{formatTime(progressSeconds)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Status */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          {audioError ? (
            <div className="flex items-center space-x-1.5 text-red-400 bg-red-900/30 px-3 py-1.5 rounded border border-red-500/30">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-bold">Audio Unavailable</span>
            </div>
          ) : isCompleted ? (
            <div className="text-xs font-bold text-emerald-400 bg-emerald-900/30 px-3 py-1.5 rounded border border-emerald-500/30">
              Audio Completed
            </div>
          ) : (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
