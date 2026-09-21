import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { LoadingIndicator } from "../../components/common/LoadingIndicator";
import { DocumentList } from "../../components/common/DocumentList";
import { Modal } from "../../components/common/Modal";
import { classService } from "../../services/classService";
import { scheduleService } from "../../services/scheduleService";
import type { ClassEntity, Schedule, ScheduleStatus } from "../../types/class.types";
import { formatDate, formatTime } from "../../utils/format";

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

export function StudentClassMaterialsPage() {
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);

  const [cls, setCls] = useState<ClassEntity | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [docsScheduleId, setDocsScheduleId] = useState<number | null>(null);

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

  if (isLoading) {
    return (
      <div className="admin-page">
        <h1>Học liệu</h1>
        <LoadingIndicator />
      </div>
    );
  }

  if (loadError || !cls) {
    return (
      <div className="admin-page">
        <h1>Học liệu</h1>
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
          <h1>Học liệu — {cls.name}</h1>
        </div>
      </div>

      <section className="admin-card">
        <h2>Học liệu chung của lớp</h2>
        <DocumentList classId={classId} canManage={false} />
      </section>

      <section className="admin-card">
        <h2>Học liệu theo buổi học ({schedules.length})</h2>
        {schedules.length === 0 ? (
          <p className="admin-hint">Lớp học chưa có buổi dạy nào được xếp lịch.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ngày học</th>
                  <th>Giờ học</th>
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
                    <td>
                      <span className={`status-badge ${STATUS_BADGE_CLASS[s.status]}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {STATUS_LABEL[s.status]}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn--neutral"
                        onClick={() => setDocsScheduleId(s.id)}
                      >
                        Học liệu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {docsScheduleId !== null && (
        <Modal title="Học liệu buổi học" onClose={() => setDocsScheduleId(null)}>
          <DocumentList scheduleId={docsScheduleId} canManage={false} />
        </Modal>
      )}
    </div>
  );
}
