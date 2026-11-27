# Kế hoạch kiểm thử (dự thảo)

- Vitest kiểm tra validation trạng thái kết quả, fixture và cấu hình cổng.
- Supertest kiểm tra health, catalog, định danh Lab, validation và kiểm soát Host/Origin, CORS, cookie và CSP.
- Tích hợp SQLite kiểm tra migration lặp lại, khóa ngoại, seed, dữ liệu độc lập và ràng buộc bình luận.
- Playwright chạy Chromium với đủ bốn ứng dụng, kiểm tra giao diện, điều hướng, 404 và kết nối qua localhost, IPv4 và IPv6.
- CI Windows chạy npm ci, kiểm tra format, lint, kiểu, unit và integration, build và smoke. Chạy E2E khi các cổng mặc định đang trống.
