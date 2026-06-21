import axios from 'axios';
import { SetDetail } from '../types/workout';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

export async function parseWorkoutFromTranscript(transcript: string): Promise<{
  exercise: string | null;
  sets: SetDetail[];
  unit: 'lbs' | 'kg';
  notes?: string;
}> {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a gym workout parser. Extract workout data from natural language and return ONLY valid JSON.

The user may describe one set or multiple sets in a single message. Always return an array of sets.

Return this exact structure:
{
  "exercise": "exercise name in lowercase",
  "sets": [
    { "setNumber": 1, "reps": number, "weight": number },
    { "setNumber": 2, "reps": number, "weight": number }
  ],
  "unit": "lbs" or "kg",
  "notes": "any extra info or null"
}

Examples:
- "Set 1 bench press 135 for 12" → sets: [{"setNumber":1,"reps":12,"weight":135}]
- "Bench press: 135 for 12, 185 for 8, 205 for 6" → sets: [{"setNumber":1,"reps":12,"weight":135},{"setNumber":2,"reps":8,"weight":185},{"setNumber":3,"reps":6,"weight":205}]
- "4 sets of squat at 225 for 10 reps" → sets: [{"setNumber":1,"reps":10,"weight":225},{"setNumber":2,"reps":10,"weight":225},{"setNumber":3,"reps":10,"weight":225},{"setNumber":4,"reps":10,"weight":225}]

If you cannot parse a workout, return: { "error": "could not parse" }
Return ONLY the JSON, no explanation.`,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      temperature: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const content = response.data.choices[0].message.content as string;

  try {
    const parsed = JSON.parse(content);
    if (parsed.error) return { exercise: null, sets: [], unit: 'lbs' };
    return {
      exercise: parsed.exercise ?? null,
      sets: parsed.sets ?? [],
      unit: parsed.unit ?? 'lbs',
      notes: parsed.notes ?? undefined,
    };
  } catch {
    return { exercise: null, sets: [], unit: 'lbs' };
  }
}
