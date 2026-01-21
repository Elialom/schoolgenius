import { Question, StudentResult, TestSettings } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'math_app_settings',
  RESULTS: 'math_app_results',
};

const DEFAULT_SETTINGS: TestSettings = {
  grade: '5',
  subject: 'Mathematics',
  durationMinutes: 20,
  questions: [],
};

export const getSettings = (): TestSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (data) {
    const parsed = JSON.parse(data);
    // Ensure subject exists for older stored data
    if (!parsed.subject) {
      parsed.subject = 'Mathematics';
    }
    return parsed;
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: TestSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getResults = (): StudentResult[] => {
  const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
  return data ? JSON.parse(data) : [];
};

export const saveResult = (result: StudentResult): void => {
  const current = getResults();
  const updated = [result, ...current];
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(updated));
};

export const clearResults = (): void => {
  localStorage.removeItem(STORAGE_KEYS.RESULTS);
}