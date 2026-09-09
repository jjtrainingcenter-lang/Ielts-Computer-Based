import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, Play, Pause, CheckCircle2, AlertCircle } from 'lucide-react';
import { subscribeToPretestAudioSampleUrl } from '../lib/audioSample';
import { getGoogleDrivePreviewUrl, getMediaUrlCandidates, isGoogleDriveUrl } from '../lib/mediaUrls';

interface ExamDeviceCheckProps {
  onContinue: () => void;
}

export const ExamDeviceCheck: React.FC<ExamDeviceCheckProps> = ({ onContinue }) => {
  const [sampleUrl, setSampleUrl] = useState('');
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [showDriveFallback, setShowDriveFallback] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => subscribeToPretestAudioSampleUrl(url => {
    setSampleUrl(url);
    setCandidateIndex(0);
    setAudioError(false);
    setShowDriveFallback(false);
    setIsPlaying(false);
    setHasPlayed(false);
  }), []);

  const candidates = useMemo(() => getMediaUrlCandidates(sampleUrl, 'audio'), [sampleUrl]);
  const resolvedUrl = candidates[candidateIndex] || sampleUrl;
  const drivePreviewUrl = useMemo(() => getGoogleDrivePreviewUrl(sampleUrl), [sampleUrl]);
  const isDrive = isGoogleDriveUrl(sampleUrl);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.load();
    setIsPlaying(false);
  }, [resolvedUrl]);

  const handlePlayAudio = async () => {
    if (!audioRef.current || !resolvedUrl) return;
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }
      await audioRef.current.play();
      setIsPlaying(true);
      setAudioError(false);
    } catch (error) {
      console.warn('Could not play sample audio', error);
      if (candidateIndex < candidates.length - 1) {
        setCandidateIndex(index => index + 1);
      } else if (isDrive && drivePreviewUrl) {
        setShowDriveFallback(true);
      } else {
        setAudioError(true);
      }
    }
  };

  const handleError = () => {
    setIsPlaying(false);
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex(index => index + 1);
      return;
    }
    if (isDrive && drivePreviewUrl) {
      setShowDriveFallback(true);
      return;
    }
    setAudioError(true);
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
          {!showDriveFallback && resolvedUrl && (
            <audio
              ref={audioRef}
              src={resolvedUrl}
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                setHasPlayed(true);
              }}
              onError={handleError}
            />
          )}

          {!sampleUrl ? (
            <div className="flex items-center justify-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm font-semibold">
              <AlertCircle className="w-4 h-4" />
              Audio sample has not been configured by the administrator yet.
            </div>
          ) : showDriveFallback && drivePreviewUrl ? (
            <div className="space-y-2">
              <iframe
                src={drivePreviewUrl}
                title="Pre-test audio sample"
                className="w-full h-[96px] rounded-lg border border-slate-200 bg-white"
                allow="autoplay"
              />
              <p className="text-[11px] text-slate-500">Use the Drive player above to test your headphones.</p>
            </div>
          ) : (
            <button
              onClick={handlePlayAudio}
              disabled={audioError}
              className={`mx-auto flex items-center space-x-2 px-6 py-3 rounded-full font-bold text-sm transition-colors ${
                audioError
                  ? 'bg-red-100 text-red-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause Test Audio' : 'Play Test Audio'}</span>
            </button>
          )}

          {audioError && (
            <p className="text-red-600 font-bold text-sm flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Audio sample could not be played. Ask the administrator to check the link and sharing permissions.
            </p>
          )}

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
