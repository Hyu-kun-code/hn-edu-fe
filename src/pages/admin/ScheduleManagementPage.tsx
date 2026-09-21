import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { scheduleService } from "../../services/scheduleService";
import { DatePicker } from "../../components/common/DatePicker";
import { TimePicker } from "../../components/common/TimePicker";
import { LoadingIndicator } from "../../components/common/LoadingIndicator";
import { useToast } from "../../hooks/useToast";
import { useConfirm } from "../../hooks/useConfirm";
import type { Schedule, SchedulePayload } from "../../types/class.types";
import { formatDate, formatTime, toIsoDate } from "../../utils/format";

const STATUS_LABEL: Record<string, string> = {
  PENDING_APPROVAL: "Chờ duyệt",
  SCHEDULED: "Đã lên lịch",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã huỷ",
  REJECTED: "Bị từ chối",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
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

export function ScheduleManagementPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ sessionDate: "", startTime: "", endTime: "", note: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [upcoming, pending] = await Promise.all([
        scheduleService.getUpcoming(),
        scheduleService.getPending(),
      ]);
      setSchedules(upcoming);
      setPendingRequests(pending);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Không tải được lịch dạy. Vui lòng thử lại."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openEditForm(schedule: Schedule) {
    setEditingId(schedule.id);
    setForm({
      sessionDate: toIsoDate(schedule.sessionDate),
      startTime: formatTime(schedule.startTime),
      endTime: formatTime(schedule.endTime),
      note: schedule.note ?? "",
    });
    setFormError(null);
  }

  async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingId) return;
    setFormError(null);
    setIsSubmitting(true);

    const payload: SchedulePayload = {
      sessionDate: form.sessionDate,
      startTime: form.startTime,
      endTime: form.endTime,
      note: form.note || undefined,
    };

    try {
      await scheduleService.reschedule(editingId, payload);
      setEditingId(null);
      await loadData();
      showToast("Đã dời lịch dạy.");
    } catch (err) {
      setFormError(getErrorMessage(err, "Dời lịch thất bại. Vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel(scheduleId: number) {
    const ok = await confirm({
      message: "Huỷ buổi dạy này? Hành động không thể hoàn tác.",
      confirmText: "Huỷ lịch",
      danger: true,
    });
    if (!ok) return;
    setActionError(null);
    setPendingActionId(scheduleId);
    try {
      await scheduleService.cancel(scheduleId);
      await loadData();
      showToast("Đã huỷ lịch dạy.");
    } catch (err) {
      setActionError(getErrorMessage(err, "Huỷ lịch thất bại. Vui lòng thử lại."));
    } finally {
      setPendingActionId(null);
    }
  }

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

  async function handleApprove(scheduleId: number) {
    setActionError(null);
    setPendingActionId(scheduleId);
    try {
      await scheduleService.approve(scheduleId);
      await loadData();
      showToast("Đã duyệt lịch dạy.");
    } catch (err) {
      setActionError(getErrorMessage(err, "Duyệt lịch dạy thất bại. Vui lòng thử lại."));
    } finally {
      setPendingActionId(null);
    }
  }

  async function handleReject(scheduleId: number) {
    const ok = await confirm({
      message: "Từ chối yêu cầu xếp lịch này?",
      confirmText: "Từ chối",
      danger: true,
    });
    if (!ok) return;
    setActionError(null);
    setPendingActionId(scheduleId);
    try {
      await scheduleService.reject(scheduleId);
      await loadData();
      showToast("Đã từ chối lịch dạy.");
    } catch (err) {
      setActionError(getErrorMessage(err, "Từ chối lịch dạy thất bại. Vui lòng thử lại."));
    } finally {
      setPendingActionId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="admin-page">
        <h1>Quản lý Lịch dạy</h1>
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Quản lý Lịch dạy</h1>
      <p className="admin-hint">
        Lịch dạy sắp tới trên toàn trung tâm. Để xếp lịch mới cho một lớp, vào{" "}
        <Link to="/admin/classes">Quản lý Lớp học</Link> rồi chọn "Xem lịch".
      </p>

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

      {editingId && (
        <section className="admin-card">
          <h2>Dời lịch dạy</h2>
          <form className="admin-form" onSubmit={handleFormSubmit}>
            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="resched-date">Ngày học</label>
                <DatePicker
                  id="resched-date"
                  value={form.sessionDate}
                  onChange={(v) => setForm((f) => ({ ...f, sessionDate: v }))}
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="resched-start">Giờ bắt đầu</label>
                <TimePicker
                  id="resched-start"
                  value={form.startTime}
                  onChange={(v) => setForm((f) => ({ ...f, startTime: v }))}
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="resched-end">Giờ kết thúc</label>
                <TimePicker
                  id="resched-end"
                  value={form.endTime}
                  onChange={(v) => setForm((f) => ({ ...f, endTime: v }))}
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="resched-note">Ghi chú</label>
                <input
                  id="resched-note"
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
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </button>
              <button type="button" className="admin-btn admin-btn--neutral" onClick={() => setEditingId(null)}>
                Huỷ
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-card">
        <h2>Lịch dạy chờ duyệt ({pendingRequests.length})</h2>
        {pendingRequests.length === 0 ? (
          <p className="admin-hint">Không có yêu cầu xếp lịch nào đang chờ duyệt.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Lớp</th>
                  <th>Ngày học</th>
                  <th>Giờ học</th>
                  <th>Ghi chú</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link to={`/admin/classes/${s.classId}`}>{s.className ?? `Lớp #${s.classId}`}</Link>
                    </td>
                    <td>{formatDate(s.sessionDate)}</td>
                    <td className="num">
                      {formatTime(s.startTime)} - {formatTime(s.endTime)}
                    </td>
                    <td>{s.note || "—"}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--success"
                          disabled={pendingActionId === s.id}
                          onClick={() => handleApprove(s.id)}
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          disabled={pendingActionId === s.id}
                          onClick={() => handleReject(s.id)}
                        >
                          Từ chối
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

      <section className="admin-card">
        <h2>Lịch dạy sắp tới ({schedules.length})</h2>
        {schedules.length === 0 ? (
          <p className="admin-hint">Không có buổi dạy nào sắp tới.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Lớp</th>
                  <th>Ngày học</th>
                  <th>Giờ học</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link to={`/admin/classes/${s.classId}`}>{s.className ?? `Lớp #${s.classId}`}</Link>
                    </td>
                    <td>{formatDate(s.sessionDate)}</td>
                    <td className="num">
                      {formatTime(s.startTime)} - {formatTime(s.endTime)}
                    </td>
                    <td>
                      <span className={`status-badge ${STATUS_BADGE_CLASS[s.status]}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {STATUS_LABEL[s.status]}
                      </span>
                    </td>
                    <td>
                      {s.status === "SCHEDULED" && (
                        <div className="admin-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn--neutral"
                            disabled={pendingActionId === s.id}
                            onClick={() => openEditForm(s)}
                          >
                            Dời lịch
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--success"
                            disabled={pendingActionId === s.id}
                            onClick={() => handleComplete(s.id)}
                          >
                            Hoàn thành
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--danger"
                            disabled={pendingActionId === s.id}
                            onClick={() => handleCancel(s.id)}
                          >
                            Huỷ
                          </button>
                        </div>
                      )}
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
