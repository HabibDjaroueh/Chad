import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Confetti } from './Confetti';
import { StreakMessage } from '../utils/streak';

interface Props {
  visible: boolean;
  streak: number;
  message: StreakMessage;
  onDismiss: () => void;
}

export function StreakModal({ visible, streak, message, onDismiss }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.root}>
        {visible && <Confetti key={`confetti-${streak}`} />}

        <Pressable style={styles.backdrop} onPress={onDismiss}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.badge}>STREAK</Text>

            <View style={styles.streakRing}>
              <Text style={styles.streakNum}>{streak}</Text>
              <Text style={styles.streakUnit}>
                {streak === 1 ? 'day' : 'days'}
              </Text>
            </View>

            <Text style={styles.headline}>{message.headline}</Text>
            <Text style={styles.body}>{message.body}</Text>

            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={onDismiss}
            >
              <Text style={styles.buttonText}>Let's go</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    zIndex: 20,
  },
  badge: {
    color: '#30D158',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 20,
  },
  streakRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#30D158',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  streakNum: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 40,
  },
  streakUnit: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    marginTop: -2,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 10,
  },
  body: {
    color: '#8E8E93',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  button: {
    backgroundColor: '#30D158',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
