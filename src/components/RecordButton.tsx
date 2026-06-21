import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { RecordingState } from '../hooks/useVoiceRecorder';

interface Props {
  state: RecordingState;
  wakeWordListening: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
}

export function RecordButton({ state, wakeWordListening, onPressIn, onPressOut }: Props) {
  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';
  const isIdle = state === 'idle';

  const icon = isProcessing ? '⏳' : isRecording ? '⏹' : '🎙️';

  let label: string;
  if (isProcessing) label = 'Processing...';
  else if (isRecording) label = 'Listening...';
  else if (wakeWordListening) label = "Say 'Hey Chad'  ·  or hold to speak";
  else label = 'Hold to speak';

  return (
    <View style={styles.wrapper}>
      {/* Wake word active indicator */}
      {isIdle && wakeWordListening && (
        <View style={styles.listeningBadge}>
          <View style={styles.listeningDot} />
          <Text style={styles.listeningText}>Listening</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          isRecording && styles.buttonRecording,
          isProcessing && styles.buttonProcessing,
        ]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isProcessing || isRecording}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>{icon}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
    gap: 6,
  },
  listeningDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#30D158',
  },
  listeningText: {
    color: '#30D158',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  button: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonRecording: {
    backgroundColor: '#FF3B30',
  },
  buttonProcessing: {
    backgroundColor: '#3A3A3C',
  },
  icon: {
    fontSize: 36,
  },
  label: {
    marginTop: 16,
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
