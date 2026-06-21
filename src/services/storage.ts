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

export async function updateWorkoutEntry(entry: WorkoutEntry): Promise<void> {
  const { error } = await supabase
    .from('workout_entries')
    .update({
      sets_data: entry.sets,
      exercise: entry.exercise ?? null,
      unit: entry.unit ?? 'lbs',
      notes: entry.notes ?? null,
    })
    .eq('id', entry.id);

  if (error) throw error;
}

export async function deleteWorkoutEntry(id: string): Promise<void> {
  const { error } = await supabase.from('workout_entries').delete().eq('id', id);

  if (error) throw error;
}

export async function removeSetFromEntry(
  entries: WorkoutEntry[],
  entryId: string,
  entrySetNumber: number
): Promise<WorkoutEntry[]> {
  const entry = entries.find((e) => e.id === entryId);
  if (!entry) return entries;

  const newSets = entry.sets
    .filter((s) => s.setNumber !== entrySetNumber)
    .map((s, i) => ({ ...s, setNumber: i + 1 }));

  if (newSets.length === 0) {
    await deleteWorkoutEntry(entryId);
    return entries.filter((e) => e.id !== entryId);
  }

  const updated = { ...entry, sets: newSets };
  await updateWorkoutEntry(updated);
  return entries.map((e) => (e.id === entryId ? updated : e));
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
