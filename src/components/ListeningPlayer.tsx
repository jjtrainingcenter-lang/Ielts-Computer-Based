import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ListeningSectionData } from '../types';
import { Play, Pause, Volume2, VolumeX, AlertCircle, Loader2, Lock } from 'lucide-react';
import { getGoogleDrivePreviewUrl, getMediaUrlCandidates, isGoogleDriveUrl } from '../lib/mediaUrls';

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
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [showDriveFallback, setShowDriveFallback] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAllowedTimeRef = useRef(0);
  const restoringSeekRef = useRef(false);
  const allowPause = true;

  const audioCandidates = useMemo(
    () => getMediaUrlCandidates(partData.audioUrl, 'audio'),
    [partData.audioUrl],
  );
  const resolvedAudioUrl = audioCandidates[candidateIndex] || partData.audioUrl || '';
  const drivePreviewUrl = useMemo(
    () => getGoogleDrivePreviewUrl(partData.audioUrl),
    [partData.audioUrl],
  );
  const hasDriveSource = isGoogleDriveUrl(partData.audioUrl);

  useEffect(() => {
    setProgressSeconds(0);
    setHasStarted(false);
    setIsCompleted(false);
    setIsPlaying(false);
    setIsBlocked(false);
    setAudioError(false);
    setIsLoading(true);
    setCandidateIndex(0);
    setShowDriveFallback(false);
    setDuration(partData.audioDuration || 0);
    lastAllowedTimeRef.current = 0;
    restoringSeekRef.current = false;
  }, [partData.audioUrl, partData.audioDuration]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [resolvedAudioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : masterVolume;
    }
  }, [masterVolume, isMuted]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    lastAllowedTimeRef.current = current;
    setProgressSeconds(current);
  };

  // IELTS-style locked playback: the candidate may listen/pause, but cannot
  // drag, jump, rewind, fast-forward, change playback rate, or seek by keyboard.
  const handleSeeking = () => {
    const audio = audioRef.current;
    if (!audio || restoringSeekRef.current) return;
    const allowed = lastAllowedTimeRef.current;
    if (Math.abs(audio.currentTime - allowed) > 0.35) {
      restoringSeekRef.current = true;
      audio.currentTime = allowed;
      setProgressSeconds(allowed);
      window.setTimeout(() => {
        restoringSeekRef.current = false;
      }, 0);
    }
  };

  const enforceNormalSpeed = () => {
    if (audioRef.current && audioRef.current.playbackRate !== 1) {
      audioRef.current.playbackRate = 1;
    }
  };

  const handleLoadedMetadata = () => {
    setIsLoading(false);
    setAudioError(false);
    if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
      audioRef.current.playbackRate = 1;
    }

    if (!hasStarted) attemptPlay();
  };

  const attemptPlay = () => {
    if (!audioRef.current || isCompleted || !resolvedAudioUrl) return;
    audioRef.current.playbackRate = 1;

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setHasStarted(true);
          setIsBlocked(false);
          setAudioError(false);
        })
        .catch((error) => {
          console.warn('Autoplay blocked or audio unavailable:', error);
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
    setIsPlaying(false);
    setIsLoading(false);

    if (candidateIndex < audioCandidates.length - 1) {
      setCandidateIndex((index) => index + 1);
      setAudioError(false);
      setIsLoading(true);
      return;
    }

    if (hasDriveSource && drivePreviewUrl) {
      setShowDriveFallback(true);
    }
    setAudioError(true);
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (progressSeconds / duration) * 100) : 0;
  const noAudioConfigured = !partData.audioUrl?.trim();

  return (
    <div className="bg-[#214162] border-b border-[#1a334e] p-3 text-white shadow-md select-none shrink-0">
      {!showDriveFallback && (
        <audio
          ref={audioRef}
          src={resolvedAudioUrl}
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          onRateChange={enforceNormalSpeed}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={handleError}
          preload="metadata"
          controls={false}
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
        />
      )}

      <div className="max-w-5xl mx-auto flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded bg-white/10 border border-white/20 flex items-center justify-center text-blue-300 shrink-0">
              {isLoading && !audioError ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider block">Audio Recording</span>
              <h3 className="text-sm font-semibold text-white truncate" title={partData.title}>{partData.title}</h3>
              <div className="flex items-center gap-1 text-[9px] text-blue-200 mt-0.5">
                <Lock className="w-2.5 h-2.5" />
                <span>Seeking locked — no forward or rewind</span>
              </div>
            </div>
          </div>

          {!showDriveFallback && (
            <div className="flex-1 max-w-lg w-full flex items-center space-x-4 bg-[#1a334e] px-4 py-2.5 rounded border border-white/15">
              {isBlocked && !hasStarted ? (
                <button
                  onClick={attemptPlay}
                  className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-amber-950 px-4 py-1.5 rounded text-xs font-bold shadow-sm transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>START AUDIO</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={isCompleted || isLoading || noAudioConfigured || audioError}
                  className={`w-9 h-9 rounded flex items-center justify-center transition-transform shadow-xs shrink-0 ${
                    isCompleted || isLoading || noAudioConfigured || audioError
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
                <div
                  className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden relative cursor-not-allowed"
                  title="Audio seeking is disabled during the test"
                >
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-linear pointer-events-none" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            {noAudioConfigured ? (
              <div className="flex items-center space-x-1.5 text-amber-300 bg-amber-900/30 px-3 py-1.5 rounded border border-amber-500/30">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold">No audio attached</span>
              </div>
            ) : audioError && !showDriveFallback ? (
              <div className="flex items-center space-x-1.5 text-red-400 bg-red-900/30 px-3 py-1.5 rounded border border-red-500/30">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold">Audio Unavailable</span>
              </div>
            ) : isCompleted ? (
              <div className="text-xs font-bold text-emerald-400 bg-emerald-900/30 px-3 py-1.5 rounded border border-emerald-500/30">Audio Completed</div>
            ) : !showDriveFallback ? (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            ) : null}
          </div>
        </div>

        {showDriveFallback && drivePreviewUrl && (
          <div className="bg-white rounded-lg overflow-hidden border border-white/20">
            <div className="px-3 py-2 bg-amber-50 text-amber-900 text-xs font-semibold border-b border-amber-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Google Drive fallback player. The seek/timeline area is locked for candidates. Make sure the file is shared as “Anyone with the link”.
            </div>
            <div className="relative h-[96px] bg-white">
              <iframe
                src={drivePreviewUrl}
                title={`${partData.title} Google Drive audio`}
                className="w-full h-[96px] border-0 bg-white"
                allow="autoplay"
              />
              <div
                className="absolute left-[68px] right-[72px] bottom-0 h-[48px] z-10 cursor-not-allowed"
                title="Seeking is disabled during the test"
                aria-hidden="true"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
