import { supabase } from './supabase';
import { WorkoutEntry } from '../types/workout';

export async function saveWorkoutEntry(entry: WorkoutEntry): Promise<void> {
  const { error } = await supabase.from('workout_entries').insert({
    id: entry.id,
    timestamp: entry.timestamp,
    raw_transcript: entry.rawTranscript,
    exercise: entry.exercise ?? null,
    sets_data: entry.sets ?? [],
    unit: entry.unit ?? 'lbs',
    notes: entry.notes ?? null,
  });

  if (error) throw error;
}

export async function loadWorkoutEntries(): Promise<WorkoutEntry[]> {
  const { data, error } = await supabase
    .from('workout_entries')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    timestamp: new Date(row.timestamp),
    rawTranscript: row.raw_transcript,
    exercise: row.exercise ?? null,
    sets: row.sets_data ?? [],
    unit: row.unit ?? 'lbs',
    notes: row.notes ?? undefined,
  }));
}
