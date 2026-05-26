'use client';

import { useRef, useState, useEffect } from 'react';

interface AudioRecorderProps {
  onAudioSubmit: (file: File) => Promise<void>;
  isProcessing: boolean;
  jobId: string;
}

export default function AudioRecorder({ onAudioSubmit, isProcessing, jobId }: AudioRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      setRecordingTime(0);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start();
      setIsRecording(true);

      // Update recording timer every 100ms
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 0.1);
      }, 100);
    } catch (err) {
      setError(`Recording error: ${(err as Error).message}`);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const playRecording = () => {
    if (recordedBlob && audioRef.current) {
      const url = URL.createObjectURL(recordedBlob);
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  const submitRecording = async () => {
    if (!recordedBlob) {
      setError('No recording to submit');
      return;
    }

    const file = new File([recordedBlob], `voice-intro-${Date.now()}.webm`, { type: 'audio/webm' });
    try {
      await onAudioSubmit(file);
      resetRecording();
    } catch (err) {
      setError(`Submission error: ${(err as Error).message}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <audio
        ref={audioRef}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {error && <div className="rounded-3xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {/* Recording Phase */}
      {!recordedBlob ? (
        <div className="space-y-4 rounded-3xl border border-gray-200 bg-slate-50 p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">
              {isRecording ? 'Recording...' : 'Ready to record'}
            </p>
            {isRecording && (
              <p className="mt-2 text-2xl font-bold text-nearhire-600">
                {formatTime(recordingTime)}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isProcessing}
                className="flex-1 rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                🎤 Start Recording
              </button>
            ) : (
              <>
                <button
                  onClick={stopRecording}
                  disabled={isProcessing}
                  className="flex-1 rounded-full bg-slate-700 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  ⏹ Stop Recording
                </button>
              </>
            )}
          </div>

          <p className="text-xs text-slate-500 text-center">
            Record your voice introduction (max 2 minutes). Speak clearly and mention your interest in the role.
          </p>
        </div>
      ) : (
        <>
          {/* Playback Phase */}
          <div className="space-y-4 rounded-3xl border border-gray-200 bg-slate-50 p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">Recording ready for review</p>
              <p className="mt-1 text-sm text-slate-500">Duration: {formatTime(duration)}</p>
            </div>

            {/* Playback Progress Bar */}
            <div className="space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-nearhire-600 transition-all"
                  style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              {!isPlaying ? (
                <button
                  onClick={playRecording}
                  disabled={isProcessing}
                  className="flex-1 rounded-full bg-nearhire-600 px-4 py-3 text-sm font-semibold text-white hover:bg-nearhire-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  ▶ Play
                </button>
              ) : (
                <button
                  onClick={pauseRecording}
                  disabled={isProcessing}
                  className="flex-1 rounded-full bg-nearhire-600 px-4 py-3 text-sm font-semibold text-white hover:bg-nearhire-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  ⏸ Pause
                </button>
              )}
              <button
                onClick={resetRecording}
                disabled={isProcessing}
                className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                🔄 Re-record
              </button>
            </div>
          </div>

          {/* Submit Phase */}
          <button
            onClick={submitRecording}
            disabled={isProcessing}
            className="w-full rounded-full bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isProcessing ? '⏳ Processing...' : '✓ Submit Recording'}
          </button>
        </>
      )}
    </div>
  );
}
