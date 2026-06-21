export type WeightUnit = 'lbs' | 'kg';

export interface SetDetail {
  setNumber: number;
  reps: number;
  weight: number;
}

export interface GroupedSet extends SetDetail {
  entryId: string;
  entrySetNumber: number;
  storedUnit: WeightUnit;
}

export interface WorkoutEntry {
  id: string;
  timestamp: Date;
  rawTranscript: string;
  exercise: string | null;
  sets: SetDetail[];
  unit: WeightUnit;
  notes?: string;
}

export interface ExerciseGroup {
  exercise: string;
  sets: GroupedSet[];
  unit: WeightUnit;
}
