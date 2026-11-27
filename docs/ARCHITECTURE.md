# Kiến trúc (dự thảo)

Web là SPA React đi qua các route của React Router. Management API là Modular Monolith Express với routes, controllers, services, repositories và database migrations. Danh mục trả từ metadata tĩnh. Cùng nguồn metadata được dùng để seed bảng labs.

Hai Lab có ứng dụng Express, cấu hình, cổng và cơ sở dữ liệu riêng. Trình điều phối bootstrap khởi tạo các ứng dụng trong cùng tiến trình Node và dùng listener riêng theo từng địa chỉ loopback. Đây là ranh giới ứng dụng và trình duyệt. Cô lập tiến trình và mạng thuộc giai đoạn sau.

Các package private chứa hợp đồng TypeScript, cấu hình HTTP và cơ sở dữ liệu dùng chung, và fixture văn bản thuần. Kiểu dữ liệu được biên dịch theo cấu trúc thư mục gốc để giữ đường dẫn nội bộ. Vite xây dựng bundle Web riêng.

Trình chạy development kiểm tra xung đột cổng, khởi tạo dữ liệu trước khi mở listener và đóng listener cùng các kết nối SQLite khi dừng. Cổng mặc định là 5173, 3000, 3001 và 3002.
