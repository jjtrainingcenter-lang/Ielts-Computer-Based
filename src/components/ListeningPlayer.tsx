import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ListeningSectionData } from '../types';
import { AlertCircle } from 'lucide-react';
import { getGoogleDrivePreviewUrl, getMediaUrlCandidates, isGoogleDriveUrl } from '../lib/mediaUrls';

interface ListeningPlayerProps {
  partData: ListeningSectionData;
  masterVolume: number;
}

/**
 * Candidate Listening playback intentionally has no visible player controls.
 * The recording runs once in the background at 1x speed and candidates cannot
 * pause, seek, rewind, fast-forward, or change playback speed.
 */
export const ListeningPlayer: React.FC<ListeningPlayerProps> = ({ partData, masterVolume }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAllowedTimeRef = useRef(0);
  const restoringSeekRef = useRef(false);
  const completedRef = useRef(false);

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [useDriveFallback, setUseDriveFallback] = useState(false);

  const audioCandidates = useMemo(
    () => getMediaUrlCandidates(partData.audioUrl, 'audio'),
    [partData.audioUrl],
  );
  const resolvedAudioUrl = audioCandidates[candidateIndex] || partData.audioUrl || '';
  const drivePreviewUrl = useMemo(
    () => getGoogleDrivePreviewUrl(partData.audioUrl),
    [partData.audioUrl],
  );
  const driveAutoplayUrl = drivePreviewUrl
    ? `${drivePreviewUrl}${drivePreviewUrl.includes('?') ? '&' : '?'}autoplay=1`
    : null;
  const hasDriveSource = isGoogleDriveUrl(partData.audioUrl);
  const noAudioConfigured = !partData.audioUrl?.trim();

  const attemptPlay = async () => {
    const audio = audioRef.current;
    if (!audio || completedRef.current || !resolvedAudioUrl || useDriveFallback) return;

    try {
      audio.playbackRate = 1;
      audio.volume = Math.max(0, Math.min(1, masterVolume));
      await audio.play();
      setIsBlocked(false);
      setAudioError(false);
    } catch (error) {
      // Browsers can block autoplay until the next user gesture. We keep the
      // player hidden and automatically retry on the candidate's next click/key.
      console.warn('Listening autoplay is waiting for browser permission:', error);
      setIsBlocked(true);
    }
  };

  useEffect(() => {
    completedRef.current = false;
    lastAllowedTimeRef.current = 0;
    restoringSeekRef.current = false;
    setCandidateIndex(0);
    setIsBlocked(false);
    setAudioError(false);
    setUseDriveFallback(false);
  }, [partData.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || useDriveFallback) return;
    audio.load();
    const timer = window.setTimeout(() => {
      void attemptPlay();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [resolvedAudioUrl, useDriveFallback]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, masterVolume));
      audio.playbackRate = 1;
    }
  }, [masterVolume]);

  // If autoplay was blocked, any normal interaction with the exam immediately
  // resumes the hidden recording. This is not a player control exposed to the student.
  useEffect(() => {
    if (noAudioConfigured || useDriveFallback || completedRef.current) return;

    const resume = () => {
      const audio = audioRef.current;
      if (audio && !completedRef.current && (audio.paused || isBlocked)) {
        void attemptPlay();
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') resume();
    };

    document.addEventListener('pointerdown', resume, true);
    document.addEventListener('keydown', resume, true);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', resume);

    return () => {
      document.removeEventListener('pointerdown', resume, true);
      document.removeEventListener('keydown', resume, true);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', resume);
    };
  }, [isBlocked, resolvedAudioUrl, useDriveFallback, noAudioConfigured]);

  useEffect(() => () => {
    // Stop the recording only when the Listening player genuinely leaves the page.
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = 1;
    audio.volume = Math.max(0, Math.min(1, masterVolume));
    void attemptPlay();
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || restoringSeekRef.current) return;
    lastAllowedTimeRef.current = audio.currentTime;
  };

  const handleSeeking = () => {
    const audio = audioRef.current;
    if (!audio || restoringSeekRef.current) return;
    const allowed = lastAllowedTimeRef.current;
    if (Math.abs(audio.currentTime - allowed) > 0.25) {
      restoringSeekRef.current = true;
      audio.currentTime = allowed;
      window.setTimeout(() => {
        restoringSeekRef.current = false;
      }, 0);
    }
  };

  const handleRateChange = () => {
    if (audioRef.current && audioRef.current.playbackRate !== 1) {
      audioRef.current.playbackRate = 1;
    }
  };

  const handlePause = () => {
    // Ignore the natural pause after the recording has finished. Any other pause
    // (media key, browser UI, script, etc.) is immediately reversed.
    if (completedRef.current || useDriveFallback) return;
    window.setTimeout(() => {
      void attemptPlay();
    }, 0);
  };

  const handleEnded = () => {
    completedRef.current = true;
    setIsBlocked(false);
  };

  const handleError = () => {
    if (candidateIndex < audioCandidates.length - 1) {
      setCandidateIndex(index => index + 1);
      setAudioError(false);
      setIsBlocked(false);
      return;
    }

    // Google Drive can refuse direct media streaming for some large files. In
    // that case keep its preview iframe completely hidden and request autoplay.
    // Students still receive no player controls to pause or seek.
    if (hasDriveSource && driveAutoplayUrl) {
      setUseDriveFallback(true);
      setAudioError(false);
      setIsBlocked(false);
      return;
    }

    setAudioError(true);
    setIsBlocked(false);
  };

  if (noAudioConfigured) {
    return (
      <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Listening audio has not been attached to this test.
      </div>
    );
  }

  return (
    <>
      {!useDriveFallback && (
        <audio
          ref={audioRef}
          src={resolvedAudioUrl}
          autoPlay
          preload="auto"
          controls={false}
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          onRateChange={handleRateChange}
          onPause={handlePause}
          onEnded={handleEnded}
          onError={handleError}
          className="hidden"
          aria-hidden="true"
        />
      )}

      {useDriveFallback && driveAutoplayUrl && (
        <iframe
          src={driveAutoplayUrl}
          title="Listening recording"
          allow="autoplay"
          tabIndex={-1}
          aria-hidden="true"
          className="fixed w-px h-px opacity-0 pointer-events-none overflow-hidden"
        />
      )}

      {isBlocked && !useDriveFallback && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-semibold">
          Audio is ready. Click anywhere in the exam once to allow browser playback; it will then continue in the background without player controls.
        </div>
      )}

      {audioError && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Listening audio could not be played. Please contact the administrator.
        </div>
      )}
    </>
  );
};
