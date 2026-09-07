import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../utils/constants";
import "./LoginPage.css";

const ROLE_HOME_PATH: Record<string, string> = {
  [ROLES.ADMIN]: "/admin",
  [ROLES.TUTOR]: "/tutor",
  [ROLES.STUDENT]: "/student",
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { user, token } = await authService.login({ email, password });
      login(user, token);
      navigate(ROLE_HOME_PATH[user.role] ?? "/", { replace: true });
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      setError(message ?? "Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
      // Move focus to the error so keyboard/screen-reader users notice it immediately.
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 6.5C4 5.7 4.7 5 5.5 5H12V19H5.5C4.7 19 4 18.3 4 17.5V6.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M20 6.5C20 5.7 19.3 5 18.5 5H12V19H18.5C19.3 19 20 18.3 20 17.5V6.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="auth-brand-name">HNEdu</span>
        </Link>

        <h1>Đăng nhập</h1>
        <p className="auth-subtitle">Đăng nhập để tiếp tục vào lớp học, Quiz và bảng điểm của bạn.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="ban@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Mật khẩu</label>
            <div className="auth-password-row">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
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
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
        <Link to="/" className="auth-back">
          ← Về trang chủ
        </Link>
      </div>
    </div>
  );
}
