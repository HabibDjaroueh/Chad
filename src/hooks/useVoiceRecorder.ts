import { useState, useRef } from 'react';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';

const RECORDING_OPTIONS = { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true };

export type RecordingState = 'idle' | 'recording' | 'processing';

const MIN_RECORDING_MS = 1500;

export function useVoiceRecorder() {
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const recorder = useAudioRecorder(RECORDING_OPTIONS);

  async function startRecording() {
    try {
      setError(null);

      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        setError('Microphone permission denied');
        return;
      }

      await AudioModule.setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      startTimeRef.current = Date.now();
      setState('recording');
    } catch (err) {
      setError('Failed to start recording');
      console.error(err);
    }
  }

  async function stopRecording(): Promise<string | null> {
    if (state !== 'recording') return null;

    const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
    if (elapsed < MIN_RECORDING_MS) {
      await recorder.stop();
      setState('idle');
      setError('Hold longer and speak your full set');
      return null;
    }

    try {
      setState('processing');
      await recorder.stop();
      await AudioModule.setAudioModeAsync({ allowsRecording: false });
      return recorder.uri ?? null;
    } catch (err) {
      setError('Failed to stop recording');
      console.error(err);
      setState('idle');
      return null;
    }
  }

  function resetState() {
    setState('idle');
    setError(null);
  }

  return { state, error, recorder, startRecording, stopRecording, resetState };
}
