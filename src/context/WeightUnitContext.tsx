import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeightUnit } from '../types/workout';

const STORAGE_KEY = '@chad/weight_unit';

type ContextValue = {
  unit: WeightUnit;
  setUnit: (unit: WeightUnit) => void;
  loaded: boolean;
};

const WeightUnitContext = createContext<ContextValue | null>(null);

export function WeightUnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<WeightUnit>('lbs');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === 'kg' || value === 'lbs') setUnitState(value);
      setLoaded(true);
    });
  }, []);

  const setUnit = useCallback((next: WeightUnit) => {
    setUnitState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  return (
    <WeightUnitContext.Provider value={{ unit, setUnit, loaded }}>
      {children}
    </WeightUnitContext.Provider>
  );
}

export function useWeightUnit() {
  const ctx = useContext(WeightUnitContext);
  if (!ctx) throw new Error('useWeightUnit must be used within WeightUnitProvider');
  return ctx;
}
