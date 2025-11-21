// Core data types for the quiz application

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  likely: number;
  explanation: string;
  skillName?: string;
  skillDefinition?: string;
}

export interface ShuffledOption {
  id: number;
  text: string;
}

export interface ShuffledQuestion {
  id: number;
  text: string;
  options: ShuffledOption[];
  correctOptionId: number;
  likely: number;
  explanation: string;
  skillName?: string;
  skillDefinition?: string;
}

export interface Answer {
  questionId: number;
  selectedOptionId: number;
  isCorrect: boolean;
  likely: number;
  taskId?: string;
  selectedOption?: string;
  timestamp?: string;
}

export interface TestResult {
  session_id: string;
  timestamp: string;
  user_id: string;
  task_id: string;
  selected_option: string;
  is_correct: boolean;
}

export interface QuizStats {
  answered: number;
  correct: number;
  avgDifficultyCorrect: number | null;
}

export interface IssueReport {
  questionId: number;
  questionText: string;
  selectedOption: string;
  correctOption: string;
  userNote: string;
  timestamp: string;
}
