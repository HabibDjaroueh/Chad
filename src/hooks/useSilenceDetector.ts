import { useEffect, useRef } from 'react';
import { useAudioRecorderState } from 'expo-audio';

type Recorder = Parameters<typeof useAudioRecorderState>[0];

const SILENCE_THRESHOLD_DB = -35;
const SILENCE_DURATION_MS = 1500;
const POLL_INTERVAL_MS = 150;

export function useSilenceDetector(
  recorder: Recorder,
  enabled: boolean,
  onSilence: () => void,
) {
  const silenceSinceRef = useRef<number | null>(null);
  const firedRef = useRef(false);
  const onSilenceRef = useRef(onSilence);
  const state = useAudioRecorderState(recorder, POLL_INTERVAL_MS);

  useEffect(() => {
    onSilenceRef.current = onSilence;
  }, [onSilence]);

  // Reset when enabled toggles
  useEffect(() => {
    silenceSinceRef.current = null;
    firedRef.current = false;
  }, [enabled]);

  useEffect(() => {
    if (!enabled || firedRef.current) return;

    const metering = state.metering;
    if (metering === undefined) return;

    if (metering < SILENCE_THRESHOLD_DB) {
      if (silenceSinceRef.current === null) {
        silenceSinceRef.current = Date.now();
      } else if (Date.now() - silenceSinceRef.current >= SILENCE_DURATION_MS) {
        firedRef.current = true;
        silenceSinceRef.current = null;
        onSilenceRef.current();
      }
    } else {
      // User is speaking — reset the silence timer
      silenceSinceRef.current = null;
    }
  }, [enabled, state.metering]);
}
