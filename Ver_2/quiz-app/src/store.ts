import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question, ShuffledQuestion, Answer, IssueReport } from './types';
import { sortByLikely, shuffleOptions } from './utils';

interface QuizStore {
  // Data
  questions: ShuffledQuestion[];
  currentIndex: number;
  answers: Answer[];
  trainingList: Set<number>;
  reportsQueue: IssueReport[];
  dataVersion: string;
  sessionId: string;
  userId: string;
  
  // Actions
  initializeQuestions: (rawQuestions: Question[]) => void;
  setCurrentIndex: (index: number) => void;
  submitAnswer: (questionId: number, selectedOptionId: number) => void;
  addToTraining: (questionId: number) => void;
  removeFromTraining: (questionId: number) => void;
  clearTrainingList: () => void;
  reportIssue: (report: IssueReport) => void;
  resetQuiz: () => void;
  getQuestionById: (id: number) => ShuffledQuestion | undefined;
  setUserId: (userId: string) => void;
}

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      questions: [],
      currentIndex: 0,
      answers: [],
      trainingList: new Set(),
      reportsQueue: [],
      dataVersion: '',
      sessionId: generateSessionId(),
      userId: 'anonymous',

      initializeQuestions: (rawQuestions: Question[]) => {
        const sorted = sortByLikely(rawQuestions);
        const shuffled = sorted.map(shuffleOptions);
        set({
          questions: shuffled,
          dataVersion: new Date().toISOString(),
          currentIndex: 0,
          answers: [],
          trainingList: new Set(),
          sessionId: generateSessionId(),
        });
      },

      setCurrentIndex: (index: number) => {
        set({ currentIndex: index });
      },

      submitAnswer: (questionId: number, selectedOptionId: number) => {
        const state = get();
        const question = state.questions.find((q) => q.id === questionId);
        if (!question) return;

        const isCorrect = selectedOptionId === question.correctOptionId;
        const selectedOptionObj = question.options.find((opt) => opt.id === selectedOptionId);
        
        const answer: Answer = {
          questionId,
          selectedOptionId,
          isCorrect,
          likely: question.likely,
          taskId: (question as any).taskId || `task_${questionId}`,
          selectedOption: selectedOptionObj?.text || '',
          timestamp: new Date().toISOString(),
        };

        // Remove any existing answer for this question before adding the new one
        set((state) => ({
          answers: [
            ...state.answers.filter(a => a.questionId !== questionId),
            answer
          ],
        }));
      },

      addToTraining: (questionId: number) => {
        set((state) => ({
          trainingList: new Set([...state.trainingList, questionId]),
        }));
      },

      removeFromTraining: (questionId: number) => {
        set((state) => {
          const newSet = new Set(state.trainingList);
          newSet.delete(questionId);
          return { trainingList: newSet };
        });
      },

      clearTrainingList: () => {
        set({ trainingList: new Set() });
      },

      reportIssue: (report: IssueReport) => {
        set((state) => ({
          reportsQueue: [...state.reportsQueue, report],
        }));
        // In a real app, send to backend here
        console.log('Issue reported:', report);
      },

      resetQuiz: () => {
        set({
          currentIndex: 0,
          answers: [],
          trainingList: new Set(),
          reportsQueue: [],
          sessionId: generateSessionId(),
        });
      },

      setUserId: (userId: string) => {
        set({ userId });
      },

      getQuestionById: (id: number) => {
        return get().questions.find((q) => q.id === id);
      },
    }),
    {
      name: 'quiz-storage',
      partialize: (state) => ({
        questions: state.questions,
        currentIndex: state.currentIndex,
        answers: state.answers,
        trainingList: Array.from(state.trainingList), // Convert Set to Array for JSON
        reportsQueue: state.reportsQueue,
        dataVersion: state.dataVersion,
        sessionId: state.sessionId,
        userId: state.userId,
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        trainingList: new Set(persistedState.trainingList || []), // Convert back to Set
      }),
    }
  )
);
