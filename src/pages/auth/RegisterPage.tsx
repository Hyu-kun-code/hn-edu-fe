import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { authService } from "../../services/authService";
import type { UserRole } from "../../types/user.types";
import { BrandMark } from "../../components/common/BrandMark";
import "./LoginPage.css";

export function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authService.register({ username, password, fullName, phone, role });
      navigate("/login", {
        replace: true,
        state: { registered: true },
      });
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      setError(message ?? "Đăng ký thất bại. Vui lòng thử lại.");
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <BrandMark />

        <h1>Đăng ký</h1>
        <p className="auth-subtitle">Tạo tài khoản để tham gia lớp học tại HNEdu.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="register-fullname">Họ và tên</label>
            <input
              id="register-fullname"
              type="text"
              autoComplete="name"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-username">Tên đăng nhập</label>
            <input
              id="register-username"
              type="text"
              autoComplete="username"
              placeholder="Tối thiểu 4 ký tự"
              minLength={4}
              maxLength={50}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-phone">Số điện thoại</label>
            <input
              id="register-phone"
              type="tel"
              autoComplete="tel"
              placeholder="09xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-role">Bạn đăng ký với vai trò</label>
            <select
              id="register-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="STUDENT">Học viên / Phụ huynh</option>
              <option value="TUTOR">Gia sư</option>
            </select>
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">Mật khẩu</label>
            <div className="auth-password-row">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Tối thiểu 6 ký tự"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path
                      d="M10.6 10.7A2.5 2.5 0 0013.3 13.4M6.6 6.7C4.4 8.1 2.7 10 1.5 12c1.9 3.3 5.4 6.5 10.5 6.5 1.8 0 3.4-.4 4.8-1.1M9.9 4.7A9.6 9.6 0 0112 4.5c5.1 0 8.6 3.2 10.5 6.5-.6 1-1.3 2-2.2 2.9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M1.5 12C3.4 8.7 6.9 5.5 12 5.5S20.6 8.7 22.5 12C20.6 15.3 17.1 18.5 12 18.5S3.4 15.3 1.5 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error" role="alert" tabIndex={-1} ref={errorRef}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16.2" r="1" fill="currentColor" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting && <span className="auth-spinner" aria-hidden="true" />}
            {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
        <Link to="/" className="auth-back">
          ← Về trang chủ
        </Link>
      </div>
    </div>
  );
}
