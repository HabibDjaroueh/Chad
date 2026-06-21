import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RecordButton } from '../components/RecordButton';
import { WorkoutCard } from '../components/WorkoutCard';
import { UnitPicker } from '../components/UnitPicker';
import { useWeightUnit } from '../context/WeightUnitContext';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
// import { useWakeWord } from '../hooks/useWakeWord';
import { useSilenceDetector } from '../hooks/useSilenceDetector';
import { transcribeAudio } from '../services/whisper';
import { parseWorkoutFromTranscript } from '../services/parser';
import { saveWorkoutEntry, loadWorkoutEntries, removeSetFromEntry } from '../services/storage';
import { WorkoutEntry, ExerciseGroup, GroupedSet } from '../types/workout';
import { convertWeight, formatWeight, setVolume } from '../utils/units';

type Section = {
  title: string;
  isToday: boolean;
  data: ExerciseGroup[];
};

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatSectionTitle(dateKey: string): string {
  const today = toDateKey(new Date());
  if (dateKey === today) return 'Today';
  const date = new Date(dateKey + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function groupEntries(entries: WorkoutEntry[]): Section[] {
  const byDate = new Map<string, Map<string, ExerciseGroup>>();

  for (const entry of entries) {
    if (!entry.exercise || entry.sets.length === 0) continue;

    const dateKey = toDateKey(new Date(entry.timestamp));
    if (!byDate.has(dateKey)) byDate.set(dateKey, new Map());

    const exerciseMap = byDate.get(dateKey)!;
    const exerciseKey = entry.exercise.toLowerCase();

    if (!exerciseMap.has(exerciseKey)) {
      exerciseMap.set(exerciseKey, {
        exercise: entry.exercise,
        sets: [],
        unit: entry.unit,
      });
    }

    const group = exerciseMap.get(exerciseKey)!;
    group.sets.push(
      ...entry.sets.map((s) => ({
        ...s,
        entryId: entry.id,
        entrySetNumber: s.setNumber,
        storedUnit: entry.unit,
      }))
    );
  }

  for (const exerciseMap of byDate.values()) {
    for (const group of exerciseMap.values()) {
      group.sets.sort((a, b) => a.setNumber - b.setNumber);
      group.sets = group.sets.map((s, i) => ({ ...s, setNumber: i + 1 }));
    }
  }

  const today = toDateKey(new Date());

  return Array.from(byDate.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dateKey, exerciseMap]) => ({
      title: formatSectionTitle(dateKey),
      isToday: dateKey === today,
      data: Array.from(exerciseMap.values()),
    }));
}

export function HomeScreen() {
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { unit: weightUnit, setUnit: setWeightUnit } = useWeightUnit();
  const { state, error, recorder, startRecording, stopRecording, resetState } = useVoiceRecorder();
  const wakeWordListening = false;
  const startWakeWord = () => {};
  const stopWakeWord = () => {};

  useSilenceDetector(recorder, state === 'recording', processRecording);

  useEffect(() => {
    loadWorkoutEntries()
      .then(setEntries)
      .catch((err) => console.error('Failed to load entries:', err))
      .finally(() => setLoading(false));
  }, []);

  async function processRecording() {
    const audioUri = await stopRecording();
    if (!audioUri) {
      resetState();
      startWakeWord();
      return;
    }

    try {
      const transcript = await transcribeAudio(audioUri);
      const { exercise, sets, unit: parsedUnit, notes } = await parseWorkoutFromTranscript(transcript);
      const setsInPreferredUnit = sets.map((s) => ({
        ...s,
        weight: convertWeight(s.weight, parsedUnit, weightUnit),
      }));

      const entry: WorkoutEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        rawTranscript: transcript,
        exercise,
        sets: setsInPreferredUnit,
        unit: weightUnit,
        notes,
      };

      await saveWorkoutEntry(entry);
      setEntries((prev) => [entry, ...prev]);
    } catch (err) {
      Alert.alert('Error', 'Failed to process your voice input. Check your API key.');
      console.error(err);
    } finally {
      resetState();
      startWakeWord();
    }
  }

  async function handleManualPressIn() {
    stopWakeWord();
    await startRecording();
  }

  async function handleManualPressOut() {
    await processRecording();
  }

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

  const todayKey = toDateKey(new Date());
  const todayEntries = entries.filter((e) => toDateKey(new Date(e.timestamp)) === todayKey);
  const todayVolume = todayEntries.reduce((acc, e) => {
    return acc + e.sets.reduce((s, set) => s + setVolume(set, e.unit, weightUnit), 0);
  }, 0);

  const sections = groupEntries(entries);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>CHAD</Text>
            <UnitPicker value={weightUnit} onChange={setWeightUnit} />
          </View>
          <Text style={styles.subtitle}>Voice Workout Tracker</Text>
        </View>

        {todayEntries.length > 0 && (
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>
                {new Set(todayEntries.filter(e => e.exercise).map(e => e.exercise!.toLowerCase())).size}
              </Text>
              <Text style={styles.statLbl}>Exercises</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{todayVolume.toLocaleString()}</Text>
              <Text style={styles.statLbl}>{weightUnit} Today</Text>
            </View>
          </View>
        )}

        {loading && (
          <ActivityIndicator color="#30D158" style={{ marginBottom: 16 }} />
        )}

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.exercise}
          renderItem={({ item }) => (
            <WorkoutCard
              group={item}
              displayUnit={weightUnit}
              onDeleteSet={handleDeleteSet}
            />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, section.isToday ? styles.sectionTitleToday : null]}>
                {section.title}
              </Text>
              {section.isToday && <View style={styles.sectionDot} />}
            </View>
          )}
          style={styles.list}
          contentContainerStyle={[styles.listContent, sections.length === 0 && styles.emptyList]}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>💪</Text>
                <Text style={styles.emptyText}>Say "Hey Chad" and{'\n'}describe your set</Text>
                <Text style={styles.emptyExample}>
                  "Hey Chad, squat 100kg for 6 reps"
                </Text>
              </View>
            ) : null
          }
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.recordArea}>
          <RecordButton
            state={state}
            wakeWordListening={wakeWordListening}
            onPressIn={handleManualPressIn}
            onPressOut={handleManualPressOut}
          />
        </View>
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
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNum: {
    color: '#30D158',
    fontSize: 24,
    fontWeight: '700',
  },
  statLbl: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#3A3A3C',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#000000',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitleToday: {
    color: '#30D158',
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#30D158',
    marginLeft: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 26,
  },
  emptyExample: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  error: {
    color: '#FF453A',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 13,
  },
  recordArea: {
    alignItems: 'center',
    paddingVertical: 32,
  },
});
