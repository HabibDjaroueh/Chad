import { WeightUnit } from '../types/workout';

const LBS_TO_KG = 0.453592;
const KG_TO_LBS = 2.20462;

export function convertWeight(weight: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return weight;
  const converted = from === 'lbs' ? weight * LBS_TO_KG : weight * KG_TO_LBS;
  return Math.round(converted * 10) / 10;
}

export function formatWeight(weight: number): string {
  return Number.isInteger(weight) ? weight.toString() : weight.toFixed(1);
}

export function setVolume(set: { reps: number; weight: number }, unit: WeightUnit, displayUnit: WeightUnit): number {
  const weight = convertWeight(set.weight, unit, displayUnit);
  return set.reps * weight;
}
