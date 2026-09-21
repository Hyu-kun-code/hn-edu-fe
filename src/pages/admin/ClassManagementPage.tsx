import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { LoadingIndicator } from "../../components/common/LoadingIndicator";
import { useToast } from "../../hooks/useToast";
import { useConfirm } from "../../hooks/useConfirm";
import { classService } from "../../services/classService";
import { adminUserService } from "../../services/adminUserService";
import type { ClassEntity, CreateClassPayload, LevelType } from "../../types/class.types";
import type { AdminUserResponse } from "../../types/user.types";
import { digitsOnly, formatCurrency, formatDateTime, formatThousands } from "../../utils/format";

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

const emptyForm = {
  name: "",
  levelType: "YLE" as LevelType,
  levelDetail: "",
  tutorId: "",
  tuitionFee: "",
  maxStudents: "",
};

export function ClassManagementPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [tutors, setTutors] = useState<AdminUserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [classList, users] = await Promise.all([
        classService.getClasses(),
        adminUserService.getUsers(),
      ]);
      setClasses(classList);
      setTutors(users.filter((u) => u.role === "TUTOR" && u.status === "ACTIVE"));
    } catch (err) {
      setLoadError(getErrorMessage(err, "Không tải được danh sách lớp học. Vui lòng thử lại."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(cls: ClassEntity) {
    setEditingId(cls.id);
    setForm({
      name: cls.name,
      levelType: cls.levelType,
      levelDetail: cls.levelDetail ?? "",
      tutorId: String(cls.tutorId),
      tuitionFee: String(cls.tuitionFee),
      maxStudents: String(cls.maxStudents),
    });
    setFormError(null);
    setIsFormOpen(true);
  }

  async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const tutorId = Number(form.tutorId);
    const tuitionFee = Number(form.tuitionFee);
    const maxStudents = Number(form.maxStudents);

    if (!tutorId) {
      setFormError("Vui lòng chọn gia sư phụ trách.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await classService.updateClass(editingId, {
          name: form.name,
          levelDetail: form.levelDetail || undefined,
          tutorId,
          tuitionFee,
          maxStudents,
        });
      } else {
        const payload: CreateClassPayload = {
          name: form.name,
          levelType: form.levelType,
          levelDetail: form.levelDetail || undefined,
          tutorId,
          tuitionFee,
          maxStudents,
        };
        await classService.createClass(payload);
      }
      setIsFormOpen(false);
      await loadData();
      showToast(editingId ? "Đã cập nhật lớp học." : "Đã tạo lớp học mới.");
    } catch (err) {
      setFormError(getErrorMessage(err, "Lưu lớp học thất bại. Vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleClose(id: number) {
    const ok = await confirm({
      message: "Đóng lớp học này? Học viên sẽ không thể đăng ký thêm và hành động này không thể hoàn tác.",
      confirmText: "Đóng lớp",
      danger: true,
    });
    if (!ok) return;
    setActionError(null);
    setPendingActionId(id);
    try {
      await classService.closeClass(id);
      await loadData();
      showToast("Đã đóng lớp học.");
    } catch (err) {
      setActionError(getErrorMessage(err, "Đóng lớp thất bại. Vui lòng thử lại."));
    } finally {
      setPendingActionId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="admin-page">
        <h1>Quản lý Lớp học</h1>
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Quản lý Lớp học</h1>
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreateForm}>
          + Tạo lớp học
        </button>
      </div>

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
          <h2>{editingId ? "Sửa lớp học" : "Tạo lớp học mới"}</h2>
          <form className="admin-form" onSubmit={handleFormSubmit}>
            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="class-name">Tên lớp</label>
                <input
                  id="class-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="class-level-type">Phân loại</label>
                <select
                  id="class-level-type"
                  value={form.levelType}
                  disabled={!!editingId}
                  onChange={(e) => setForm((f) => ({ ...f, levelType: e.target.value as LevelType }))}
                >
                  <option value="YLE">YLE (Trẻ em)</option>
                  <option value="SCHOOL">Ôn thi phổ thông</option>
                  <option value="CERTIFICATE">Luyện chứng chỉ</option>
                </select>
              </div>

              <div className="admin-field">
                <label htmlFor="class-level-detail">Mô tả trình độ</label>
                <input
                  id="class-level-detail"
                  type="text"
                  placeholder="VD: Movers, TOEIC 500-650"
                  value={form.levelDetail}
                  onChange={(e) => setForm((f) => ({ ...f, levelDetail: e.target.value }))}
                />
              </div>

              <div className="admin-field">
                <label htmlFor="class-tutor">Gia sư phụ trách</label>
                <select
                  id="class-tutor"
                  value={form.tutorId}
                  onChange={(e) => setForm((f) => ({ ...f, tutorId: e.target.value }))}
                  required
                >
                  <option value="">-- Chọn gia sư --</option>
                  {tutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} (@{t.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-field">
                <label htmlFor="class-tuition">Học phí (VNĐ)</label>
                <input
                  id="class-tuition"
                  type="text"
                  inputMode="numeric"
                  value={formatThousands(form.tuitionFee)}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tuitionFee: digitsOnly(e.target.value) }))
                  }
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="class-max-students">Sĩ số tối đa</label>
                <input
                  id="class-max-students"
                  type="number"
                  min={1}
                  value={form.maxStudents}
                  onChange={(e) => setForm((f) => ({ ...f, maxStudents: e.target.value }))}
                  required
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
        <h2>Danh sách lớp học ({classes.length})</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên lớp</th>
                <th>Phân loại</th>
                <th>Gia sư</th>
                <th>Học phí</th>
                <th>Sĩ số</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id}>
                  <td>
                    <Link to={`/admin/classes/${cls.id}`}>{cls.name}</Link>
                  </td>
                  <td>
                    <span className={`level-badge ${LEVEL_BADGE_CLASS[cls.levelType]}`}>
                      {cls.levelDetail || LEVEL_LABEL[cls.levelType]}
                    </span>
                  </td>
                  <td>{cls.tutorName ?? "—"}</td>
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
                  <td>{formatDateTime(cls.createdAt)}</td>
                  <td>
                    <div className="admin-actions">
                      <Link to={`/admin/classes/${cls.id}`} className="admin-btn admin-btn--neutral">
                        Xem lịch
                      </Link>
                      {cls.status === "ACTIVE" && (
                        <>
                          <button
                            type="button"
                            className="admin-btn admin-btn--neutral"
                            onClick={() => openEditForm(cls)}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--danger"
                            disabled={pendingActionId === cls.id}
                            onClick={() => handleClose(cls.id)}
                          >
                            Đóng lớp
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
