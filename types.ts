export enum InputMode {
  TEXT = 'TEXT',
  FILE = 'FILE'
}

export interface StudySession {
  sessionNumber: number;
  intervalLabel: string; // e.g., "Today", "In 2 days"
  dayOffset: number; // Days from start date
  method: string; // e.g., "Feynman Technique", "Flashcards"
  focusDescription: string;
  durationMinutes: number;
}

export interface LearningAnalysis {
  topic: string;
  estimatedMinutesTotal: number;
  recommendedRepetitions: number;
  difficultyRating: 'Easy' | 'Moderate' | 'Complex' | 'Advanced';
  keyConcepts: string[];
  studyPlan: StudySession[];
  scientificRationale: string; // Why this schedule?
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}