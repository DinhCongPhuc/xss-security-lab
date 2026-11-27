# Kế hoạch kiểm thử (dự thảo)

- Vitest kiểm tra validation trạng thái kết quả, fixture và cấu hình cổng.
- Supertest kiểm tra health, catalog, định danh Lab, validation và kiểm soát Host/Origin, CORS, cookie và CSP.
- Tích hợp SQLite kiểm tra migration lặp lại, khóa ngoại, seed, dữ liệu độc lập và ràng buộc bình luận.
- Playwright chạy Chromium với đủ bốn ứng dụng, kiểm tra giao diện, điều hướng, 404 và kết nối qua localhost, IPv4 và IPv6.
- Kiểm thử âm kiểm tra lỗi migration, schema mới hơn, khóa ngoại ghép, error envelope, request body và Host/Origin. Kiểm thử vòng đời xác minh tiến trình thoát và cổng mở lại được sau shutdown hoặc startup lỗi.
- Playwright dùng tiến trình riêng với cổng E2E và SQLite tạm. Kiểm thử filesystem gửi HTTP thật cho tệp tổng hợp trong và ngoài phạm vi Vite, gồm DB/sidecar, .env, PEM và public.
- CI Windows chạy npm ci, kiểm tra format, lint, kiểu, unit và integration, build và smoke. Các cổng E2E đã cấu hình cần trống.
- PROJECT-08 kiểm tra cấu hình điều hướng, ngữ nghĩa trạng thái, breadcrumb, title, history, skip link, focus trap, Escape, lưu tùy chọn sidebar, bảy viewport và các cặp tương phản chính. Ảnh thực tế tạo bằng Chromium theo hướng dẫn Design System.
- PROJECT-08.1 kiểm tra focus khi đóng drawer qua breakpoint, Tab với mục ẩn, disabled, inert hoặc cập nhật, modal có 0 hoặc 1 control tabbable, tooltip Escape khi hover và khi focus, role của Alert và vùng cuộn của drawer 390 × 400. Chạy bài hỗ trợ ảnh riêng bằng `CAPTURE_PROJECT_08=1`. Lượt chức năng thông thường báo bài này là skipped.
