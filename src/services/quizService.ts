import { api } from "./api";
import type {
  Quiz,
  QuizAnswerPayload,
  QuizPayload,
  QuizSubmission,
  QuestionStat,
} from "../types/quiz.types";
import type { ApiResponse } from "../types/user.types";
import { formatDateTime } from "../utils/format";

function toRequestPayload(payload: QuizPayload) {
  return { ...payload, dueDate: payload.dueDate ? formatDateTime(payload.dueDate) : undefined };
}

export const quizService = {
  getQuizzesByClass: (classId: number) =>
    api.get<ApiResponse<Quiz[]>>(`/classes/${classId}/quizzes`).then((res) => res.data.result),

  getQuizById: (id: number) =>
    api.get<ApiResponse<Quiz>>(`/quizzes/${id}`).then((res) => res.data.result),

  createQuiz: (classId: number, payload: QuizPayload) =>
    api
      .post<ApiResponse<Quiz>>(`/classes/${classId}/quizzes`, toRequestPayload(payload))
      .then((res) => res.data.result),

  updateQuiz: (id: number, payload: QuizPayload) =>
    api
      .put<ApiResponse<Quiz>>(`/quizzes/${id}`, toRequestPayload(payload))
      .then((res) => res.data.result),

  deleteQuiz: (id: number) => api.delete<ApiResponse<void>>(`/quizzes/${id}`).then((res) => res.data),

  submit: (id: number, answers: QuizAnswerPayload[]) =>
    api
      .post<ApiResponse<QuizSubmission>>(`/quizzes/${id}/submit`, { answers })
      .then((res) => res.data.result),

  getSubmissions: (id: number) =>
    api
      .get<ApiResponse<QuizSubmission[]>>(`/quizzes/${id}/submissions`)
      .then((res) => res.data.result),

  getMySubmission: (id: number) =>
    api
      .get<ApiResponse<QuizSubmission>>(`/quizzes/${id}/submissions/me`)
      .then((res) => res.data.result)
      .catch((err) => {
        if (err?.response?.status === 404) return null;
        throw err;
      }),

  getStatistics: (id: number) =>
    api
      .get<ApiResponse<QuestionStat[]>>(`/quizzes/${id}/statistics`)
      .then((res) => res.data.result),
};
