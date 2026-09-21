export type QuizSkillType = "GRAMMAR" | "VOCABULARY" | "READING";

export interface QuizChoice {
  id: number;
  choiceText: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: number;
  questionText: string;
  orderIndex: number;
  choices: QuizChoice[];
}

export interface Quiz {
  id: number;
  classId: number;
  title: string;
  skillType: QuizSkillType;
  createdBy: number;
  dueDate?: string;
  timeLimitMinutes?: number;
  createdAt: string;
  questions: QuizQuestion[];
}

export interface QuizChoicePayload {
  choiceText: string;
  isCorrect: boolean;
}

export interface QuizQuestionPayload {
  questionText: string;
  choices: QuizChoicePayload[];
}

export interface QuizPayload {
  title: string;
  skillType: QuizSkillType;
  dueDate?: string;
  timeLimitMinutes?: number;
  questions: QuizQuestionPayload[];
}

export interface QuizAnswerPayload {
  questionId: number;
  selectedChoiceId?: number;
}

export interface QuizAnswerResult {
  questionId: number;
  questionText: string;
  selectedChoiceId?: number;
  selectedChoiceText?: string;
  correctChoiceId: number;
  correctChoiceText: string;
  isCorrect: boolean;
}

export interface QuizSubmission {
  id: number;
  quizId: number;
  studentUserId: number;
  studentName: string;
  submittedAt: string;
  score: number;
  totalCorrect: number;
  totalQuestions: number;
  answers: QuizAnswerResult[];
}

export interface QuestionStat {
  questionId: number;
  questionText: string;
  totalSubmissions: number;
  totalCorrect: number;
  correctPercentage: number;
}
