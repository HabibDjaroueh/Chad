import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

export async function transcribeAudio(audioUri: string): Promise<string> {
  const fileInfo = await FileSystem.getInfoAsync(audioUri);
  if (!fileInfo.exists) throw new Error('Audio file not found');

  const formData = new FormData();

  // Append the audio file
  formData.append('file', {
    uri: audioUri,
    name: 'audio.m4a',
    type: 'audio/m4a',
  } as any);

  formData.append('model', 'whisper-1');
  formData.append('language', 'en');

  // Hint Whisper about gym terminology
  formData.append(
    'prompt',
    'Gym workout tracking. Sets, reps, weight in pounds or kilograms. Exercises like bench press, squat, deadlift, curl.'
  );

  const response = await axios.post(
    'https://api.openai.com/v1/audio/transcriptions',
    formData,
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.text as string;
}
