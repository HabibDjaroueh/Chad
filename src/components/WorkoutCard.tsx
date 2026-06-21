import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ExerciseGroup, GroupedSet, WeightUnit } from '../types/workout';
import { convertWeight, formatWeight } from '../utils/units';

interface Props {
  group: ExerciseGroup;
  displayUnit: WeightUnit;
  onDeleteSet?: (set: GroupedSet) => void;
}

export function WorkoutCard({ group, displayUnit, onDeleteSet }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.exercise}>{group.exercise.toUpperCase()}</Text>

      <View style={styles.setHeader}>
        <Text style={styles.colLabel}>SET</Text>
        <Text style={styles.colLabel}>WEIGHT</Text>
        <Text style={styles.colLabel}>REPS</Text>
        {onDeleteSet && <View style={styles.deleteCol} />}
      </View>

      {group.sets.map((set) => {
        const weight = convertWeight(set.weight, set.storedUnit, displayUnit);
        return (
          <View key={`${set.entryId}-${set.entrySetNumber}`} style={styles.setRow}>
            <Text style={styles.setNumber}>{set.setNumber}</Text>
            <Text style={styles.setValue}>
              {formatWeight(weight)} {displayUnit}
            </Text>
            <Text style={styles.setValue}>{set.reps}</Text>
            {onDeleteSet && (
              <Pressable
                style={styles.deleteBtn}
                onPress={() => onDeleteSet(set)}
                hitSlop={8}
                accessibilityLabel={`Delete set ${set.setNumber}`}
              >
                <Text style={styles.deleteIcon}>✕</Text>
              </Pressable>
            )}
          </View>
        );
      })}
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
  deleteCol: {
    width: 32,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    color: '#48484A',
    fontSize: 16,
    fontWeight: '600',
  },
});
