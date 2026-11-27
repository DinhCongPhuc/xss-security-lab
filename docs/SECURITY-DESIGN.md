# Thiết kế bảo mật (dự thảo)

- Mỗi dịch vụ bind rõ ràng vào 127.0.0.1 và ::1. Giữ danh sách Host cục bộ với cổng tương ứng. Management API chỉ cấp CORS cho các origin Web cục bộ được cấu hình, không cấp quyền gửi credentials. Hai Lab từ chối yêu cầu trình duyệt có Origin khác chính origin của chúng.
- Các dịch vụ Express đặt CSP mặc định cấm tải tài nguyên, cấm nhúng, cấm gửi biểu mẫu, cùng nosniff, no-referrer và no-store. Vite dùng Host và Origin allowlist, tắt CORS và đặt header bảo vệ phù hợp cho môi trường development.
- Dùng ba tệp SQLite riêng. Không đưa thông tin cá nhân, thông tin đăng nhập thật, phiên xác thực hay cookie dùng chung vào Lab. Không công khai qua hosting, tunnel hoặc ánh xạ cổng.
- Loopback, cổng và CORS chỉ giải quyết từng phần riêng lẻ. Cookie không được phân vùng theo cổng. CORS là chính sách phía trình duyệt. Host và Origin không xác thực người gửi và vẫn có thể được tạo bởi client ngoài trình duyệt. Các ứng dụng hiện chạy cùng quyền hệ điều hành.

Vite giới hạn phạm vi đọc vào HTML, mã frontend và các package font. Tắt `publicDir` để tránh đường phục vụ tệp tĩnh ngoài chính sách filesystem. Giữ các deny mặc định của Vite và chặn thêm DB, sidecar và các thư mục runtime đã biết. Trình điều phối từ chối `DATA_DIR` nằm trong frontend hoặc `node_modules`, kể cả khi đường dẫn thực trỏ vào đó. Giữ mã nguồn, plugin, dependency và liên kết hệ thống tệp của Vite trong phạm vi tin cậy. Đây là chính sách máy chủ development, còn ranh giới hệ điều hành thuộc PROJECT-11.

Health Dashboard chỉ kiểm tra ba đường dẫn cố định trên địa chỉ loopback dạng số và cổng lấy từ cấu hình startup đáng tin cậy. Deadline và giới hạn kích thước áp dụng cho từng phản hồi. Client không chọn đích, upstream không nhận credentials và response chỉ chứa trạng thái chuẩn hóa với timestamp. Health không phải xác nhận độ an toàn của dịch vụ.

Mỗi collector chia sẻ một lượt health đang chạy giữa các request chồng nhau. Cơ chế giảm công việc trùng, còn số lượng kết nối vào, tần suất lượt nối tiếp và điều phối giữa các tiến trình nằm ngoài phạm vi của nó.

Trước khi bổ sung chức năng thực nghiệm, cần thiết kế và kiểm thử một browser profile dùng một lần, các tiến trình với quyền tối thiểu và sự cô lập hệ thống tệp, cùng chính sách mạng hạn chế egress và chặn đường dẫn từ Lab sang Management hoặc dịch vụ cục bộ khác. Iframe phải giới hạn quyền bằng sandbox, giữ origin opaque nếu khả thi, cấm điều hướng top-level và giới hạn embedding theo thiết kế đã được kiểm tra. Kênh truyền thông thí nghiệm cần kiểm tra nguồn, schema, token gắn với lần chạy và thời hạn. Với opaque origin, không dùng giá trị null làm bằng chứng nhận dạng. Management API chỉ xử lý dữ liệu hợp lệ và không thực thi mã nhận từ bên ngoài.
