import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <span>HNEdu</span>
        {user && (
          <nav>
            <span>{user.fullName} ({user.role})</span>
            <Link to="/profile">Hồ sơ</Link>
            <button onClick={logout}>Đăng xuất</button>
          </nav>
        )}
      </header>
      <main className="main-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
