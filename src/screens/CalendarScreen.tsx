import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WorkoutCalendar } from '../components/WorkoutCalendar';
import { WorkoutCard } from '../components/WorkoutCard';
import { UnitPicker } from '../components/UnitPicker';
import { useWeightUnit } from '../context/WeightUnitContext';
import { loadWorkoutEntries, removeSetFromEntry } from '../services/storage';
import { WorkoutEntry, ExerciseGroup, GroupedSet } from '../types/workout';
import { convertWeight, formatWeight } from '../utils/units';

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function groupByExercise(entries: WorkoutEntry[]): ExerciseGroup[] {
  const map = new Map<string, ExerciseGroup>();

  for (const entry of entries) {
    if (!entry.exercise || entry.sets.length === 0) continue;
    const key = entry.exercise.toLowerCase();

    if (!map.has(key)) {
      map.set(key, { exercise: entry.exercise, sets: [], unit: entry.unit });
    }
    map.get(key)!.sets.push(
      ...entry.sets.map((s) => ({
        ...s,
        entryId: entry.id,
        entrySetNumber: s.setNumber,
        storedUnit: entry.unit,
      }))
    );
  }

  for (const group of map.values()) {
    group.sets.sort((a, b) => a.setNumber - b.setNumber);
    group.sets = group.sets.map((s, i) => ({ ...s, setNumber: i + 1 }));
  }

  return Array.from(map.values());
}

function formatDate(dateKey: string): string {
  const today = toDateKey(new Date());
  if (dateKey === today) return 'Today';
  const date = new Date(dateKey + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function CalendarScreen() {
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(toDateKey(new Date()));
  const { unit: weightUnit, setUnit: setWeightUnit } = useWeightUnit();

  useEffect(() => {
    loadWorkoutEntries()
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markedDates = new Set(entries.map((e) => toDateKey(new Date(e.timestamp))));

  const selectedEntries = entries.filter(
    (e) => toDateKey(new Date(e.timestamp)) === selectedDate
  );
  const groups = groupByExercise(selectedEntries);

  function handleDeleteSet(set: GroupedSet) {
    const weight = convertWeight(set.weight, set.storedUnit, weightUnit);
    Alert.alert(
      'Delete Set',
      `Remove set ${set.setNumber} (${formatWeight(weight)} ${weightUnit} × ${set.reps} reps)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = await removeSetFromEntry(entries, set.entryId, set.entrySetNumber);
              setEntries(updated);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete set.');
              console.error(err);
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>CALENDAR</Text>
            <UnitPicker value={weightUnit} onChange={setWeightUnit} />
          </View>
          <Text style={styles.subtitle}>Workout History</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#30D158" style={{ marginTop: 24 }} />
        ) : (
          <>
            <WorkoutCalendar
              markedDates={markedDates}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            <View style={styles.detail}>
              <Text style={styles.dayLabel}>{formatDate(selectedDate)}</Text>

              {groups.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>No workout logged</Text>
                </View>
              ) : (
                <FlatList
                  data={groups}
                  keyExtractor={(item) => item.exercise}
                  renderItem={({ item }) => (
                    <WorkoutCard
                      group={item}
                      displayUnit={weightUnit}
                      onDeleteSet={handleDeleteSet}
                    />
                  )}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
    letterSpacing: 1,
  },
  detail: {
    flex: 1,
    marginTop: 20,
  },
  dayLabel: {
    color: '#30D158',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  empty: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 15,
  },
});
