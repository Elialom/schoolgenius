export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct option (0-3)
}

export type Subject = 'Mathematics' | 'Science' | 'English' | 'History' | 'Geography' | 'Computer Science';

export interface TestSettings {
  grade: string;
  subject: Subject;
  durationMinutes: number;
  questions: Question[];
}

export interface StudentResult {
  id: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  date: string;
  answers: number[]; // Array of selected indices
  questions?: Question[]; // Snapshot of questions taken
  subject?: string;
}

export enum AppMode {
  LANDING = 'LANDING',
  ADMIN = 'ADMIN',
  STUDENT_LOGIN = 'STUDENT_LOGIN',
  STUDENT_TEST = 'STUDENT_TEST',
  STUDENT_RESULT = 'STUDENT_RESULT'
}