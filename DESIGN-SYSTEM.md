# EduConnect — Design System (Color Rules)

Quy tắc màu dùng chung cho **toàn bộ 19 màn hình** (Auth, Admin, Gia sư, Học viên) của EduConnect. Dựa trên khuyến nghị của skill `ui-ux-pro-max` (domain `color` + `style` cho "education admin dashboard" và "data-dense dashboard"), kết hợp với brand color đã dùng ở landing page marketing để giữ nhất quán thương hiệu.

> Nguồn: `python scripts/search.py "admin dashboard data table dense management panel" --domain style` và `--domain color "education platform"` (ui-ux-pro-max skill).

## 1. Nguyên tắc chọn màu

1. **Brand color giữ nguyên xuyên suốt** — cùng 3 màu thương hiệu (primary/secondary/accent) dùng ở landing page, để Admin/Gia sư/Học viên vẫn nhận ra là cùng một sản phẩm.
2. **Semantic color tách khỏi brand accent** (theo rule `color-not-only` + `state-clarity` của ui-ux-pro-max) — trạng thái dữ liệu (thành công/cảnh báo/lỗi) dùng bộ màu riêng, không dùng chung với màu CTA thương hiệu, để không gây nhầm "màu cam nghĩa là lỗi hay là nút bấm?".
3. **Style tách theo mục đích màn hình**, cùng token:
   - **Marketing/Landing** → Claymorphism đầy đủ (viền dày, double shadow, nghiêng nhẹ) — đã áp dụng ở landing page.
   - **Admin/Gia sư/Học viên (app screens)** → biến thể "Soft Flat" theo khuyến nghị *Data-Dense Dashboard* (padding gọn 8–16px, viền mảnh 1–1.5px, bo góc nhỏ hơn, không nghiêng) vì đây là màn hình thao tác/đọc dữ liệu lặp lại, không phải màn hình gây ấn tượng một lần.
4. Không dùng màu để truyền đạt thông tin một mình — luôn kèm icon/text (badge trạng thái, không chỉ tô màu ô).
5. Tương phản tối thiểu 4.5:1 cho text thường, 3:1 cho text lớn/icon UI — áp dụng cho cả light & dark mode.

## 2. Bảng màu thương hiệu (Brand tokens)

| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| `--color-primary` | `#4456FF` | `#8B97FF` | CTA chính, link, nav active, track **YLE** (trẻ em) |
| `--color-primary-ink` | `#FFFFFF` | `#1C1832` | Chữ/icon trên nền primary |
| `--color-secondary` | `#FFC94A` | `#FFD873` | Nhãn phụ, badge, track **SCHOOL** (ôn thi phổ thông) |
| `--color-secondary-ink` | `#241F3D` | `#241F3D` | Chữ/icon trên nền secondary |
| `--color-accent` | `#FF6F5E` | `#FF9686` | CTA nổi bật (Đăng ký, Xác nhận, Gửi) |
| `--color-accent-ink` | `#241F3D` | `#241F3D` | Chữ/icon trên nền accent |
| `--color-mint` (brand phụ) | `#05C793` | `#3FE7BC` | Track **CERTIFICATE** (TOEIC/IELTS), tiến độ/thành tích |

## 3. Bảng màu trung tính & bề mặt (Surface tokens — dùng cho Admin/Gia sư/Học viên)

| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| `--color-bg` | `#F7F7FB` | `#17152B` | Nền tổng của app (khác nền giấy ấm của landing — dịu mắt hơn cho màn hình đọc lâu) |
| `--color-surface` | `#FFFFFF` | `#221E3D` | Card, bảng, panel, modal |
| `--color-surface-muted` | `#EEF0F8` | `#2A2648` | Hàng zebra trong bảng, input disabled, nền hover nhẹ |
| `--color-border` | `#DDE1F0` | `#372F5C` | Viền card/input/table (1–1.5px, không dùng viền dày 3px như landing) |
| `--color-ink` | `#241F3D` | `#F3EFFF` | Text chính |
| `--color-ink-soft` | `#6B6584` | `#B7ADD9` | Text phụ, placeholder, label |

## 4. Bảng màu trạng thái (Semantic tokens — tách khỏi brand accent)

| Token | Light | Dark | Ý nghĩa | Áp dụng vào entity thực tế |
|---|---|---|---|---|
| `--color-success` | `#0E9F6E` | `#34D399` | Hoàn thành / hợp lệ | `schedules.status = COMPLETED`, `payments.status = PAID`, gia sư đã được duyệt |
| `--color-warning` | `#D97706` | `#FBBF24` | Cần chú ý / chờ xử lý | `payments.status = PARTIAL`, gia sư chờ duyệt, lịch sắp đến hạn |
| `--color-danger` | `#DC2626` | `#F87171` | Lỗi / chặn | `schedules.status = CANCELLED`, `payments.status = UNPAID`, gia sư bị khoá |
| `--color-info` | `#2563EB` | `#60A5FA` | Thông tin / trung lập | `schedules.status = SCHEDULED`, thông báo hệ thống |

**Quy ước riêng cho Quiz** (3 category cố định, mỗi loại một hue để quét mắt nhanh trong bảng thống kê):
- `GRAMMAR` → `--color-primary`
- `VOCABULARY` → `--color-secondary`
- `READING` → `--color-info`

## 5. Typography

| Vai trò | Font | Dùng ở đâu |
|---|---|---|
| Display (heading lớn, hero) | `Baloo 2` | **Chỉ dùng ở Landing/marketing** — không dùng trong bảng dữ liệu vì quá "playful" cho màn hình tác vụ |
| Heading + Body (app screens) | `Manrope` | Toàn bộ Admin/Gia sư/Học viên — heading và body dùng chung 1 family, khác trọng số (700 cho heading, 400/500 cho body) |
| Số liệu (điểm, tiền, ngày, giờ) | `JetBrains Mono` + `font-variant-numeric: tabular-nums` | Bảng lương, bảng điểm Quiz, công nợ — để số thẳng cột |

## 6. Hiệu ứng theo loại màn hình

| | Landing (marketing) | App screens (Admin/Gia sư/Học viên) |
|---|---|---|
| Viền | 3px, màu đậm | 1–1.5px, `--color-border` |
| Bóng đổ | double shadow kiểu clay | 1 lớp bóng mờ, nhẹ (`0 1px 2px` + `0 2px 8px`) |
| Bo góc | 18–26px | 10–14px |
| Nghiêng/động tác | có (nghiêng nhẹ, bob) | không — giao diện tác vụ cần ổn định thị giác |
| Khoảng cách | rộng rãi | gọn (8–16px), ưu tiên hiển thị nhiều dữ liệu

## 7. Checklist trước khi ghép màn hình mới

- [ ] Không dùng emoji làm icon — dùng SVG
- [ ] Mọi phần tử click được có `cursor: pointer`
- [ ] Trạng thái focus rõ ràng khi dùng bàn phím (`:focus-visible`)
- [ ] Tương phản chữ tối thiểu 4.5:1 ở cả light/dark mode
- [ ] Trạng thái dữ liệu (badge) luôn có icon/text kèm màu, không chỉ tô màu
- [ ] Test ở 375px / 768px / 1024px / 1440px
- [ ] Tôn trọng `prefers-reduced-motion`
