# xss-security-lab

Interactive web security laboratory for Cross-Site Scripting (XSS) simulation, analysis, and prevention.

## Khởi động trên Windows

Cài Node.js v24.16.0, npm 11.13.0 và Git 2.55.0. Mở PowerShell tại thư mục gốc của kho. Các lệnh dùng `npm.cmd` để tương thích với PowerShell có execution policy hạn chế.

```powershell
node --version
npm.cmd --version
git --version
npm.cmd ci
npm.cmd exec -- playwright install chromium
npm.cmd run dev
```

Các cổng mặc định hoạt động ngay khi cài xong. Để thay đổi cổng Express hoặc thư mục dữ liệu, sao chép `.env.example` thành `.env` và chỉnh giá trị. Dừng dịch vụ bằng Ctrl+C. Nếu Windows hỏi `Terminate batch job (Y/N)?`, nhập `Y`.

| Ứng dụng       | URL mặc định          | Đường dẫn kiểm tra |
| -------------- | --------------------- | ------------------ |
| Web            | http://localhost:5173 | /                  |
| Management API | http://localhost:3000 | /api/health        |
| Vulnerable Lab | http://127.0.0.1:3001 | /health            |
| Secure Lab     | http://127.0.0.1:3002 | /health            |

Mỗi dịch vụ lắng nghe trên 127.0.0.1 và ::1. Có thể truy cập IPv6 với địa chỉ dạng `http://[::1]:3000/api/health`. SQLite tự tạo các tệp trong `data/` lúc khởi động. Bootstrap cung cấp trang giữ chỗ và catalog, chỉ sử dụng cục bộ với dữ liệu mẫu.

## Kiểm tra

Dừng tiến trình development để giải phóng cổng mặc định trước khi chạy Playwright.

```powershell
npm.cmd run check
```

Xem [kiến trúc](docs/ARCHITECTURE.md), [thiết kế bảo mật](docs/SECURITY-DESIGN.md) và [kế hoạch kiểm thử](docs/TEST-PLAN.md). Các tài liệu trong `docs/` là bản dự thảo từ PROJECT-07.
