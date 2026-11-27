# Thiết kế UI/UX (dự thảo)

PROJECT-08 cung cấp shell tiếng Việt theo hướng SaaS bảo mật, với nền navy, điểm nhấn cyan và indigo, Inter và JetBrains Mono đóng gói cục bộ. Các trang dùng cùng header, lưới card, trạng thái placeholder và khoảng cách. Nhãn Lab cục bộ mô tả môi trường.

Ở chiều rộng từ 1024 px, sidebar có chế độ 256 px hoặc 72 px. Tablet và mobile dùng drawer có tiêu đề và nút đóng. Breadcrumb rút gọn theo không gian. BF-06 gồm title theo route, focus vào main khi điều hướng, skip link, khả năng dùng bàn phím, Escape và reduced motion.

PROJECT-08.1 kiểm chứng focus đến nút sidebar desktop khi drawer đóng do đổi breakpoint, Escape trả focus về nút mở mobile và tooltip thu gọn đóng khi nhấn Escape. Ở chiều cao ngắn, điều hướng cuộn riêng, footer vẫn nằm trong drawer và trang nền giữ vị trí cuộn.

PROJECT-09 dùng shell hiện có cho Dashboard, với danh mục thật, health cục bộ, trạng thái tải và lỗi, truy cập nhanh và lộ trình học. Xem [Dashboard Design](DASHBOARD-DESIGN.md).

Xem [Design System](DESIGN-SYSTEM.md) để biết token, API thành phần và phạm vi kiểm chứng. Tài liệu giữ trạng thái dự thảo cho đến khi có đặc tả gốc để đối chiếu.
