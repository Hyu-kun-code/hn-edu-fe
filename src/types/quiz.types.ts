export type QuizCategory = "GRAMMAR" | "VOCABULARY" | "READING";

export interface QuizQuestion {
  id: string;
  quizId: string;
  content: string;
  category: QuizCategory;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  id: string;
  classId: string;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizSubmissionAnswer {
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  answers: QuizSubmissionAnswer[];
  score: number;
  submittedAt: string;
}
