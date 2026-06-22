import { WorkoutEntry } from '../types/workout';

export function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function previousDateKey(dateKey: string): string {
  const d = new Date(dateKey + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return toDateKey(d);
}

export function getWorkoutDateKeys(entries: WorkoutEntry[]): Set<string> {
  const days = new Set<string>();
  for (const entry of entries) {
    if (entry.exercise && entry.sets.length > 0) {
      days.add(toDateKey(new Date(entry.timestamp)));
    }
  }
  return days;
}

export function calculateStreak(workoutDays: Set<string>, fromDateKey: string): number {
  let streak = 0;
  let current = fromDateKey;
  while (workoutDays.has(current)) {
    streak++;
    current = previousDateKey(current);
  }
  return streak;
}

export function isValidWorkoutEntry(entry: WorkoutEntry): boolean {
  return Boolean(entry.exercise && entry.sets.length > 0);
}

export function isFirstWorkoutOfDay(entries: WorkoutEntry[], dateKey: string): boolean {
  return !entries.some(
    (e) => isValidWorkoutEntry(e) && toDateKey(new Date(e.timestamp)) === dateKey
  );
}

export type StreakMessage = {
  headline: string;
  body: string;
};

export function getStreakMessage(streak: number): StreakMessage {
  const messages: Record<number, StreakMessage> = {
    1: {
      headline: 'Day one. You showed up.',
      body: 'The hardest rep is walking through the door. You just did it.',
    },
    2: {
      headline: 'Two days in a row.',
      body: 'Back-to-back sessions. Your couch is starting to worry.',
    },
    3: {
      headline: 'Three-day streak.',
      body: "That's not luck — that's a habit forming. Keep going.",
    },
    4: {
      headline: 'Four straight days.',
      body: "Momentum is real. You're riding it now.",
    },
    5: {
      headline: 'Five days deep.',
      body: 'Half a week of showing up. Consistency beats motivation every time.',
    },
    6: {
      headline: 'Six days running.',
      body: "One more and you hit a full week. Don't stop now.",
    },
    7: {
      headline: 'One full week.',
      body: 'Seven days of discipline. Chad sees you. The gym sees you.',
    },
    10: {
      headline: 'Double digits.',
      body: 'Ten days in a row. At this point, skipping feels wrong. Good.',
    },
    14: {
      headline: 'Two weeks strong.',
      body: "Fourteen days. You're not 'trying' anymore — you're training.",
    },
    21: {
      headline: 'Three weeks.',
      body: 'They say it takes 21 days to build a habit. Look at you.',
    },
    30: {
      headline: '30-day machine.',
      body: "A full month of showing up. That's not motivation — that's identity.",
    },
    50: {
      headline: 'Fifty days.',
      body: "Most people quit by now. You're still here. That says everything.",
    },
    100: {
      headline: 'Triple digits.',
      body: '100 days. Legend status unlocked. Seriously.',
    },
  };

  if (messages[streak]) return messages[streak];

  if (streak % 7 === 0) {
    const weeks = streak / 7;
    return {
      headline: `${weeks} week${weeks > 1 ? 's' : ''} straight.`,
      body: `${streak} days without missing. The streak is becoming who you are.`,
    };
  }

  if (streak % 10 === 0) {
    return {
      headline: `${streak} days.`,
      body: 'Round number energy. Stack another one tomorrow.',
    };
  }

  return {
    headline: `${streak}-day streak.`,
    body: "Another day in the books. Tomorrow's waiting — show up again.",
  };
}
