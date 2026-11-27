# Dashboard

PROJECT-09 thay trang Tổng quan bằng danh mục Lab và trạng thái endpoint health tại thời điểm quan sát. Hero, truy cập nhanh và lộ trình học dẫn đến những trang hiện có. Lộ trình là hướng dẫn học tập, không phải nhật ký tiến độ cá nhân.

## Thành phần và dữ liệu

- DashboardPage điều phối tải, thông báo trạng thái, retry và refresh. Hero và các liên kết học tập hoạt động khi API ngoại tuyến.
- OverviewStats hiển thị số loại XSS và số Lab từ catalog dùng chung với /api/labs. Dịch vụ phản hồi hợp lệ là số endpoint trả payload hợp lệ trong tổng số dịch vụ. Nếu chưa có quan sát, hiển thị chưa có dữ liệu. Catalog trống hợp lệ có số đếm 0.
- LabOverviewSection dùng ID, slug và tên từ API. Mô tả lĩnh vực lấy từ điều hướng frontend. Slug chỉ nhận reflected, stored hoặc dom rồi nối với đường dẫn route nội bộ. Các thẻ Lab ghi rõ trạng thái giới thiệu.
- SystemHealthPanel trình bày trạng thái bằng chữ và thời điểm thực. RecentActivity hiển thị empty state. Tiến độ và hoạt động hiện có availability unavailable.

## Hợp đồng và giới hạn health

GET /api/dashboard/summary dùng JSON envelope hiện tại với catalog, statistics, services, availability và observedAt. Catalog lấy từ cùng module đã dùng để seed SQLite. PROJECT-09 không ghi lịch sử health hay tạo migration.

Management API gọi song song /api/health và hai endpoint /health bằng địa chỉ IPv4 hoặc IPv6 loopback cố định theo listener. Chỉ dùng cổng cấu hình khi khởi động, kể cả cấu hình E2E. Client không chọn đích, không chuyển tiếp cookie hoặc Authorization, không dùng proxy HTTP và không theo redirect. Mỗi phép đo có deadline 800 ms và body tối đa 4 KiB. HTTP 200 cùng JSON đúng mã dịch vụ và mode là healthy. Phản hồi sai HTTP, định dạng, định danh hoặc quá giới hạn là unhealthy. Lỗi kết nối hay timeout là unreachable. Nếu chưa cấu hình probe thì unknown với observedAt null.

PROJECT-09.1 gộp các yêu cầu summary chồng nhau trong cùng một app instance vào một lượt quan sát đang chạy. Các caller nhận cùng kết quả và timestamp qua response riêng. Caller ngắt kết nối không hủy lượt dùng chung. Tham chiếu được xóa khi Promise thành công hoặc bị từ chối. Yêu cầu sau đó khởi tạo lượt mới. Mỗi cấu hình listener có collector riêng. Cơ chế này giảm probe trùng trong thời gian chồng nhau, không lưu snapshot ở máy chủ, không giới hạn tần suất yêu cầu hoặc số lượt nối tiếp.

Trình duyệt dùng hostname loopback đang mở và cổng Management API trùng với listener. Mặc định là `3000`. Trình khởi động dev nạp `.env` và áp dụng `API_PORT` cho cả Web lẫn API. Build chỉ đọc `process.env.API_PORT`. Xuất biến này trong PowerShell trước khi build (xem [README](../README.md)) và build lại nếu thay cổng listener. Playwright truyền cổng E2E cho tiến trình dev riêng. Bundle chỉ nhúng cổng đã xác thực.

Các kiểm tra Host/Origin và CORS cũ tiếp tục áp dụng. Health chỉ phản ánh endpoint đang đáp ứng. BF-02 tại PROJECT-11 tiếp tục là cổng bắt buộc trước chức năng cố ý dễ tổn thương.

## Trạng thái và kiểm thử

Yêu cầu đầu có skeleton và thông báo. Hook xác minh phản hồi ở biên JSON, áp dụng deadline 3,5 giây, hủy khi rời trang, bỏ kết quả cũ và tránh refresh trùng lặp. Validator từ chối ID hoặc slug trùng, đồng thời chấp nhận catalog trống với số đếm bằng 0. Refresh lỗi giữ snapshot trước và gắn nhãn dữ liệu cũ. Không polling. Thanh làm mới và liên kết học tập dùng được bằng bàn phím.

Vitest/Supertest kiểm tra catalog, payload, lỗi, deadline và đích truy cập. Playwright kiểm tra dịch vụ thật trên localhost, IPv4 và IPv6. Các ca API lỗi, phản hồi chưa tới, malformed, catalog trống và lỗi từng dịch vụ dùng mô phỏng. Kiểm thử viewport gồm 1920 × 1080 đến 360 × 800.

Trong PowerShell tại gốc repository, chạy `$env:CAPTURE_PROJECT_09='1'; npm.cmd run test:e2e -- dashboard-screenshots.spec.ts; Remove-Item Env:CAPTURE_PROJECT_09`. Ảnh desktop, tablet và mobile dùng dữ liệu dịch vụ thật. Ảnh loading và error dùng chặn yêu cầu với Playwright để minh họa trạng thái. Báo cáo bài hỗ trợ ảnh riêng với bài chức năng.

Chưa triển khai ghi nhật ký, tiến độ cá nhân, lịch sử monitoring hoặc thử nghiệm XSS. Accessibility được kiểm tra trong phạm vi Chromium, chưa phải kiểm toán WCAG toàn diện.
