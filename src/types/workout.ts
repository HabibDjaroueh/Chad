export interface SetDetail {
  setNumber: number;
  reps: number;
  weight: number;
}

export interface WorkoutEntry {
  id: string;
  timestamp: Date;
  rawTranscript: string;
  exercise: string | null;
  sets: SetDetail[];
  unit: 'lbs' | 'kg';
  notes?: string;
}

export interface ExerciseGroup {
  exercise: string;
  sets: SetDetail[];
  unit: 'lbs' | 'kg';
}
