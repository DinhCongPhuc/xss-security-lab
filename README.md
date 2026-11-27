# xss-security-lab

Interactive web security laboratory for Cross-Site Scripting (XSS) simulation, analysis, and prevention.

## Khởi động trên Windows

Cài Node.js v24.16.0, npm 11.13.0 và Git 2.55.0. Mở PowerShell tại thư mục gốc của kho. Các lệnh dùng `npm.cmd` để tương thích với PowerShell có execution policy hạn chế.

**Dừng dịch vụ development trước khi chạy `npm ci` trên Windows.** Tiến trình Node đang chạy có thể giữ tệp native trong `node_modules`.

```powershell
node --version
npm.cmd --version
git --version
npm.cmd ci
npm.cmd exec -- playwright install chromium
npm.cmd run dev
```

Các cổng mặc định hoạt động ngay khi cài xong. Để thay đổi cổng hoặc thư mục dữ liệu, sao chép `.env.example` thành `.env` và chỉnh giá trị. Dừng dịch vụ bằng Ctrl+C. Nếu Windows hỏi `Terminate batch job (Y/N)?`, nhập `Y`.

| Ứng dụng       | URL mặc định          | Đường dẫn kiểm tra |
| -------------- | --------------------- | ------------------ |
| Web            | http://localhost:5173 | /                  |
| Management API | http://localhost:3000 | /api/health        |
| Vulnerable Lab | http://127.0.0.1:3001 | /health            |
| Secure Lab     | http://127.0.0.1:3002 | /health            |

Mỗi dịch vụ lắng nghe trên 127.0.0.1 và ::1. Có thể truy cập IPv6 với địa chỉ dạng `http://[::1]:3000/api/health`. SQLite tự tạo các tệp trong `data/` lúc khởi động. Bootstrap cung cấp trang giữ chỗ và catalog, chỉ sử dụng cục bộ với dữ liệu mẫu.

Ba tệp SQLite là `management.db`, `vulnerable.db` và `secure.db`. Có thể đổi thư mục bằng `DATA_DIR`. Giữ dữ liệu ngoài `apps/web` và các thư mục dependency frontend.

## Kiểm tra

Playwright khởi chạy tiến trình riêng trên các cổng Web/API/Vulnerable Lab/Secure Lab lần lượt là `15173`, `13000`, `13001`, `13002`. Đặt `E2E_WEB_PORT`, `E2E_API_PORT`, `E2E_VULNERABLE_LAB_PORT` và `E2E_SECURE_LAB_PORT` trong PowerShell để đổi cổng. Dữ liệu mỗi lượt nằm trong thư mục tạm của hệ điều hành và được dọn lúc kết thúc. Có thể giữ phiên dev trên các cổng mặc định trong lúc chạy Playwright.

```powershell
npm.cmd run test
npm.cmd run test:e2e
npm.cmd run check
```

Xem [kiến trúc](docs/ARCHITECTURE.md), [thiết kế bảo mật](docs/SECURITY-DESIGN.md) và [kế hoạch kiểm thử](docs/TEST-PLAN.md). Các tài liệu trong `docs/` là bản dự thảo từ PROJECT-07.
