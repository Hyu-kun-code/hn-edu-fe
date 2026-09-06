import { api } from "./api";
import type { Quiz, QuizSubmission } from "../types/quiz.types";

export const quizService = {
  getQuizzesByClass: (classId: string) =>
    api.get<Quiz[]>(`/classes/${classId}/quizzes`).then((res) => res.data),

  getQuizById: (id: string) => api.get<Quiz>(`/quizzes/${id}`).then((res) => res.data),

  createQuiz: (quiz: Omit<Quiz, "id">) =>
    api.post<Quiz>("/quizzes", quiz).then((res) => res.data),

  submitQuiz: (quizId: string, answers: { questionId: string; selectedOptionIndex: number }[]) =>
    api.post<QuizSubmission>(`/quizzes/${quizId}/submissions`, { answers }).then((res) => res.data),

  getSubmissionsByQuiz: (quizId: string) =>
    api.get<QuizSubmission[]>(`/quizzes/${quizId}/submissions`).then((res) => res.data),
};
