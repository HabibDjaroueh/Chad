import { useEffect, useRef, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

const WAKE_PHRASE = 'hey chad';

export function useWakeWord(onDetected: () => void) {
  const [listening, setListening] = useState(false);
  const activeRef = useRef(false);
  const onDetectedRef = useRef(onDetected);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  function startListening() {
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      continuous: true,
      interimResults: true,
      requiresOnDeviceRecognition: true,
      contextualStrings: ['Hey Chad'],
    });
  }

  // Check every partial/final result for the wake phrase
  useSpeechRecognitionEvent('result', (event) => {
    if (!activeRef.current) return;
    const transcript = event.results[0]?.transcript?.toLowerCase() ?? '';
    if (transcript.includes(WAKE_PHRASE)) {
      activeRef.current = false;
      setListening(false);
      ExpoSpeechRecognitionModule.abort();
      onDetectedRef.current();
    }
  });

  // iOS stops recognition after silence — restart automatically
  useSpeechRecognitionEvent('end', () => {
    if (activeRef.current) {
      startListening();
    }
  });

  // On no-speech restart immediately; other errors get a short cooldown
  useSpeechRecognitionEvent('error', (event) => {
    if (!activeRef.current) return;
    const delay = event.error === 'no-speech' ? 0 : 1500;
    setTimeout(() => {
      if (activeRef.current) startListening();
    }, delay);
  });

  async function start() {
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) return;
    activeRef.current = true;
    setListening(true);
    startListening();
  }

  function stop() {
    activeRef.current = false;
    setListening(false);
    ExpoSpeechRecognitionModule.abort();
  }

  useEffect(() => {
    return () => {
      activeRef.current = false;
      ExpoSpeechRecognitionModule.abort();
    };
  }, []);

  return { listening, start, stop };
}
