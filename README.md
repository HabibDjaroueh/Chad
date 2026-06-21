# Chad — Voice Workout Tracker

A React Native app that lets gym-goers track their workouts hands-free using voice input through AirPods or any microphone.

## How It Works

1. Hold the mic button and speak your set
2. Whisper API transcribes the audio
3. GPT-4o-mini parses the transcript into structured data
4. The set is saved to Supabase and displayed on screen

**Example inputs:**

- "Set 1 bench press, 135 pounds, 12 reps"
- "Set 2 bench press, 185 pounds, 8 reps"
- "Bench press: 135 for 12, 185 for 8, 205 for 6" *(multiple sets in one recording)*
- "4 sets of squat at 225 for 10 reps" *(repeated sets)*

## Tech Stack


| Layer        | Technology                   |
| ------------ | ---------------------------- |
| App          | React Native + Expo (SDK 54) |
| Language     | TypeScript                   |
| Voice → Text | OpenAI Whisper API           |
| Text → Data  | GPT-4o-mini                  |
| Database     | Supabase (PostgreSQL)        |


## Project Structure

```
src/
├── types/
│   └── workout.ts          # TypeScript types
├── hooks/
│   └── useVoiceRecorder.ts # Hold-to-record mic logic (expo-audio)
├── services/
│   ├── whisper.ts          # Whisper API transcription
│   ├── parser.ts           # GPT-4o-mini workout parsing
│   ├── storage.ts          # Supabase read/write
│   └── supabase.ts         # Supabase client
├── components/
│   ├── RecordButton.tsx    # Animated hold-to-record button
│   └── WorkoutCard.tsx     # Displays exercise + sets breakdown
└── screens/
    └── HomeScreen.tsx      # Main screen
```

## Features

- **Voice recording** via AirPods Pro or any mic
- **Natural language parsing** — handles varied phrasing
- **Multi-set support** — one recording can log multiple sets
- **Exercise grouping** — all sets for the same exercise on the same day are grouped together
- **Date separation** — today's workout is shown separately from history
- **Persistent storage** — workouts saved to Supabase survive app restarts
- **Today's stats** — live volume (lbs) and exercise count

## Database Schema

```sql
create table workout_entries (
  id text primary key,
  timestamp timestamptz not null,
  raw_transcript text not null,
  exercise text,
  sets_data jsonb default '[]',
  unit text,
  notes text,
  created_at timestamptz default now()
);
```

## Environment Variables

Create a `.env` file in the project root:

```
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Running the App

```bash
npm install
npx expo start --clear
```

Scan the QR code with the Expo Go app on your iPhone.

## Roadmap

- [ ] User authentication (each user sees only their own data)
- [ ] Workout history calendar view
- [ ] Personal records tracking
- [ ] Progress charts and analytics
- [ ] App Store release