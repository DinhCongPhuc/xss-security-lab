# Kế hoạch kiểm thử (dự thảo)

- Vitest kiểm tra validation trạng thái kết quả, fixture và cấu hình cổng.
- Supertest kiểm tra health, catalog, định danh Lab, validation và kiểm soát Host/Origin, CORS, cookie và CSP.
- Tích hợp SQLite kiểm tra migration lặp lại, khóa ngoại, seed, dữ liệu độc lập và ràng buộc bình luận.
- Playwright chạy Chromium với đủ bốn ứng dụng, kiểm tra giao diện, điều hướng, 404 và kết nối qua localhost, IPv4 và IPv6.
- Kiểm thử âm kiểm tra lỗi migration, schema mới hơn, khóa ngoại ghép, error envelope, request body và Host/Origin. Kiểm thử vòng đời xác minh tiến trình thoát và cổng mở lại được sau shutdown hoặc startup lỗi.
- Playwright dùng tiến trình riêng với cổng E2E và SQLite tạm. Kiểm thử filesystem gửi HTTP thật cho tệp tổng hợp trong và ngoài phạm vi Vite, gồm DB/sidecar, .env, PEM và public.
- CI Windows chạy npm ci, kiểm tra format, lint, kiểu, unit và integration, build và smoke. Các cổng E2E đã cấu hình cần trống.
