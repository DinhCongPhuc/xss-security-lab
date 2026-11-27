# Design System

PROJECT-08 cung cấp nền giao diện tối cho XSS Security Lab. Ưu tiên khả năng đọc, phân cấp rõ và trạng thái có ý nghĩa. Nội dung hiện tại là trang giới thiệu và liên kết điều hướng.

## Token

| Vai trò               | Token chính                       | Màu                       |
| --------------------- | --------------------------------- | ------------------------- |
| Nền ứng dụng          | background                        | #0B1120                   |
| Điều hướng            | sidebar                           | #0F172A                   |
| Card và bề mặt nâng   | surface, elevated                 | #111C2E, #19263B          |
| Văn bản               | foreground, muted-foreground      | #F1F5F9, #A0AFC3          |
| Tương tác             | primary, primary-hover, secondary | #22D3EE, #67E8F9, #A5B4FC |
| Mục hiện tại và focus | active, focus                     | #152E42, #67E8F9          |
| Viền và điều khiển    | border, control                   | #263449, #62738D          |
| Trạng thái            | success, warning, danger          | #4ADE80, #FBBF24, #F87171 |
| Mã và trường nhập     | code                              | #080D17                   |

Token nằm trong `apps/web/src/styles/global.css` và được Tailwind ánh xạ thành utility. Dùng Inter cho giao diện và JetBrains Mono cho mã. Hai font được đóng gói cục bộ. Khoảng cách dùng đơn vị 4 px, bán kính phổ biến 8, 12 và 16 px. Chuyển động dùng 140 ms cho tương tác và 200 ms cho panel, bằng 0 khi người dùng chọn reduced motion. Header, tooltip và skip link dùng các lớp z-index riêng. Dialog dùng top layer của trình duyệt.

## Thành phần

| Nhóm               | Thành phần và cách dùng                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hành động          | Button có default, outline, ghost và kích thước sm, md, icon. IconButton yêu cầu nhãn truy cập.                                                           |
| Bề mặt và biểu mẫu | Card, Separator, Input và Textarea dùng token chung. Nối label với field và mô tả lỗi bằng aria-describedby khi cần.                                      |
| Phản hồi           | Badge và Alert có tone neutral, info, success, warning và danger. Alert chỉ thông báo tức thời khi được yêu cầu. Spinner và Skeleton hỗ trợ LoadingState. |
| Lớp nổi            | Tooltip cho nhãn icon thu gọn. Dialog và Sheet dùng dialog native với tiêu đề, nút đóng và Escape.                                                        |
| Ngữ cảnh           | Breadcrumb, PageHeader, SectionHeader, StatusIndicator, EmptyState, ErrorState, LoadingState và trang NotFound.                                           |

```tsx
<Button variant="outline" size="sm">Quay lại</Button>
<IconButton label="Đóng"><X aria-hidden="true" /></IconButton>
<LoadingState label="Đang tải nội dung" />
<EmptyState title="Chưa có nội dung" description="Tài liệu đang được chuẩn bị." />
```

## Layout và accessibility

Cấu hình `apps/web/src/config/navigation.ts` cung cấp metadata cho route, sidebar, breadcrumb và title. Nhánh Attack Lab có ba route con. Từ 1024 px, sidebar rộng 256 px hoặc 72 px khi thu gọn. Màn hình hẹp dùng drawer. Breadcrumb ưu tiên tên trang hiện tại trên màn hình nhỏ. Chỉ trạng thái thu gọn được ghi vào localStorage.

BF-06 giữ title theo route, focus vào main khi điều hướng, skip link, landmark, aria-current và nhãn nút icon. PROJECT-08.1 bổ sung bằng chứng cho các ca biên sau.

- **DS-01.** Sau khi drawer đóng do chuyển breakpoint, sự kiện close chuyển focus đến nút sidebar desktop. Escape trên mobile vẫn trả focus về nút mở. Resize khi drawer đóng giữ focus hiện tại.
- **DS-02.** Dialog và Sheet dùng `showModal()` cho modal, nền inert, Escape và khôi phục focus native. Mã chỉ bổ sung vòng Tab tại biên, xác định lại các đích hiện hữu và bỏ qua phần tử ẩn, disabled, inert hoặc tabindex âm. Chromium kiểm tra cả drawer và dialog giữa màn hình, kể cả khi chỉ còn nút đóng hoặc không còn nút tabbable.
- **DS-03.** Escape tắt tooltip do hover hoặc focus, kể cả khi focus ở ngoài trigger. Tooltip chỉ có thể mở lại sau khi hover và focus của lượt tương tác đó đều kết thúc. Escape vẫn tiếp tục truyền đến modal.
- **DS-04.** Alert mặc định không tạo live region. `announce` đặt `role="alert"` khi caller chưa cấp role. Role tường minh được ưu tiên, ví dụ `role="status"` cho thông báo lịch sự.
- **DS-05.** Kiểm thử drawer ở 390 × 400 xác nhận điều hướng cuộn riêng, footer còn trong viewport, nền bị khóa và vị trí cuộn được giữ sau khi đóng. Bài chụp ảnh được báo cáo riêng.
- **DS-06.** Tài liệu này và kế hoạch kiểm thử ghi các ca đã xác minh và giới hạn còn lại.

Kiểm chứng dùng Chromium với nội dung mẫu, gồm history, bảy viewport, reduced motion và các cặp tương phản chính. Chưa kiểm toán WCAG 2.2 AA toàn diện hoặc chạy với screen reader trên nhiều nền tảng.

Nhãn Lab cục bộ thể hiện môi trường. Các trang nghiệp vụ vẫn là placeholder. BF-02 thuộc PROJECT-11.

## Tái tạo ảnh

Trong PowerShell tại gốc repo, chạy `$env:CAPTURE_PROJECT_08='1'; npm.cmd run test:e2e -- screenshots.spec.ts; Remove-Item Env:CAPTURE_PROJECT_08`. Ảnh được ghi vào `screenshots/`.

Khi không đặt biến này, bài hỗ trợ ảnh được đánh dấu skipped. Tính số bài chức năng và bài hỗ trợ ảnh riêng.
