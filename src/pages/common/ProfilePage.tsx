import { useEffect, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { LoadingIndicator } from "../../components/common/LoadingIndicator";
import { profileService } from "../../services/profileService";
import { useAuth } from "../../hooks/useAuth";
import type { UserProfileResponse, UserStatus } from "../../types/user.types";
import "./ProfilePage.css";

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

export function ProfilePage() {
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    profileService
      .getProfile()
      .then((data) => {
        setProfile(data);
        setFullName(data.fullName);
        setPhone(data.phone ?? "");
      })
      .catch((err) => setLoadError(getErrorMessage(err, "Không tải được hồ sơ. Vui lòng thử lại.")))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleProfileSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setIsSavingProfile(true);
    try {
      const updated = await profileService.updateProfile({ fullName, phone });
      setProfile(updated);
      updateUser({ fullName: updated.fullName });
      setProfileSuccess("Cập nhật hồ sơ thành công.");
    } catch (err) {
      setProfileError(getErrorMessage(err, "Cập nhật hồ sơ thất bại. Vui lòng thử lại."));
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới nhập lại không khớp.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await profileService.changePassword({ currentPassword, newPassword });
      setPasswordSuccess("Đổi mật khẩu thành công.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(getErrorMessage(err, "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại."));
    } finally {
      setIsSavingPassword(false);
    }
  }

  if (isLoading) {
    return (
      <div className="profile-page">
        <h1>Hồ sơ cá nhân</h1>
        <LoadingIndicator />
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="profile-page">
        <h1>Hồ sơ cá nhân</h1>
        <div className="form-error" role="alert">
          {loadError ?? "Không tải được hồ sơ."}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1>Hồ sơ cá nhân</h1>

      <section className="profile-card">
        <div className="profile-summary">
          <div>
            <div className="profile-summary-name">{profile.fullName}</div>
            <div className="profile-summary-meta">
              @{profile.username} · {ROLE_LABEL[profile.role] ?? profile.role}
            </div>
          </div>
          <span className={`status-badge ${STATUS_CLASS[profile.status]}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            </svg>
            {STATUS_LABEL[profile.status]}
          </span>
        </div>
      </section>

      <section className="profile-card">
        <h2>Thông tin cá nhân</h2>
        <form className="profile-form" onSubmit={handleProfileSubmit}>
          <div className="profile-field">
            <label htmlFor="profile-fullname">Họ và tên</label>
            <input
              id="profile-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-phone">Số điện thoại</label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xxxxxxxx"
            />
          </div>

          {profileError && (
            <div className="form-error" role="alert">
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="form-success" role="status">
              {profileSuccess}
            </div>
          )}

          <button className="profile-submit" type="submit" disabled={isSavingProfile}>
            {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </section>

      <section className="profile-card">
        <h2>Đổi mật khẩu</h2>
        <form className="profile-form" onSubmit={handlePasswordSubmit}>
          <div className="profile-field">
            <label htmlFor="profile-current-password">Mật khẩu hiện tại</label>
            <input
              id="profile-current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-new-password">Mật khẩu mới</label>
            <input
              id="profile-new-password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-confirm-password">Nhập lại mật khẩu mới</label>
            <input
              id="profile-confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {passwordError && (
            <div className="form-error" role="alert">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="form-success" role="status">
              {passwordSuccess}
            </div>
          )}

          <button className="profile-submit" type="submit" disabled={isSavingPassword}>
            {isSavingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </form>
      </section>
    </div>
  );
}
