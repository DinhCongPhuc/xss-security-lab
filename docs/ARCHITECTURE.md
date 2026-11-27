# Kiến trúc (dự thảo)

Web là SPA React đi qua các route của React Router. Management API là Modular Monolith Express với routes, controllers, services, repositories và database migrations. Danh mục trả từ metadata tĩnh. Cùng nguồn metadata được dùng để seed bảng labs.

Dashboard gọi Management API qua cổng API_PORT được chuyển vào bundle Vite. Management API tổng hợp catalog và ba endpoint health trên cùng họ địa chỉ loopback với listener đang xử lý. Snapshot nằm trong bộ nhớ của trang và có thể làm mới thủ công.

Hai Lab có ứng dụng Express, cấu hình, cổng và cơ sở dữ liệu riêng. Trình điều phối bootstrap khởi tạo các ứng dụng trong cùng tiến trình Node và dùng listener riêng theo từng địa chỉ loopback. Đây là ranh giới ứng dụng và trình duyệt. Cô lập tiến trình và mạng thuộc giai đoạn sau.

Các package private công bố các module nội bộ qua exports trong npm workspaces. Express được khai báo ở workspace sử dụng. Build máy chủ tạo module JavaScript để tái sử dụng trong monorepo và vẫn phân giải các package nội bộ qua exports TypeScript trên Node 24. Build frontend tạo bundle Vite riêng. Chạy dịch vụ development bằng trình điều phối tại `scripts/dev.mjs`.

Trình chạy development kiểm tra xung đột cổng, khởi tạo dữ liệu trước khi mở listener và đóng listener cùng các kết nối SQLite khi dừng. Cổng mặc định là 5173, 3000, 3001 và 3002. Playwright sở hữu tiến trình con, nhận readiness qua IPC và ngắt IPC để kích hoạt cleanup trên Windows. Mỗi lượt có bộ cổng và thư mục SQLite riêng.
