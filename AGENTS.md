# Hướng dẫn phát triển

- Dùng npm workspaces. Web là SPA, API quản lý là Modular Monolith, hai Lab là các ứng dụng Express riêng với origin và SQLite riêng. Giữ môi trường Lab độc lập với luồng dữ liệu quản lý.
- Dùng TypeScript strict, module ESM, ESLint và Prettier. Kiểm tra đầu vào tại HTTP boundary, dùng truy vấn tham số hóa và thống nhất định dạng phản hồi.
- Chỉ chạy trên loopback với dữ liệu mẫu. Giữ allowlist Host và Origin, cấm dùng chung cookie và cấm thực thi JavaScript tùy ý trong API. Không đưa payload thực thi hoặc hành vi XSS cố ý vào bootstrap. Không công khai Lab qua hosting, tunnel hoặc port forwarding.
- Kiểm thử đơn vị cho validation, Supertest cho hợp đồng API và Playwright cho điều hướng và dịch vụ thật. Kiểm thử cơ sở dữ liệu phải dùng bản mẫu tạm. Báo cáo lệnh, kết quả quan sát được và các bước chưa chạy. Cấm bịa kết quả kiểm thử hoặc thí nghiệm.
- Làm việc trên nhánh tính năng. Giữ lịch sử và tài liệu hiện hữu. Không push, merge hoặc tạo PR khi chưa được yêu cầu.
- Definition of Done yêu cầu lockfile có thể dùng với npm ci, kiểm tra định dạng, lint, kiểu, test, build và smoke test đạt. Cập nhật tài liệu và xác minh cả hai địa chỉ loopback khi thay đổi dịch vụ.
