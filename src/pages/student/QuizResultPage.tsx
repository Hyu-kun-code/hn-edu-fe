import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { LoadingIndicator } from "../../components/common/LoadingIndicator";
import { quizService } from "../../services/quizService";
import type { QuizSubmission } from "../../types/quiz.types";
import { formatDateTime } from "../../utils/format";

function getErrorMessage(err: unknown, fallback: string): string {
  return isAxiosError(err)
    ? ((err.response?.data as { message?: string } | undefined)?.message ?? fallback)
    : fallback;
}

export function QuizResultPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const id = Number(quizId);

  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    quizService
      .getMySubmission(id)
      .then(setSubmission)
      .catch((err) => setLoadError(getErrorMessage(err, "Không tải được kết quả. Vui lòng thử lại.")))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="admin-page">
        <h1>Kết quả quiz</h1>
        <LoadingIndicator />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="admin-page">
        <h1>Kết quả quiz</h1>
        <div className="form-error" role="alert">
          {loadError}
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="admin-page">
        <h1>Kết quả quiz</h1>
        <p className="admin-hint">
          Bạn chưa làm bài này. <Link to="/student/classes">Quay lại Lớp học của tôi</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Kết quả quiz</h1>

      <section className="admin-card">
        <p>
          Điểm: <strong>{submission.score}</strong> ({submission.totalCorrect}/{submission.totalQuestions}{" "}
          câu đúng)
        </p>
        <p className="admin-hint">Nộp lúc: {formatDateTime(submission.submittedAt)}</p>
      </section>

      <div className="quiz-question-list">
        {submission.answers.map((a, idx) => (
          <section className="admin-card quiz-question-card" key={a.questionId}>
            <p>
              <strong>
                Câu {idx + 1}: {a.questionText}
              </strong>{" "}
              <span
                className={`status-badge ${a.isCorrect ? "status-badge--success" : "status-badge--danger"}`}
              >
                {a.isCorrect ? "Đúng" : "Sai"}
              </span>
            </p>
            <p>Bạn chọn: {a.selectedChoiceText ?? "(bỏ trống)"}</p>
            {!a.isCorrect && <p>Đáp án đúng: {a.correctChoiceText}</p>}
          </section>
        ))}
      </div>
    </div>
  );
}
