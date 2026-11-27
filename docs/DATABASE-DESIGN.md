# Thiết kế SQLite (dự thảo)

Dùng node:sqlite đi kèm Node.js 24, tránh addon và bước build SQLite riêng cho Windows. Trong Node 24.16.0 module được đánh dấu release candidate. DatabaseSync chặn event loop, phù hợp với khởi tạo và seed ít dữ liệu. Đánh giá worker hoặc API bất đồng bộ nếu thêm truy vấn có tải đáng kể. [Tài liệu Node.js 24.16.0](https://nodejs.org/download/release/v24.16.0/docs/api/sqlite.html)

- management.db lưu labs, test_cases và experiment_logs. Khóa ngoại ghép đảm bảo kết quả tham chiếu đúng test case của Lab.
- vulnerable.db và secure.db mỗi tệp có bảng comments độc lập, với giới hạn độ dài và timestamp mặc định.
- Migration tĩnh, đánh số theo vị trí, chạy trong transaction với BEGIN IMMEDIATE và lưu phiên bản bằng PRAGMA user_version. Từ chối schema mới hơn mã nguồn. Thêm migration vào cuối danh sách khi thay đổi schema.
- Bật khóa ngoại và dùng bảng STRICT. Seed danh mục dùng prepared statements. Không seed kết quả thí nghiệm. Bỏ qua database và sidecar trong Git.
