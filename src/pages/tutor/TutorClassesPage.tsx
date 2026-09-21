import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { LoadingIndicator } from "../../components/common/LoadingIndicator";
import { classService } from "../../services/classService";
import { scheduleService } from "../../services/scheduleService";
import type { ClassEntity, LevelType, Schedule } from "../../types/class.types";
import { formatCurrency, formatDate, formatTime } from "../../utils/format";

const LEVEL_LABEL: Record<LevelType, string> = {
  YLE: "YLE (Trẻ em)",
  SCHOOL: "Ôn thi phổ thông",
  CERTIFICATE: "Luyện chứng chỉ",
};

const LEVEL_BADGE_CLASS: Record<LevelType, string> = {
  YLE: "level-badge--yle",
  SCHOOL: "level-badge--school",
  CERTIFICATE: "level-badge--certificate",
};

function getErrorMessage(err: unknown, fallback: string): string {
  return isAxiosError(err)
    ? ((err.response?.data as { message?: string } | undefined)?.message ?? fallback)
    : fallback;
}

export function TutorClassesPage() {
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [upcoming, setUpcoming] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([classService.getMyClasses(), scheduleService.getUpcoming()])
      .then(([classList, schedules]) => {
        setClasses(classList);
        setUpcoming(schedules);
      })
      .catch((err) => setLoadError(getErrorMessage(err, "Không tải được dữ liệu lớp học. Vui lòng thử lại.")))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="admin-page">
        <h1>Lớp học của tôi</h1>
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Lớp học của tôi</h1>

      {loadError && (
        <div className="form-error" role="alert">
          {loadError}
        </div>
      )}

      <section className="admin-card">
        <h2>Lớp đang dạy ({classes.length})</h2>
        {classes.length === 0 ? (
          <p className="admin-hint">Bạn chưa được phân công lớp học nào.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên lớp</th>
                  <th>Phân loại</th>
                  <th>Học phí</th>
                  <th>Sĩ số</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.id}>
                    <td>{cls.name}</td>
                    <td>
                      <span className={`level-badge ${LEVEL_BADGE_CLASS[cls.levelType]}`}>
                        {cls.levelDetail || LEVEL_LABEL[cls.levelType]}
                      </span>
                    </td>
                    <td className="num">{formatCurrency(cls.tuitionFee)}</td>
                    <td className="num">
                      {cls.currentStudents}/{cls.maxStudents}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${cls.status === "ACTIVE" ? "status-badge--success" : "status-badge--danger"}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {cls.status === "ACTIVE" ? "Đang mở" : "Đã đóng"}
                      </span>
                    </td>
                    <td>
                      <Link to={`/tutor/classes/${cls.id}`} className="admin-btn admin-btn--neutral">
                        Xem lịch
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-card">
        <h2>Lịch dạy sắp tới ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <p className="admin-hint">Không có buổi dạy nào sắp tới.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Lớp</th>
                  <th>Ngày học</th>
                  <th>Giờ học</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link to={`/tutor/classes/${s.classId}`}>{s.className ?? `Lớp #${s.classId}`}</Link>
                    </td>
                    <td>{formatDate(s.sessionDate)}</td>
                    <td className="num">
                      {formatTime(s.startTime)} - {formatTime(s.endTime)}
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
