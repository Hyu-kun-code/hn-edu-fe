import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { LoadingIndicator } from "../../components/common/LoadingIndicator";
import { classService } from "../../services/classService";
import { quizService } from "../../services/quizService";
import type { ClassEntity } from "../../types/class.types";
import type { Quiz, QuizSkillType } from "../../types/quiz.types";
import { formatDateTime } from "../../utils/format";

const SKILL_LABEL: Record<QuizSkillType, string> = {
  GRAMMAR: "Ngữ pháp",
  VOCABULARY: "Từ vựng",
  READING: "Đọc hiểu",
};

function getErrorMessage(err: unknown, fallback: string): string {
  return isAxiosError(err)
    ? ((err.response?.data as { message?: string } | undefined)?.message ?? fallback)
    : fallback;
}

export function StudentClassQuizzesPage() {
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);

  const [cls, setCls] = useState<ClassEntity | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [classDetail, quizList] = await Promise.all([
        classService.getClassById(classId),
        quizService.getQuizzesByClass(classId),
      ]);
      setCls(classDetail);
      setQuizzes(quizList);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Không tải được danh sách quiz. Vui lòng thử lại."));
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="admin-page">
        <h1>Quiz</h1>
        <LoadingIndicator />
      </div>
    );
  }

  if (loadError || !cls) {
    return (
      <div className="admin-page">
        <h1>Quiz</h1>
        <div className="form-error" role="alert">
          {loadError ?? "Không tìm thấy lớp học."}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <Link to="/student/classes">← Lớp học của tôi</Link>
          <h1>Quiz — {cls.name}</h1>
        </div>
      </div>

      <section className="admin-card">
        <h2>Danh sách quiz ({quizzes.length})</h2>
        {quizzes.length === 0 ? (
          <p className="admin-hint">Lớp này chưa có quiz nào.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Kỹ năng</th>
                  <th>Hạn nộp</th>
                  <th>Thời gian làm bài</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz.id}>
                    <td>{quiz.title}</td>
                    <td>{SKILL_LABEL[quiz.skillType]}</td>
                    <td>{quiz.dueDate ? formatDateTime(quiz.dueDate) : "—"}</td>
                    <td className="num">
                      {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} phút` : "Không giới hạn"}
                    </td>
                    <td>
                      <Link to={`/student/quizzes/${quiz.id}`} className="admin-btn admin-btn--primary">
                        Vào làm bài
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
