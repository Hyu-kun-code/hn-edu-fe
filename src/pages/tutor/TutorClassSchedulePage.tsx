import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { classService } from "../../services/classService";
import { scheduleService } from "../../services/scheduleService";
import { DatePicker } from "../../components/common/DatePicker";
import { TimePicker } from "../../components/common/TimePicker";
import { LoadingIndicator } from "../../components/common/LoadingIndicator";
import { DocumentList } from "../../components/common/DocumentList";
import { Modal } from "../../components/common/Modal";
import { useToast } from "../../hooks/useToast";
import type { ClassEntity, Schedule, SchedulePayload, ScheduleStatus } from "../../types/class.types";
import { formatCurrency, formatDate, formatTime } from "../../utils/format";

const STATUS_LABEL: Record<ScheduleStatus, string> = {
  PENDING_APPROVAL: "Chờ duyệt",
  SCHEDULED: "Đã lên lịch",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã huỷ",
  REJECTED: "Bị từ chối",
};

const STATUS_BADGE_CLASS: Record<ScheduleStatus, string> = {
  PENDING_APPROVAL: "status-badge--warning",
  SCHEDULED: "status-badge--info",
  COMPLETED: "status-badge--success",
  CANCELLED: "status-badge--danger",
  REJECTED: "status-badge--danger",
};

function getErrorMessage(err: unknown, fallback: string): string {
  return isAxiosError(err)
    ? ((err.response?.data as { message?: string } | undefined)?.message ?? fallback)
    : fallback;
}

const emptyForm = { sessionDate: "", startTime: "", endTime: "", note: "" };

export function TutorClassSchedulePage() {
  const { showToast } = useToast();
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);

  const [cls, setCls] = useState<ClassEntity | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);
  const [docsScheduleId, setDocsScheduleId] = useState<number | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [classDetail, classSchedules] = await Promise.all([
        classService.getClassById(classId),
        scheduleService.getByClass(classId),
      ]);
      setCls(classDetail);
      setSchedules(classSchedules);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Không tải được thông tin lớp học. Vui lòng thử lại."));
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleComplete(scheduleId: number) {
    setActionError(null);
    setPendingActionId(scheduleId);
    try {
      await scheduleService.complete(scheduleId);
      await loadData();
      showToast("Đã đánh dấu buổi học hoàn thành.");
    } catch (err) {
      setActionError(getErrorMessage(err, "Đánh dấu hoàn thành thất bại. Vui lòng thử lại."));
    } finally {
      setPendingActionId(null);
    }
  }

  function openRequestForm() {
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  }

  async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const payload: SchedulePayload = {
      sessionDate: form.sessionDate,
      startTime: form.startTime,
      endTime: form.endTime,
      note: form.note || undefined,
    };

    try {
      await scheduleService.requestSchedule(classId, payload);
      setIsFormOpen(false);
      await loadData();
      showToast("Đã gửi yêu cầu xếp lịch, chờ Admin duyệt.");
    } catch (err) {
      setFormError(getErrorMessage(err, "Gửi yêu cầu xếp lịch thất bại. Vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="admin-page">
        <h1>Lịch dạy</h1>
        <LoadingIndicator />
      </div>
    );
  }

  if (loadError || !cls) {
    return (
      <div className="admin-page">
        <h1>Lịch dạy</h1>
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
          <Link to="/tutor/classes">← Lớp học của tôi</Link>
          <h1>{cls.name}</h1>
          <p className="admin-hint">
            Học phí: {formatCurrency(cls.tuitionFee)} · Sĩ số: {cls.currentStudents}/{cls.maxStudents}
          </p>
        </div>
        {cls.status === "ACTIVE" && (
          <button type="button" className="admin-btn admin-btn--primary" onClick={openRequestForm}>
            + Đề xuất lịch dạy
          </button>
        )}
      </div>

      {actionError && (
        <div className="form-error" role="alert">
          {actionError}
        </div>
      )}

      {isFormOpen && (
        <section className="admin-card">
          <h2>Đề xuất lịch dạy mới</h2>
          <p className="admin-hint">Yêu cầu sẽ ở trạng thái "Chờ duyệt" cho tới khi Admin duyệt.</p>
          <form className="admin-form" onSubmit={handleFormSubmit}>
            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="req-schedule-date">Ngày học</label>
                <DatePicker
                  id="req-schedule-date"
                  value={form.sessionDate}
                  onChange={(v) => setForm((f) => ({ ...f, sessionDate: v }))}
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="req-schedule-start">Giờ bắt đầu</label>
                <TimePicker
                  id="req-schedule-start"
                  value={form.startTime}
                  onChange={(v) => setForm((f) => ({ ...f, startTime: v }))}
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="req-schedule-end">Giờ kết thúc</label>
                <TimePicker
                  id="req-schedule-end"
                  value={form.endTime}
                  onChange={(v) => setForm((f) => ({ ...f, endTime: v }))}
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="req-schedule-note">Ghi chú</label>
                <input
                  id="req-schedule-note"
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                />
              </div>
            </div>

            {formError && (
              <div className="form-error" role="alert">
                {formError}
              </div>
            )}

            <div className="admin-form-actions">
              <button className="admin-btn admin-btn--primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
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
        <h2>Lịch dạy ({schedules.length})</h2>
        {schedules.length === 0 ? (
          <p className="admin-hint">Lớp học chưa có buổi dạy nào được xếp lịch.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ngày học</th>
                  <th>Giờ học</th>
                  <th>Ghi chú</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td>{formatDate(s.sessionDate)}</td>
                    <td className="num">
                      {formatTime(s.startTime)} - {formatTime(s.endTime)}
                    </td>
                    <td>{s.note || "—"}</td>
                    <td>
                      <span className={`status-badge ${STATUS_BADGE_CLASS[s.status]}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {STATUS_LABEL[s.status]}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--neutral"
                          onClick={() => setDocsScheduleId(s.id)}
                        >
                          Học liệu
                        </button>
                        {s.status === "SCHEDULED" && (
                          <button
                            type="button"
                            className="admin-btn admin-btn--success"
                            disabled={pendingActionId === s.id}
                            onClick={() => handleComplete(s.id)}
                          >
                            Đánh dấu hoàn thành
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-card">
        <h2>Học liệu của lớp</h2>
        <DocumentList classId={classId} canManage />
      </section>

      {docsScheduleId !== null && (
        <Modal title="Học liệu buổi học" onClose={() => setDocsScheduleId(null)}>
          <DocumentList scheduleId={docsScheduleId} canManage />
        </Modal>
      )}
    </div>
  );
}
