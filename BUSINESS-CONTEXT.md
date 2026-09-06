# BUSINESS CONTEXT — EduConnect
## Hệ thống quản lý Trung tâm Tiếng Anh

## 1. Bài toán nghiệp vụ

Một trung tâm Anh ngữ quản lý học viên, gia sư, lịch dạy, học phí hiện đang làm thủ công (Excel, Zalo group), gây khó khăn trong việc theo dõi tiến độ học tập, tính lương, và thu học phí. Hệ thống **EduConnect** số hoá toàn bộ quy trình vận hành của **một trung tâm Anh ngữ nội bộ** (không phải marketplace mở cho gia sư tự do đăng ký công khai), đồng thời bổ sung module Quiz tự động chấm điểm và chatbot AI hỗ trợ học viên luyện tiếng Anh ngoài giờ học chính.

## 2. Đối tượng sử dụng (Actor)

| Vai trò | Mô tả |
|---|---|
| **Admin** | Nhân viên/chủ trung tâm — quản lý toàn bộ vận hành: duyệt gia sư, tạo lớp, xếp lịch, quản lý học phí, xem báo cáo |
| **Gia sư (Tutor)** | Giảng dạy các lớp được phân công, soạn/giao/chấm Quiz, xem lương của mình |
| **Học viên/Phụ huynh (Student)** | Đăng ký/tham gia lớp học, làm Quiz, xem tiến độ học tập, dùng chatbot luyện tiếng Anh, theo dõi công nợ học phí |

## 3. Đối tượng học viên phục vụ

Trung tâm phục vụ **2 nhóm học viên**:
- **Trẻ em/học sinh phổ thông** — phân loại theo khung Cambridge YLE (Starters/Movers/Flyers) hoặc theo mục tiêu ôn thi phổ thông
- **Người đi làm luyện thi chứng chỉ** — TOEIC, IELTS theo dải band điểm cụ thể

Field `classes.level_type` (YLE / SCHOOL / CERTIFICATE) + `level_detail` (text tự do, VD: "Movers", "TOEIC 500-650", "IELTS 5.5-6.5") dùng để phân loại lớp theo 2 nhóm này.

## 4. Phạm vi hệ thống (Scope) — QUAN TRỌNG

### ✅ Trong phạm vi (Core — bắt buộc, 27 yêu cầu chức năng)
- **Người dùng & Phân quyền:** đăng ký/đăng nhập 3 role (Admin/Gia sư/Học viên), RBAC, quản lý hồ sơ, Admin duyệt/khoá gia sư
- **Lớp học & Lịch dạy:** tạo lớp theo trình độ tiếng Anh, xếp lịch chống trùng, đăng ký lớp, nhắc lịch, huỷ/dời lịch
- **Học phí:** ghi nhận thanh toán, công nợ, tính lương gia sư theo giờ dạy, báo cáo thu-chi
- **Quiz:** soạn đề trắc nghiệm (phân loại GRAMMAR/VOCABULARY/READING), làm bài, tự động chấm điểm, thống kê kết quả theo câu/theo lớp
- **Chatbot AI:** hỏi-đáp tự do hỗ trợ luyện tiếng Anh (ngữ pháp, từ vựng, cách dùng câu), lưu lịch sử hội thoại, hiển thị nội dung có cấu trúc (bảng chia động từ, ví dụ câu)

### ❌ NGOÀI phạm vi (đã cân nhắc và loại bỏ có chủ đích — KHÔNG implement)
- **Video call/dạy học trực tuyến tích hợp (Jitsi/WebRTC)** — buổi học diễn ra ngoài hệ thống
- **RAG (Retrieval-Augmented Generation)** — chatbot KHÔNG trả lời dựa trên tài liệu môn học được upload, chỉ trả lời tự do
- **Phân tích lỗ hổng kiến thức** (gắn tag chủ đề, thống kê điểm yếu, gợi ý ôn tập tự động)
- **Tài liệu bài giảng PDF theo buổi học**
- **Mô hình Marketplace mở**, **Vetting AI** (thẩm định hồ sơ gia sư bằng AI), **Matching Engine** (ghép gia sư-học viên bằng AI/embedding)
- **Speech-to-text, giám sát nội dung buổi học**

> Lý do loại bỏ: người phát triển làm việc chính toàn thời gian (dev Java/Spring Boot tại một ngân hàng), thường xuyên OT, chỉ có thời gian buổi tối/cuối tuần để làm đồ án tốt nghiệp. Các mục trên bị loại để giảm rủi ro không hoàn thành đúng hạn — **không phải vì thiếu giá trị**, mà vì ưu tiên một phạm vi nhỏ, chắc chắn hoàn thành được hơn là ôm đồm.

## 5. Nguyên tắc thiết kế nghiệp vụ cần tuân thủ khi code

1. **Một trung tâm, không phải marketplace**: gia sư không tự đăng ký công khai cho phụ huynh chọn tự do — Admin duyệt gia sư vào hệ thống trước khi họ được xếp lớp.
2. **Quiz là module chấm điểm trung tâm**: mọi câu trả lời của học viên phải lưu chi tiết theo từng câu (bảng `quiz_submission_answers`), không chỉ lưu tổng điểm, để thống kê % đúng theo từng câu hỏi cho Gia sư/Admin xem.
3. **Chatbot là tính năng độc lập, đơn giản**: không tích hợp ngữ cảnh từ lớp học/tài liệu môn học — chỉ là chatbot Q&A tự do gọi thẳng LLM API, định hướng prompt để chatbot đóng vai "trợ giảng tiếng Anh" (sửa lỗi ngữ pháp, giải thích từ vựng, luyện phản xạ hội thoại).
4. **Không có ràng buộc khoá ngoại (Foreign Key) trong schema DB** — quan hệ giữa các bảng thể hiện qua cột `*_id` thông thường (không có `REFERENCES`, không có `ON DELETE/UPDATE CASCADE`). Việc đảm bảo tính toàn vẹn dữ liệu là trách nhiệm của tầng Service trong Spring Boot, không phải của PostgreSQL.
5. **Tính lương gia sư**: dựa trên tổng số giờ dạy từ các buổi học có trạng thái `COMPLETED` trong bảng `schedules`, nhân với `hourly_rate` trong `tutor_profiles`.
6. **Phụ huynh có thể không có tài khoản riêng cho con nhỏ** (bảng `parent_student_links` cho phép `student_user_id` để trống nếu học viên chưa có tài khoản, chỉ lưu tên).
7. **Phân loại lớp theo 2 nhóm đối tượng**: dùng `classes.level_type` (YLE/SCHOOL/CERTIFICATE) để phân biệt trẻ em/học sinh phổ thông và người luyện chứng chỉ — không tạo bảng riêng cho từng nhóm.

## 6. Tech stack

| Layer | Công nghệ |
|---|---|
| Frontend | React |
| Backend | Java + Spring Boot |
| Database | PostgreSQL (không dùng khoá ngoại — xem mục 5.4) |
| AI Chatbot | Gọi trực tiếp LLM API (không RAG, không vector DB) |

## 7. Danh sách màn hình Frontend (19 màn)

**Dùng chung (3):** Đăng nhập, Đăng ký, Hồ sơ cá nhân

**Admin (6):** Dashboard, Quản lý Gia sư, Quản lý Lớp học, Quản lý Lịch dạy, Quản lý Học phí, Báo cáo Thu-Chi & Lương

**Gia sư (5):** Dashboard, Lớp học của tôi, Soạn Quiz, Kết quả Quiz theo lớp, Xem lương

**Học viên/Phụ huynh (5):** Dashboard, Lớp học của tôi, Làm bài Quiz, Kết quả Quiz cá nhân, Chatbot AI trợ giảng

## 8. Định hướng mở rộng trong tương lai (không code ngay, chỉ để tham khảo khi thiết kế)

Nếu sau này có thời gian, các hướng mở rộng khả dĩ (không nằm trong scope đồ án hiện tại):
- Thêm cột `topic_tag` vào `quiz_questions` để bật lại tính năng phân tích lỗ hổng kiến thức theo chủ đề/kỹ năng
- Thêm bảng `course_documents` + tích hợp `pgvector` nếu muốn nâng cấp chatbot thành RAG
- Nhúng Jitsi Meet nếu muốn có lớp học trực tuyến tích hợp

**Không tự ý implement các mục ở mục 8 trừ khi được yêu cầu rõ ràng.**