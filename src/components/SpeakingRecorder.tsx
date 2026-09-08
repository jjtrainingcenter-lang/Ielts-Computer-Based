import React, { useState, useEffect, useRef } from 'react';
import { SpeakingTaskData, DisplaySettings } from '../types';
import { Mic, Square, Play, Pause, Clock, Sparkles, AlertCircle } from 'lucide-react';

interface SpeakingRecorderProps {
  tasks: SpeakingTaskData[];
  settings: DisplaySettings;
  onEvaluateAI?: (part2Notes: string, transcript: string) => void;
  isEvaluatingAI?: boolean;
}

export const SpeakingRecorder: React.FC<SpeakingRecorderProps> = ({
  tasks,
  settings,
  onEvaluateAI,
  isEvaluatingAI,
}) => {
  const sortedTasks = [...(tasks || [])].sort((a, b) => a.partNumber - b.partNumber);
  const initialPart = (sortedTasks.find((t) => t.partNumber === 1)?.partNumber || sortedTasks[0]?.partNumber || 1) as 1 | 2 | 3;
  const [activePart, setActivePart] = useState<1 | 2 | 3>(initialPart);
  const currentTask = sortedTasks.find((t) => t.partNumber === activePart) || sortedTasks[0];

  const prepDuration = currentTask?.prepTimeSeconds ?? 60;
  const [prepTimeLeft, setPrepTimeLeft] = useState<number>(prepDuration);
  const [isPrepActive, setIsPrepActive] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [candidateNotes, setCandidateNotes] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const prepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!sortedTasks.some((t) => t.partNumber === activePart) && sortedTasks.length > 0) {
      setActivePart(sortedTasks[0].partNumber);
    }
  }, [tasks]);

  useEffect(() => {
    setIsPrepActive(false);
    setPrepTimeLeft(currentTask?.prepTimeSeconds ?? 60);
  }, [activePart, currentTask?.prepTimeSeconds]);

  useEffect(() => {
    if (isPrepActive && prepTimeLeft > 0) {
      prepTimerRef.current = setInterval(() => {
        setPrepTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPrepActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (prepTimerRef.current) {
      clearInterval(prepTimerRef.current);
    }

    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    };
  }, [isPrepActive, prepTimeLeft]);

  useEffect(() => {
    return () => {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(audioBlob));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recTimerRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Microphone permission required for speaking practice. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    if (recTimerRef.current) clearInterval(recTimerRef.current);
  };

  const toggleAudioPlayback = () => {
    if (!audioUrl) return;
    if (!audioElementRef.current || audioElementRef.current.src !== audioUrl) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlayingAudio(false);
    }
    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentTask) {
    return (
      <div className="h-full flex items-center justify-center bg-white p-8">
        <div className="max-w-md text-center p-6 border border-amber-200 bg-amber-50 rounded-lg text-amber-800">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          <h3 className="font-bold">Speaking content is not configured</h3>
          <p className="text-sm mt-1">Add at least one Speaking task before starting this section.</p>
        </div>
      </div>
    );
  }

  const availableParts = new Set(sortedTasks.map((t) => t.partNumber));
  const cueCard = currentTask.cueCard;
  const questions = currentTask.questions || [];

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#F4F7F9] border-t border-gray-300">
      <div className="lg:w-1/2 p-6 overflow-y-auto border-r border-gray-300 space-y-6 bg-white">
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-4">
          {[1, 2, 3].map((pNum) => {
            const enabled = availableParts.has(pNum as 1 | 2 | 3);
            return (
              <button
                key={pNum}
                type="button"
                disabled={!enabled}
                onClick={() => enabled && setActivePart(pNum as 1 | 2 | 3)}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
                  pNum === activePart
                    ? 'bg-[#214162] text-white shadow-xs'
                    : enabled
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Part {pNum}
              </button>
            );
          })}
        </div>

        <div>
          <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-[#214162] border border-blue-200">
            IELTS Speaking Part {currentTask.partNumber}
          </span>
          <h2 className="text-xl font-bold text-gray-900 mt-2">{currentTask.title}</h2>
          <p className="text-xs text-gray-500 mt-1">Topic: {currentTask.topic}</p>
        </div>

        {currentTask.partNumber === 2 && cueCard && (
          <div className="p-6 bg-amber-50/70 rounded border border-amber-200 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 border-b border-amber-200 pb-2">
              📋 {cueCard.mainTopic}
            </h3>
            <p className="text-xs font-semibold text-gray-700">You should say:</p>
            <ul className="space-y-2 text-xs text-gray-800 pl-4 list-disc">
              {cueCard.bulletPoints.map((bp, i) => <li key={i}>{bp}</li>)}
            </ul>
          </div>
        )}

        {(currentTask.partNumber !== 2 || questions.length > 0) && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Examiner Questions:</h4>
            <div className="space-y-2.5">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 rounded border border-gray-200 text-sm font-medium text-gray-800 flex items-start space-x-2.5"
                >
                  <span className="w-5 h-5 rounded bg-[#214162] text-white font-bold text-xs flex items-center justify-center shrink-0">{idx + 1}</span>
                  <p>{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTask.partNumber === 2 && (
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Candidate Notes / Scratchpad:</label>
            <textarea
              value={candidateNotes}
              onChange={(e) => setCandidateNotes(e.target.value)}
              placeholder="Jot down key points during preparation..."
              className="w-full h-28 p-3 bg-gray-50 rounded border border-gray-300 text-xs text-gray-800 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>
        )}
      </div>

      <div className="lg:w-1/2 p-6 flex flex-col justify-between bg-white">
        <div className="space-y-6">
          {currentTask.partNumber === 2 && (
            <div className="p-5 bg-gray-50 rounded border border-gray-300 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded bg-blue-50 text-[#214162] flex items-center justify-center border border-blue-200">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Preparation Timer</h4>
                  <p className="text-[11px] text-gray-500">Read cue card and plan response</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xl font-bold text-[#214162]">{formatSecs(prepTimeLeft)}</span>
                <button
                  type="button"
                  onClick={() => setIsPrepActive(!isPrepActive)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold text-white transition-colors ${isPrepActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-[#214162] hover:bg-[#2b547e]'}`}
                >
                  {isPrepActive ? 'Pause' : prepTimeLeft === 0 ? 'Finished' : 'Start Prep'}
                </button>
              </div>
            </div>
          )}

          <div className="p-8 bg-[#214162] text-white rounded border border-[#1a334e] shadow-md flex flex-col items-center justify-center space-y-5 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-transform ${isRecording ? 'bg-red-600 animate-pulse ring-8 ring-red-400/30' : 'bg-blue-600 ring-4 ring-white/20'}`}>
              <Mic className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-200 block mb-1">
                {isRecording ? 'LIVE RECORDING IN PROGRESS' : 'MICROPHONE STANDBY'}
              </span>
              <p className="text-2xl font-mono font-extrabold text-white">{formatSecs(recordingTime)}</p>
              {currentTask.speakTimeSeconds && (
                <p className="text-[10px] text-blue-200 mt-1">Suggested speaking time: {formatSecs(currentTask.speakTimeSeconds)}</p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {!isRecording ? (
                <button type="button" onClick={startRecording} className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded shadow-xs transition-all flex items-center space-x-2">
                  <Mic className="w-4 h-4" /> <span>Start Recording</span>
                </button>
              ) : (
                <button type="button" onClick={stopRecording} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded border border-white/20 transition-all flex items-center space-x-2">
                  <Square className="w-4 h-4 text-red-400" /> <span>Stop Recording</span>
                </button>
              )}
              {audioUrl && (
                <button type="button" onClick={toggleAudioPlayback} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded shadow-xs transition-all flex items-center space-x-2">
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlayingAudio ? 'Pause' : 'Play Response'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {onEvaluateAI && (
          <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={() => onEvaluateAI(candidateNotes, 'Speaking response recorded')}
              disabled={isEvaluatingAI}
              className="px-5 py-2.5 bg-[#214162] hover:bg-[#2b547e] text-white font-bold text-xs rounded shadow-xs transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isEvaluatingAI ? 'Evaluating Speaking...' : 'Get AI Band Score'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
