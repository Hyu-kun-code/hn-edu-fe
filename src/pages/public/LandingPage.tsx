import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

export function LandingPage() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(() => {
    try {
      return localStorage.getItem("educonnect-theme") as "light" | "dark" | null;
    } catch {
      return null;
    }
  });
  const [submitted, setSubmitted] = useState(false);

  const isDark = useMemo(() => {
    if (theme) return theme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, [theme]);

  function toggleTheme() {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("educonnect-theme", next);
    } catch {
      // localStorage unavailable — theme just won't persist
    }
  }

  function handleEnrollSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="landing-page" data-theme={theme ?? undefined}>
      <header>
        <div className="wrap nav">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 6.5C4 5.7 4.7 5 5.5 5H12V19H5.5C4.7 19 4 18.3 4 17.5V6.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M20 6.5C20 5.7 19.3 5 18.5 5H12V19H18.5C19.3 19 20 18.3 20 17.5V6.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </span>
            EduConnect
          </div>
          <nav className="nav-links">
            <a href="#courses">Khoá học</a>
            <a href="#progress">Theo dõi tiến độ</a>
            <a href="#testimonials">Học viên nói gì</a>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="theme-toggle"
              type="button"
              aria-label="Chuyển giao diện sáng/tối"
              title="Chuyển giao diện sáng/tối"
              onClick={toggleTheme}
            >
              {isDark ? (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                  <path d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 1010.5 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 2.5V5M12 19V21.5M4.2 4.2L6 6M18 18L19.8 19.8M2.5 12H5M19 12H21.5M4.2 19.8L6 18M18 6L19.8 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
            <Link className="btn btn-primary" to="/login" style={{ padding: "10px 20px", fontSize: 14 }}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="eyebrow">Trung tâm Anh ngữ EduConnect</p>
              <h1>Học tiếng Anh vui như giờ ra chơi, tiến bộ rõ từng tuần</h1>
              <p className="lead">
                Từ bé học Cambridge Starters đến người đi làm luyện IELTS 7.0 — một lộ trình rõ ràng, gia sư được duyệt kỹ, và
                bảng điểm Quiz bạn xem được mỗi ngày, không cần hỏi group Zalo.
              </p>
              <div className="hero-ctas">
                <a className="btn btn-primary" href="#enroll">
                  Đăng ký học thử miễn phí
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a className="btn btn-ghost" href="#courses">
                  Xem lộ trình lớp học
                </a>
              </div>
            </div>
`
            <div className="hero-stage" aria-hidden="true">
              <div className="badge-card clay clay--a b1 float">
                <span className="level">Movers</span>
                <span className="label">YLE · 7–9 tuổi</span>
              </div>
              <div className="badge-card clay clay--d b2 float delay1">
                <span className="level">IELTS 6.5</span>
                <span className="label">Luyện thi chứng chỉ</span>
              </div>
              <div className="badge-card clay clay--b b3 float delay2">
                <span className="level">TOEIC 650+</span>
                <span className="label">Người đi làm</span>
              </div>
              <div className="badge-card clay clay--c b4 float delay3">
                <span className="level">Flyers</span>
                <span className="label">YLE · 10–12 tuổi</span>
              </div>
              <div className="streak-card clay float delay1">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C12 2 6 8 6 13a6 6 0 0012 0c0-2-1-3.5-2-5 0 2-1 3-2 3-1.5 0-2-1.5-1-3.5C13.5 5 12.5 3 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <span>
                  <span className="num">12</span>
                  <span className="txt">buổi học liên tiếp không nghỉ</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="stats">
          <div className="wrap stats-row">
            <div className="stat clay clay--a">
              <div className="num">27</div>
              <div className="desc">lớp đang mở trong tháng này</div>
            </div>
            <div className="stat clay clay--b">
              <div className="num">94%</div>
              <div className="desc">học viên đạt mục tiêu band điểm sau khoá</div>
            </div>
            <div className="stat clay clay--c">
              <div className="num">3.200+</div>
              <div className="desc">câu hỏi Quiz được chấm tự động mỗi tháng</div>
            </div>
            <div className="stat clay clay--d">
              <div className="num">128</div>
              <div className="desc">phụ huynh & học viên theo dõi tiến độ mỗi tuần</div>
            </div>
          </div>
        </section>

        <section id="courses">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">Khoá học</p>
              <h2>Hai lộ trình, một trung tâm</h2>
              <p>Lớp học được xếp theo đúng nhóm đối tượng — không dồn trẻ em và người luyện chứng chỉ vào chung một khung chương trình.</p>
            </div>

            <div className="track">
              <div className="track-title">
                <span className="dot" style={{ background: "var(--tone-a-border)" }} />
                <h3>Dành cho thiếu nhi & học sinh phổ thông</h3>
              </div>
              <div className="card-grid">
                <div className="course-card clay clay--a">
                  <span className="level">Starters</span>
                  <h4>4–6 tuổi</h4>
                  <p className="meta">Làm quen tiếng Anh qua trò chơi, thẻ từ vựng và bài hát. Sĩ số 8 bé/lớp.</p>
                  <span className="chip">T3 · T5 — 17:00</span>
                </div>
                <div className="course-card clay clay--a">
                  <span className="level">Movers</span>
                  <h4>7–9 tuổi</h4>
                  <p className="meta">Xây nền ngữ pháp cơ bản, luyện nghe-nói phản xạ, Quiz chấm điểm sau mỗi buổi.</p>
                  <span className="chip">T2 · T4 — 18:00</span>
                </div>
                <div className="course-card clay clay--a">
                  <span className="level">Flyers</span>
                  <h4>10–12 tuổi</h4>
                  <p className="meta">Chuẩn bị chứng chỉ YLE Flyers, tăng cường đọc hiểu và viết đoạn ngắn.</p>
                  <span className="chip">T6 · CN — 09:00</span>
                </div>
                <div className="course-card clay clay--a">
                  <span className="level">Ôn thi vào 10</span>
                  <h4>Học sinh lớp 8–9</h4>
                  <p className="meta">Bám sát cấu trúc đề thi tuyển sinh, luyện đề và chữa lỗi ngữ pháp thường gặp.</p>
                  <span className="chip">T3 · T7 — 19:00</span>
                </div>
              </div>
            </div>

            <div className="track">
              <div className="track-title">
                <span className="dot" style={{ background: "var(--tone-d-border)" }} />
                <h3>Luyện thi chứng chỉ cho người đi làm</h3>
              </div>
              <div className="card-grid">
                <div className="course-card clay clay--d">
                  <span className="level">TOEIC 500–650</span>
                  <h4>Nền tảng công sở</h4>
                  <p className="meta">Chiến thuật làm bài Listening–Reading, học buổi tối sau giờ làm.</p>
                  <span className="chip">T2 · T4 — 20:00</span>
                </div>
                <div className="course-card clay clay--d">
                  <span className="level">TOEIC 650–850</span>
                  <h4>Nâng cao</h4>
                  <p className="meta">Luyện đề sát giờ thi thật, chữa chi tiết từng câu sai theo thống kê Quiz.</p>
                  <span className="chip">T3 · T5 — 20:00</span>
                </div>
                <div className="course-card clay clay--d">
                  <span className="level">IELTS 5.5–6.5</span>
                  <h4>Overall trung cấp</h4>
                  <p className="meta">Cân bằng 4 kỹ năng, chú trọng Writing Task 2 và phát âm.</p>
                  <span className="chip">T7 · CN — 08:30</span>
                </div>
                <div className="course-card clay clay--d">
                  <span className="level">IELTS 6.5–7.5</span>
                  <h4>Overall nâng cao</h4>
                  <p className="meta">Luyện phản xạ Speaking 1-kèm-1, feedback bài viết trong 48 giờ.</p>
                  <span className="chip">T2 · T6 — 19:30</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="progress"
          style={{ background: "var(--surface)", borderTop: "3px solid var(--border-ink)", borderBottom: "3px solid var(--border-ink)" }}
        >
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">Theo dõi tiến độ</p>
              <h2>Phụ huynh và học viên thấy tiến độ mỗi ngày</h2>
              <p>Mỗi bài Quiz được chấm và lưu chi tiết theo từng câu — không chỉ một con số tổng điểm mơ hồ.</p>
            </div>

            <div className="progress-wrap">
              <div className="dash clay clay--b">
                <div className="dash-head">
                  <div>
                    <div className="who">Nguyễn Minh Anh</div>
                    <div className="cls">Lớp Movers B2 · Gia sư: Cô Trang</div>
                  </div>
                  <span className="paid-chip">Học phí: đã đóng đến 30/11</span>
                </div>

                <div className="week-row" aria-label="Điểm danh trong tuần">
                  <div className="day on">
                    <span className="l">T2</span>✓
                  </div>
                  <div className="day on">
                    <span className="l">T3</span>✓
                  </div>
                  <div className="day off">
                    <span className="l">T4</span>–
                  </div>
                  <div className="day on">
                    <span className="l">T5</span>✓
                  </div>
                  <div className="day make">
                    <span className="l">T6</span>BÙ
                  </div>
                  <div className="day off">
                    <span className="l">T7</span>–
                  </div>
                  <div className="day off">
                    <span className="l">CN</span>–
                  </div>
                </div>

                <div className="vocab">
                  <svg className="ring" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="var(--border-ink)" strokeWidth="6" opacity="0.15" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      fill="none"
                      stroke="var(--mint)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="163.4"
                      strokeDashoffset="41"
                      transform="rotate(-90 32 32)"
                    />
                    <text x="32" y="37" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="700" fontSize="14" fill="var(--ink)">
                      75%
                    </text>
                  </svg>
                  <div>
                    <div className="n">186 / 250</div>
                    <div className="l">từ vựng mục tiêu học kỳ này</div>
                  </div>
                </div>
              </div>

              <div className="chart-card clay">
                <div className="chart-head">
                  <h4>Điểm Quiz 6 bài gần nhất</h4>
                  <span className="avg">TB 7.8/10</span>
                </div>
                <div className="legend">
                  <span>
                    <i style={{ background: "var(--primary)" }} />
                    Ngữ pháp
                  </span>
                  <span>
                    <i style={{ background: "var(--secondary)" }} />
                    Từ vựng
                  </span>
                  <span>
                    <i style={{ background: "var(--accent)" }} />
                    Đọc hiểu
                  </span>
                </div>
                <svg
                  viewBox="0 0 460 190"
                  width="100%"
                  role="img"
                  aria-label="Biểu đồ điểm 6 bài quiz gần nhất, tăng dần từ 6 đến 9 trên 10"
                >
                  <line x1="30" y1="10" x2="30" y2="150" stroke="var(--ink-soft)" strokeOpacity="0.3" />
                  <line x1="30" y1="150" x2="450" y2="150" stroke="var(--ink-soft)" strokeOpacity="0.3" />
                  <text x="6" y="14" fontFamily="JetBrains Mono" fontSize="11" fill="var(--ink-soft)">
                    10
                  </text>
                  <text x="6" y="82" fontFamily="JetBrains Mono" fontSize="11" fill="var(--ink-soft)">
                    5
                  </text>
                  <text x="10" y="154" fontFamily="JetBrains Mono" fontSize="11" fill="var(--ink-soft)">
                    0
                  </text>

                  <polyline points="60,96 130,82 200,68 270,54 340,40 410,26" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="60,110 130,96 200,96 270,68 340,68 410,54" fill="none" stroke="var(--secondary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="60,124 130,124 200,110 270,96 340,82 410,68" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                  <circle cx="410" cy="26" r="5" fill="var(--primary)" />
                  <circle cx="410" cy="54" r="5" fill="var(--secondary)" />
                  <circle cx="410" cy="68" r="5" fill="var(--accent)" />

                  <text x="55" y="168" fontFamily="JetBrains Mono" fontSize="10.5" fill="var(--ink-soft)">B1</text>
                  <text x="125" y="168" fontFamily="JetBrains Mono" fontSize="10.5" fill="var(--ink-soft)">B2</text>
                  <text x="195" y="168" fontFamily="JetBrains Mono" fontSize="10.5" fill="var(--ink-soft)">B3</text>
                  <text x="265" y="168" fontFamily="JetBrains Mono" fontSize="10.5" fill="var(--ink-soft)">B4</text>
                  <text x="335" y="168" fontFamily="JetBrains Mono" fontSize="10.5" fill="var(--ink-soft)">B5</text>
                  <text x="403" y="168" fontFamily="JetBrains Mono" fontSize="10.5" fill="var(--ink-soft)">B6</text>
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">Học viên & phụ huynh nói gì</p>
              <h2>Không phải quảng cáo, là bảng điểm biết nói</h2>
            </div>
            <div className="testi-grid">
              <div className="testi clay clay--a">
                <p className="quote">
                  "Trước đây mình toàn nhắn Zalo hỏi cô giáo con học tới đâu. Giờ mở app lên là thấy điểm Quiz từng buổi, khỏi
                  phải hỏi nữa."
                </p>
                <div className="who">
                  <span className="avatar">HN</span>
                  <div>
                    <div className="name">Chị Hồng Nhung</div>
                    <div className="role">Phụ huynh bé Bảo An, lớp Movers</div>
                  </div>
                </div>
              </div>
              <div className="testi clay clay--d">
                <p className="quote">
                  "Đi làm cả ngày, tối chỉ còn 1 tiếng. Chatbot giúp mình luyện lại ngữ pháp lúc 10 giờ đêm, lớp học thì tập
                  trung vào Speaking. Từ 5.5 lên 6.5 sau 4 tháng."
                </p>
                <div className="who">
                  <span className="avatar">QH</span>
                  <div>
                    <div className="name">Anh Quốc Huy</div>
                    <div className="role">Nhân viên ngân hàng, luyện IELTS</div>
                  </div>
                </div>
              </div>
              <div className="testi clay clay--c">
                <p className="quote">
                  "Làm Quiz xong là biết điểm liền, không phải chờ cô chấm. Câu nào sai còn biết sai chỗ nào để ôn lại trước
                  khi thi."
                </p>
                <div className="who">
                  <span className="avatar">GB</span>
                  <div>
                    <div className="name">Em Gia Bảo</div>
                    <div className="role">Học sinh lớp 9, ôn thi vào 10</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="enroll">
          <div className="wrap">
            <div className="enroll clay" style={{ background: "var(--accent)" }}>
              <div>
                <p className="eyebrow" style={{ color: "var(--accent-ink)", opacity: 0.75 }}>
                  Học thử miễn phí
                </p>
                <h2>Giữ chỗ 1 buổi học thử — không cần thẻ, không ràng buộc</h2>
                <p>
                  Gia sư sẽ liên hệ trong 24 giờ để xếp lớp đúng trình độ, dù bạn là phụ huynh tìm lớp cho con hay người đi
                  làm ôn chứng chỉ.
                </p>
              </div>
              <form className="form" onSubmit={handleEnrollSubmit}>
                <input type="text" placeholder="Họ tên phụ huynh / học viên" required disabled={submitted} />
                <input type="tel" placeholder="Số điện thoại" required disabled={submitted} />
                <select required disabled={submitted} defaultValue="">
                  <option value="" disabled>
                    Bạn quan tâm lộ trình nào?
                  </option>
                  <option>Trẻ em / học sinh phổ thông (YLE)</option>
                  <option>Người đi làm luyện TOEIC</option>
                  <option>Người đi làm luyện IELTS</option>
                </select>
                <button className="btn btn-primary" type="submit" disabled={submitted}>
                  Giữ chỗ học thử
                </button>
                <p className="form-note" style={{ color: "var(--accent-ink)" }}>
                  Không thu phí giữ chỗ. Huỷ lịch bất cứ lúc nào.
                </p>
                {submitted && (
                  <p className="success-msg" style={{ color: "var(--accent-ink)" }}>
                    Đã ghi nhận! Gia sư sẽ gọi lại trong 24 giờ 🎉
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap foot-row">
          <span>© EduConnect — Trung tâm Anh ngữ nội bộ, không phải marketplace mở.</span>
          <span>
            <Link to="/register">Đăng ký</Link> · <Link to="/login">Đăng nhập</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
