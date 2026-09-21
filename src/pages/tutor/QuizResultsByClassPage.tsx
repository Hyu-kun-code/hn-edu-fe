import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { LoadingIndicator } from "../../components/common/LoadingIndicator";
import { classService } from "../../services/classService";
import { quizService } from "../../services/quizService";
import type { ClassEntity } from "../../types/class.types";
import type { QuestionStat, Quiz, QuizSubmission } from "../../types/quiz.types";
import { formatDateTime } from "../../utils/format";

function getErrorMessage(err: unknown, fallback: string): string {
  return isAxiosError(err)
    ? ((err.response?.data as { message?: string } | undefined)?.message ?? fallback)
    : fallback;
}

export function QuizResultsByClassPage() {
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [statistics, setStatistics] = useState<QuestionStat[]>([]);

  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    classService
      .getMyClasses()
      .then((list) => {
        setClasses(list);
        if (list.length > 0) setSelectedClassId(list[0].id);
      })
      .catch((err) => setLoadError(getErrorMessage(err, "Không tải được danh sách lớp học.")))
      .finally(() => setIsLoadingClasses(false));
  }, []);

  const loadQuizzes = useCallback(async (classId: number) => {
    setLoadError(null);
    setIsLoadingQuizzes(true);
    setSelectedQuizId(null);
    setSubmissions([]);
    setStatistics([]);
    try {
      const list = await quizService.getQuizzesByClass(classId);
      setQuizzes(list);
      if (list.length > 0) setSelectedQuizId(list[0].id);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Không tải được danh sách quiz. Vui lòng thử lại."));
    } finally {
      setIsLoadingQuizzes(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClassId !== null) loadQuizzes(selectedClassId);
  }, [selectedClassId, loadQuizzes]);

  const loadResults = useCallback(async (quizId: number) => {
    setLoadError(null);
    setIsLoadingResults(true);
    try {
      const [submissionList, statList] = await Promise.all([
        quizService.getSubmissions(quizId),
        quizService.getStatistics(quizId),
      ]);
      setSubmissions(submissionList);
      setStatistics(statList);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Không tải được kết quả quiz. Vui lòng thử lại."));
    } finally {
      setIsLoadingResults(false);
    }
  }, []);

  useEffect(() => {
    if (selectedQuizId !== null) loadResults(selectedQuizId);
  }, [selectedQuizId, loadResults]);

  if (isLoadingClasses) {
    return (
      <div className="admin-page">
        <h1>Kết quả Quiz theo lớp</h1>
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Kết quả Quiz theo lớp</h1>

      <section className="admin-card">
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="results-class">Lớp học</label>
            <select
              id="results-class"
              value={selectedClassId ?? ""}
              onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : null)}
            >
              {classes.length === 0 && <option value="">-- Bạn chưa được phân công lớp nào --</option>}
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label htmlFor="results-quiz">Quiz</label>
            <select
              id="results-quiz"
              value={selectedQuizId ?? ""}
              disabled={isLoadingQuizzes || quizzes.length === 0}
              onChange={(e) => setSelectedQuizId(e.target.value ? Number(e.target.value) : null)}
            >
              {quizzes.length === 0 && <option value="">-- Lớp chưa có quiz --</option>}
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {loadError && (
        <div className="form-error" role="alert">
          {loadError}
        </div>
      )}

      {selectedQuizId !== null && (
        <>
          <section className="admin-card">
            <h2>Bài nộp ({submissions.length})</h2>
            {isLoadingResults ? (
              <LoadingIndicator />
            ) : submissions.length === 0 ? (
              <p className="admin-hint">Chưa có học viên nào nộp bài.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Học viên</th>
                      <th>Điểm</th>
                      <th>Số câu đúng</th>
                      <th>Nộp lúc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr key={s.id}>
                        <td>{s.studentName}</td>
                        <td className="num">{s.score}</td>
                        <td className="num">
                          {s.totalCorrect}/{s.totalQuestions}
                        </td>
                        <td>{formatDateTime(s.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-card">
            <h2>Thống kê theo câu hỏi</h2>
            {isLoadingResults ? (
              <LoadingIndicator />
            ) : statistics.length === 0 ? (
              <p className="admin-hint">Chưa có dữ liệu thống kê.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Câu hỏi</th>
                      <th>Lượt nộp</th>
                      <th>Số đúng</th>
                      <th>Tỉ lệ đúng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.map((stat) => (
                      <tr key={stat.questionId}>
                        <td>{stat.questionText}</td>
                        <td className="num">{stat.totalSubmissions}</td>
                        <td className="num">{stat.totalCorrect}</td>
                        <td className="num">{stat.correctPercentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
