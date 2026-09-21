import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { LoadingIndicator } from "../../components/common/LoadingIndicator";
import { quizService } from "../../services/quizService";
import type { Quiz } from "../../types/quiz.types";

function getErrorMessage(err: unknown, fallback: string): string {
  return isAxiosError(err)
    ? ((err.response?.data as { message?: string } | undefined)?.message ?? fallback)
    : fallback;
}

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function QuizTakePage() {
  const { quizId } = useParams<{ quizId: string }>();
  const id = Number(quizId);
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | undefined>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const existing = await quizService.getMySubmission(id);
        if (cancelled) return;
        if (existing) {
          navigate(`/student/quizzes/${id}/result`, { replace: true });
          return;
        }
        const data = await quizService.getQuizById(id);
        if (cancelled) return;
        setQuiz(data);
        setAnswers(Object.fromEntries(data.questions.map((q) => [q.id, undefined])));
        if (data.timeLimitMinutes) setRemainingSeconds(data.timeLimitMinutes * 60);
      } catch (err) {
        if (!cancelled) setLoadError(getErrorMessage(err, "Không tải được đề quiz. Vui lòng thử lại."));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const handleSubmit = useCallback(async () => {
    if (!quiz) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await quizService.submit(
        id,
        quiz.questions.map((q) => ({ questionId: q.id, selectedChoiceId: answers[q.id] })),
      );
      navigate(`/student/quizzes/${id}/result`, { replace: true });
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Nộp bài thất bại. Vui lòng thử lại."));
      setIsSubmitting(false);
    }
  }, [quiz, id, answers, navigate]);

  useEffect(() => {
    if (remainingSeconds === null) return;
    if (remainingSeconds <= 0) {
      if (!hasAutoSubmitted.current) {
        hasAutoSubmitted.current = true;
        handleSubmit();
      }
      return;
    }
    const timer = setTimeout(() => setRemainingSeconds((s) => (s !== null ? s - 1 : s)), 1000);
    return () => clearTimeout(timer);
  }, [remainingSeconds, handleSubmit]);

  if (isLoading) {
    return (
      <div className="admin-page">
        <h1>Làm bài quiz</h1>
        <LoadingIndicator />
      </div>
    );
  }

  if (loadError || !quiz) {
    return (
      <div className="admin-page">
        <h1>Làm bài quiz</h1>
        <div className="form-error" role="alert">
          {loadError ?? "Không tìm thấy quiz."}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>{quiz.title}</h1>
        {remainingSeconds !== null && (
          <span className="status-badge status-badge--warning">
            Còn lại: {formatCountdown(remainingSeconds)}
          </span>
        )}
      </div>

      <div className="quiz-question-list">
        {quiz.questions.map((q, qIdx) => (
          <section className="admin-card quiz-question-card" key={q.id}>
            <p>
              <strong>
                Câu {qIdx + 1}: {q.questionText}
              </strong>
            </p>
            <div className="quiz-choice-list">
              {q.choices.map((c) => (
                <label className="quiz-choice-row" key={c.id}>
                  <input
                    type="radio"
                    name={`answer-${q.id}`}
                    checked={answers[q.id] === c.id}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: c.id }))}
                  />
                  {c.choiceText}
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>

      {submitError && (
        <div className="form-error" role="alert">
          {submitError}
        </div>
      )}

      <div className="admin-form-actions">
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Đang nộp bài..." : "Nộp bài"}
        </button>
      </div>
    </div>
  );
}
