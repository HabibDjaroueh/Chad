import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ExerciseGroup } from '../types/workout';

interface Props {
  group: ExerciseGroup;
}

export function WorkoutCard({ group }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.exercise}>{group.exercise.toUpperCase()}</Text>

      <View style={styles.setHeader}>
        <Text style={styles.colLabel}>SET</Text>
        <Text style={styles.colLabel}>WEIGHT</Text>
        <Text style={styles.colLabel}>REPS</Text>
      </View>

      {group.sets.map((set) => (
        <View key={set.setNumber} style={styles.setRow}>
          <Text style={styles.setNumber}>{set.setNumber}</Text>
          <Text style={styles.setValue}>{set.weight} {group.unit}</Text>
          <Text style={styles.setValue}>{set.reps}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  exercise: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 14,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  colLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  setNumber: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  setValue: {
    color: '#30D158',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
});
