import { useCallback, useEffect, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { classService } from "../../services/classService";
import { quizService } from "../../services/quizService";
import { DatePicker } from "../../components/common/DatePicker";
import { TimePicker } from "../../components/common/TimePicker";
import { LoadingIndicator } from "../../components/common/LoadingIndicator";
import type { ClassEntity } from "../../types/class.types";
import type { Quiz, QuizPayload, QuizSkillType } from "../../types/quiz.types";
import { formatDateTime, toIsoDateTime } from "../../utils/format";

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

interface ChoiceDraft {
  choiceText: string;
  isCorrect: boolean;
}

interface QuestionDraft {
  questionText: string;
  choices: ChoiceDraft[];
}

function emptyQuestion(): QuestionDraft {
  return {
    questionText: "",
    choices: [
      { choiceText: "", isCorrect: true },
      { choiceText: "", isCorrect: false },
    ],
  };
}

const emptyForm = {
  title: "",
  skillType: "GRAMMAR" as QuizSkillType,
  dueDate: "",
  dueTime: "",
  timeLimitMinutes: "",
  questions: [emptyQuestion()] as QuestionDraft[],
};

export function QuizCreatePage() {
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
    try {
      const list = await quizService.getQuizzesByClass(classId);
      setQuizzes(list);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Không tải được danh sách quiz. Vui lòng thử lại."));
    } finally {
      setIsLoadingQuizzes(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClassId !== null) {
      loadQuizzes(selectedClassId);
      setIsFormOpen(false);
    }
  }, [selectedClassId, loadQuizzes]);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(quiz: Quiz) {
    const { date: datePart, time: timePart } = quiz.dueDate
      ? toIsoDateTime(quiz.dueDate)
      : { date: "", time: "" };
    setEditingId(quiz.id);
    setForm({
      title: quiz.title,
      skillType: quiz.skillType,
      dueDate: datePart,
      dueTime: timePart,
      timeLimitMinutes: quiz.timeLimitMinutes ? String(quiz.timeLimitMinutes) : "",
      questions: quiz.questions.map((q) => ({
        questionText: q.questionText,
        choices: q.choices.map((c) => ({ choiceText: c.choiceText, isCorrect: c.isCorrect })),
      })),
    });
    setFormError(null);
    setIsFormOpen(true);
  }

  function addQuestion() {
    setForm((f) => ({ ...f, questions: [...f.questions, emptyQuestion()] }));
  }

  function removeQuestion(qIdx: number) {
    setForm((f) => ({ ...f, questions: f.questions.filter((_, i) => i !== qIdx) }));
  }

  function updateQuestionText(qIdx: number, text: string) {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) => (i === qIdx ? { ...q, questionText: text } : q)),
    }));
  }

  function addChoice(qIdx: number) {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) =>
        i === qIdx ? { ...q, choices: [...q.choices, { choiceText: "", isCorrect: false }] } : q,
      ),
    }));
  }

  function removeChoice(qIdx: number, cIdx: number) {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) =>
        i === qIdx ? { ...q, choices: q.choices.filter((_, j) => j !== cIdx) } : q,
      ),
    }));
  }

  function updateChoiceText(qIdx: number, cIdx: number, text: string) {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) =>
        i === qIdx
          ? { ...q, choices: q.choices.map((c, j) => (j === cIdx ? { ...c, choiceText: text } : c)) }
          : q,
      ),
    }));
  }

  function setCorrectChoice(qIdx: number, cIdx: number) {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) =>
        i === qIdx
          ? { ...q, choices: q.choices.map((c, j) => ({ ...c, isCorrect: j === cIdx })) }
          : q,
      ),
    }));
  }

  async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (form.questions.length === 0) {
      setFormError("Quiz phải có ít nhất 1 câu hỏi.");
      return;
    }
    for (const q of form.questions) {
      if (q.choices.length < 2) {
        setFormError("Mỗi câu hỏi phải có ít nhất 2 lựa chọn.");
        return;
      }
      if (!q.choices.some((c) => c.isCorrect)) {
        setFormError("Mỗi câu hỏi phải có đúng 1 lựa chọn đúng.");
        return;
      }
    }

    if (selectedClassId === null) return;

    const payload: QuizPayload = {
      title: form.title,
      skillType: form.skillType,
      dueDate: form.dueDate ? `${form.dueDate}T${form.dueTime || "23:59"}:00` : undefined,
      timeLimitMinutes: form.timeLimitMinutes ? Number(form.timeLimitMinutes) : undefined,
      questions: form.questions.map((q) => ({
        questionText: q.questionText,
        choices: q.choices.map((c) => ({ choiceText: c.choiceText, isCorrect: c.isCorrect })),
      })),
    };

    setIsSubmitting(true);
    try {
      if (editingId) {
        await quizService.updateQuiz(editingId, payload);
      } else {
        await quizService.createQuiz(selectedClassId, payload);
      }
      setIsFormOpen(false);
      await loadQuizzes(selectedClassId);
    } catch (err) {
      setFormError(getErrorMessage(err, "Lưu quiz thất bại. Vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(quizId: number) {
    if (selectedClassId === null) return;
    if (!window.confirm("Xoá quiz này? Hành động không thể hoàn tác.")) return;
    setActionError(null);
    setPendingActionId(quizId);
    try {
      await quizService.deleteQuiz(quizId);
      await loadQuizzes(selectedClassId);
    } catch (err) {
      setActionError(getErrorMessage(err, "Xoá quiz thất bại. Vui lòng thử lại."));
    } finally {
      setPendingActionId(null);
    }
  }

  if (isLoadingClasses) {
    return (
      <div className="admin-page">
        <h1>Soạn Quiz</h1>
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Soạn Quiz</h1>
        {selectedClassId !== null && (
          <button type="button" className="admin-btn admin-btn--primary" onClick={openCreateForm}>
            + Tạo quiz mới
          </button>
        )}
      </div>

      <section className="admin-card">
        <div className="admin-field">
          <label htmlFor="quiz-class">Lớp học</label>
          <select
            id="quiz-class"
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
      </section>

      {loadError && (
        <div className="form-error" role="alert">
          {loadError}
        </div>
      )}
      {actionError && (
        <div className="form-error" role="alert">
          {actionError}
        </div>
      )}

      {isFormOpen && (
        <section className="admin-card">
          <h2>{editingId ? "Sửa quiz" : "Tạo quiz mới"}</h2>
          <form className="admin-form" onSubmit={handleFormSubmit}>
            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="quiz-title">Tiêu đề</label>
                <input
                  id="quiz-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="quiz-skill">Kỹ năng</label>
                <select
                  id="quiz-skill"
                  value={form.skillType}
                  onChange={(e) => setForm((f) => ({ ...f, skillType: e.target.value as QuizSkillType }))}
                >
                  <option value="GRAMMAR">Ngữ pháp</option>
                  <option value="VOCABULARY">Từ vựng</option>
                  <option value="READING">Đọc hiểu</option>
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="quiz-due-date">Hạn nộp (tuỳ chọn)</label>
                <DatePicker
                  id="quiz-due-date"
                  value={form.dueDate}
                  onChange={(v) => setForm((f) => ({ ...f, dueDate: v }))}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="quiz-due-time">Giờ hết hạn</label>
                <TimePicker
                  id="quiz-due-time"
                  value={form.dueTime}
                  onChange={(v) => setForm((f) => ({ ...f, dueTime: v }))}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="quiz-time-limit">Thời gian làm bài (phút, tuỳ chọn)</label>
                <input
                  id="quiz-time-limit"
                  type="number"
                  min={1}
                  value={form.timeLimitMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, timeLimitMinutes: e.target.value }))}
                />
              </div>
            </div>

            <div className="quiz-question-list">
              {form.questions.map((q, qIdx) => (
                <div className="quiz-question-card" key={qIdx}>
                  <div className="quiz-question-card-header">
                    <label htmlFor={`quiz-question-${qIdx}`}>Câu hỏi {qIdx + 1}</label>
                    {form.questions.length > 1 && (
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger"
                        onClick={() => removeQuestion(qIdx)}
                      >
                        Xoá câu hỏi
                      </button>
                    )}
                  </div>
                  <input
                    id={`quiz-question-${qIdx}`}
                    type="text"
                    placeholder="Nội dung câu hỏi"
                    value={q.questionText}
                    onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                    required
                  />

                  <div className="quiz-choice-list">
                    {q.choices.map((c, cIdx) => (
                      <div className="quiz-choice-row" key={cIdx}>
                        <input
                          type="radio"
                          name={`quiz-correct-${qIdx}`}
                          checked={c.isCorrect}
                          onChange={() => setCorrectChoice(qIdx, cIdx)}
                          aria-label={`Đáp án đúng cho câu ${qIdx + 1}`}
                        />
                        <input
                          type="text"
                          placeholder={`Lựa chọn ${cIdx + 1}`}
                          value={c.choiceText}
                          onChange={(e) => updateChoiceText(qIdx, cIdx, e.target.value)}
                          required
                        />
                        {q.choices.length > 2 && (
                          <button
                            type="button"
                            className="admin-btn admin-btn--neutral"
                            onClick={() => removeChoice(qIdx, cIdx)}
                          >
                            Xoá
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="admin-btn admin-btn--neutral"
                      onClick={() => addChoice(qIdx)}
                    >
                      + Thêm lựa chọn
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="admin-btn admin-btn--neutral" onClick={addQuestion}>
                + Thêm câu hỏi
              </button>
            </div>

            {formError && (
              <div className="form-error" role="alert">
                {formError}
              </div>
            )}

            <div className="admin-form-actions">
              <button className="admin-btn admin-btn--primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--neutral"
                onClick={() => setIsFormOpen(false)}
              >
                Huỷ
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-card">
        <h2>Danh sách quiz ({quizzes.length})</h2>
        {isLoadingQuizzes ? (
          <LoadingIndicator />
        ) : quizzes.length === 0 ? (
          <p className="admin-hint">Lớp này chưa có quiz nào.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Kỹ năng</th>
                  <th>Hạn nộp</th>
                  <th>Số câu hỏi</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz.id}>
                    <td>{quiz.title}</td>
                    <td>{SKILL_LABEL[quiz.skillType]}</td>
                    <td>{quiz.dueDate ? formatDateTime(quiz.dueDate) : "—"}</td>
                    <td className="num">{quiz.questions.length}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--neutral"
                          onClick={() => openEditForm(quiz)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          disabled={pendingActionId === quiz.id}
                          onClick={() => handleDelete(quiz.id)}
                        >
                          Xoá
                        </button>
                      </div>
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
