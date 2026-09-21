import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { LoadingIndicator } from "../../components/common/LoadingIndicator";
import { adminUserService } from "../../services/adminUserService";
import type { AdminUserResponse, UserStatus } from "../../types/user.types";
import { formatDateTime } from "../../utils/format";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  TUTOR: "Gia sư",
  STUDENT: "Học viên",
};

const STATUS_LABEL: Record<UserStatus, string> = {
  PENDING: "Chờ duyệt",
  ACTIVE: "Đang hoạt động",
  LOCKED: "Đã khoá",
  REJECTED: "Bị từ chối",
};

const STATUS_CLASS: Record<UserStatus, string> = {
  PENDING: "status-badge--warning",
  ACTIVE: "status-badge--success",
  LOCKED: "status-badge--danger",
  REJECTED: "status-badge--danger",
};

function getErrorMessage(err: unknown, fallback: string): string {
  return isAxiosError(err)
    ? ((err.response?.data as { message?: string } | undefined)?.message ?? fallback)
    : fallback;
}

export function TutorManagementPage() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [pendingTutors, setPendingTutors] = useState<AdminUserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [allUsers, tutorsPending] = await Promise.all([
        adminUserService.getUsers(),
        adminUserService.getPendingTutors(),
      ]);
      setUsers(allUsers);
      setPendingTutors(tutorsPending);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Không tải được danh sách người dùng. Vui lòng thử lại."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function runAction(id: number, action: (id: number) => Promise<AdminUserResponse>) {
    setActionError(null);
    setPendingActionId(id);
    try {
      await action(id);
      await loadData();
    } catch (err) {
      setActionError(getErrorMessage(err, "Thao tác thất bại. Vui lòng thử lại."));
    } finally {
      setPendingActionId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="admin-page">
        <h1>Quản lý Gia sư</h1>
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Quản lý Gia sư</h1>

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

      <section className="admin-card">
        <h2>Gia sư chờ duyệt ({pendingTutors.length})</h2>
        {pendingTutors.length === 0 ? (
          <p className="admin-hint">Không có gia sư nào đang chờ duyệt.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Họ và tên</th>
                  <th>Tên đăng nhập</th>
                  <th>Số điện thoại</th>
                  <th>Ngày đăng ký</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pendingTutors.map((tutor) => (
                  <tr key={tutor.id}>
                    <td>{tutor.fullName}</td>
                    <td>@{tutor.username}</td>
                    <td>{tutor.phone || "—"}</td>
                    <td>{formatDateTime(tutor.createdAt)}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--success"
                          disabled={pendingActionId === tutor.id}
                          onClick={() => runAction(tutor.id, adminUserService.approve)}
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          disabled={pendingActionId === tutor.id}
                          onClick={() => runAction(tutor.id, adminUserService.reject)}
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
        <h2>Tất cả người dùng ({users.length})</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Tên đăng nhập</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>@{u.username}</td>
                  <td>{ROLE_LABEL[u.role] ?? u.role}</td>
                  <td>
                    <span className={`status-badge ${STATUS_CLASS[u.status]}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      {STATUS_LABEL[u.status]}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      {u.status === "LOCKED" ? (
                        <button
                          type="button"
                          className="admin-btn admin-btn--success"
                          disabled={pendingActionId === u.id}
                          onClick={() => runAction(u.id, adminUserService.unlock)}
                        >
                          Mở khoá
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          disabled={pendingActionId === u.id || u.status === "PENDING"}
                          onClick={() => runAction(u.id, adminUserService.lock)}
                        >
                          Khoá
                        </button>
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
