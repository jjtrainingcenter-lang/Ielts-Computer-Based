import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ListeningSectionData } from '../types';
import { AlertCircle, Play } from 'lucide-react';
import { getGoogleDrivePreviewUrl, getMediaUrlCandidates, isGoogleDriveUrl } from '../lib/mediaUrls';

interface ListeningPlayerProps {
  partData: ListeningSectionData;
  masterVolume: number;
  testId?: string;
  candidateId?: string;
}

/**
 * Candidate Listening playback runs in the background at 1x speed without
 * visible scrub controls. Audio state and playback position are persisted so
 * that reloading or unexpected browser exit resumes from the exact second it left off.
 */
export const ListeningPlayer: React.FC<ListeningPlayerProps> = ({
  partData,
  masterVolume,
  testId,
  candidateId,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAllowedTimeRef = useRef(0);
  const restoringSeekRef = useRef(false);
  const completedRef = useRef(false);
  const hasRestoredPositionRef = useRef(false);

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

  // Distinct persistence key based on candidate, test, and audio
  const storageKey = useMemo(() => {
    const tid = testId || 'default';
    const cid = candidateId || 'candidate';
    const audioKey = partData.audioUrl ? partData.audioUrl.trim() : `part_${partData.partNumber || 1}`;
    return `jj_cbt_audio_pos_${cid}_${tid}_${audioKey}`;
  }, [candidateId, testId, partData.audioUrl, partData.partNumber]);

  const getSavedPlaybackInfo = (): { currentTime: number; isCompleted: boolean } => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          currentTime: typeof parsed.currentTime === 'number' && parsed.currentTime > 0 ? parsed.currentTime : 0,
          isCompleted: !!parsed.isCompleted,
        };
      }
    } catch (e) {
      try {
        const val = parseFloat(localStorage.getItem(storageKey) || '0');
        if (!isNaN(val) && val > 0) return { currentTime: val, isCompleted: false };
      } catch (err) {}
    }
    return { currentTime: 0, isCompleted: false };
  };

  const applySavedPosition = () => {
    const audio = audioRef.current;
    if (!audio || hasRestoredPositionRef.current) return;

    const { currentTime, isCompleted } = getSavedPlaybackInfo();
    if (isCompleted) {
      completedRef.current = true;
      return;
    }

    if (currentTime > 0) {
      hasRestoredPositionRef.current = true;
      restoringSeekRef.current = true;
      const targetTime =
        audio.duration && !isNaN(audio.duration) && audio.duration > 0
          ? Math.min(currentTime, Math.max(0, audio.duration - 0.5))
          : currentTime;

      try {
        audio.currentTime = targetTime;
        lastAllowedTimeRef.current = targetTime;
      } catch (err) {
        console.warn('Could not seek audio immediately:', err);
      }

      window.setTimeout(() => {
        restoringSeekRef.current = false;
      }, 250);
    }
  };

  const attemptPlay = async () => {
    const audio = audioRef.current;
    if (!audio || completedRef.current || !resolvedAudioUrl || useDriveFallback) return;

    try {
      applySavedPosition();
      audio.playbackRate = 1;
      audio.volume = Math.max(0, Math.min(1, masterVolume));
      await audio.play();
      setIsBlocked(false);
      setAudioError(false);
    } catch (error) {
      // Browsers can block autoplay on initial reload until the next user gesture.
      console.warn('Listening playback is waiting for browser gesture:', error);
      setIsBlocked(true);
    }
  };

  useEffect(() => {
    completedRef.current = false;
    lastAllowedTimeRef.current = 0;
    restoringSeekRef.current = false;
    hasRestoredPositionRef.current = false;
    setCandidateIndex(0);
    setIsBlocked(false);
    setAudioError(false);
    setUseDriveFallback(false);
  }, [partData.audioUrl, storageKey]);

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

  // Persist position on beforeunload and pagehide
  useEffect(() => {
    const saveCurrent = () => {
      const audio = audioRef.current;
      if (audio && audio.currentTime > 0 && !completedRef.current) {
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              currentTime: audio.currentTime,
              duration: audio.duration || 0,
              isCompleted: false,
              timestamp: Date.now(),
            })
          );
        } catch (e) {}
      }
    };

    window.addEventListener('beforeunload', saveCurrent);
    window.addEventListener('pagehide', saveCurrent);
    return () => {
      saveCurrent();
      window.removeEventListener('beforeunload', saveCurrent);
      window.removeEventListener('pagehide', saveCurrent);
    };
  }, [storageKey]);

  // If autoplay was blocked by the browser on reload, any normal interaction with the exam immediately resumes
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
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = 1;
    audio.volume = Math.max(0, Math.min(1, masterVolume));
    applySavedPosition();
    void attemptPlay();
  };

  const handleCanPlay = () => {
    applySavedPosition();
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || restoringSeekRef.current) return;
    lastAllowedTimeRef.current = audio.currentTime;

    // Save audio playback position so reload/sudden close resumes right here
    if (audio.currentTime > 0 && !completedRef.current) {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            currentTime: audio.currentTime,
            duration: audio.duration || 0,
            isCompleted: false,
            timestamp: Date.now(),
          })
        );
      } catch (e) {}
    }
  };

  const handleSeeking = () => {
    const audio = audioRef.current;
    if (!audio || restoringSeekRef.current) return;
    const allowed = lastAllowedTimeRef.current;
    if (Math.abs(audio.currentTime - allowed) > 0.3) {
      restoringSeekRef.current = true;
      audio.currentTime = allowed;
      window.setTimeout(() => {
        restoringSeekRef.current = false;
      }, 50);
    }
  };

  const handleRateChange = () => {
    if (audioRef.current && audioRef.current.playbackRate !== 1) {
      audioRef.current.playbackRate = 1;
    }
  };

  const handlePause = () => {
    if (completedRef.current || useDriveFallback) return;
    window.setTimeout(() => {
      void attemptPlay();
    }, 0);
  };

  const handleEnded = () => {
    completedRef.current = true;
    setIsBlocked(false);
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          currentTime: audioRef.current?.duration || 0,
          duration: audioRef.current?.duration || 0,
          isCompleted: true,
          timestamp: Date.now(),
        })
      );
    } catch (e) {}
  };

  const handleError = () => {
    if (candidateIndex < audioCandidates.length - 1) {
      setCandidateIndex(index => index + 1);
      setAudioError(false);
      setIsBlocked(false);
      return;
    }

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
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
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
        <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Audio paused from where you left off. Click anywhere in the exam or press Resume to continue.</span>
          </div>
          <button
            type="button"
            onClick={() => void attemptPlay()}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#214162] hover:bg-[#1a334e] text-white rounded text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Resume Audio</span>
          </button>
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
