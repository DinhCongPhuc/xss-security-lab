# Đặc tả API (dự thảo)

| Dịch vụ    | GET         | Trả về                                                        |
| ---------- | ----------- | ------------------------------------------------------------- |
| Management | /api/health | Trạng thái ok và service api                                  |
| Management | /api/labs   | LAB-01 Reflected XSS, LAB-02 Stored XSS, LAB-03 DOM-based XSS |
| Hai Lab    | /health     | Trạng thái ok, service và mode tương ứng                      |
| Hai Lab    | /           | Trang HTML định danh                                          |

JSON thành công có dạng `{ "ok": true, "data": ... }`. JSON lỗi có dạng `{ "ok": false, "error": { "code": "...", "message": "..." } }`.

- 400 INVALID_REQUEST khi endpoint nhận query hoặc body.
- 403 HOST_DENIED hoặc ORIGIN_DENIED với yêu cầu ngoài allowlist.
- 404 NOT_FOUND với đường dẫn chưa đăng ký.
- 500 INTERNAL_ERROR cho lỗi xử lý bất ngờ.

Các trạng thái kết quả dự kiến là EXECUTED, PREVENTED, NORMAL, INCONCLUSIVE và ERROR. PREVENTED cần bằng chứng phòng vệ. Trường hợp không nhận được tín hiệu thực thi cần được đánh giá là INCONCLUSIVE nếu thiếu bằng chứng khác.
