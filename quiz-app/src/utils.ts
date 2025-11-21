import type { Question, ShuffledQuestion, Answer, QuizStats } from './types';

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Shuffle options for a question and track the correct answer
 */
export function shuffleOptions(question: Question): ShuffledQuestion {
  const optionsWithIds = question.options.map((text, index) => ({
    id: index,
    text,
  }));
  
  const shuffledOptions = shuffleArray(optionsWithIds);
  
  // Find which option has the correct ID
  const correctOption = shuffledOptions.find(
    (opt) => opt.id === question.correctIndex
  );
  
  return {
    id: question.id,
    text: question.text,
    options: shuffledOptions,
    correctOptionId: correctOption!.id,
    likely: question.likely,
    explanation: question.explanation,
    skillName: question.skillName,
    skillDefinition: question.skillDefinition,
  };
}

/**
 * Sort questions by likelihood (easiest first)
 */
export function sortByLikely(questions: Question[]): Question[] {
  return [...questions].sort((a, b) => {
    if (a.likely === b.likely) {
      return Math.random() - 0.5; // Random order for ties
    }
    return b.likely - a.likely; // Descending (higher likely = easier = first)
  });
}

/**
 * Calculate quiz statistics
 */
export function computeStats(answers: Answer[]): QuizStats {
  const answered = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  
  const correctAnswers = answers.filter((a) => a.isCorrect);
  const avgDifficultyCorrect = correctAnswers.length > 0
    ? correctAnswers.reduce((sum, a) => sum + (1 - a.likely), 0) / correctAnswers.length
    : null;
  
  return {
    answered,
    correct,
    avgDifficultyCorrect,
  };
}

/**
 * Sanitize text to prevent XSS
 */
export function sanitizeText(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
