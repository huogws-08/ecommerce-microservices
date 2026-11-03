# Test Execution Report – E-commerce Microservices MVP

## Quy ước
- **PASS**: Có kết quả chạy thực tế được ghi nhận trong quá trình kiểm thử dự án.
- **NOT TESTED**: Chưa có bằng chứng chạy đúng test case tương ứng trong lịch sử kiểm thử hiện có.
- Báo cáo này không suy diễn PASS từ việc endpoint hoặc chức năng có tồn tại.

## 1. Identity & Access

| Test Case | Status | Evidence / Ghi chú |
|---|---|---|
| TC-IAM-01 | NOT TESTED | Có tài khoản test tồn tại; chưa lưu lại response của lần đăng ký hợp lệ tương ứng. |
| TC-IAM-02 | NOT TESTED | Chưa có response kiểm thử username trùng được ghi nhận. |
| TC-IAM-03 | NOT TESTED | Chưa có response kiểm thử thiếu password được ghi nhận. |
| TC-IAM-04 | PASS | Đăng nhập CUSTOMER `e2e_customer01` và ADMIN `admin_test` qua API Gateway; nhận JWT thành công. |
| TC-IAM-05 | NOT TESTED | Chưa có response kiểm thử sai password được ghi nhận. |

## 2. Customer & Membership

| Test Case | Status | Evidence / Ghi chú |
|---|---|---|
| TC-CUS-01 | PASS | Các API Customer/Membership đã được gọi thành công trong nhóm kiểm thử membership. |
| TC-CUS-02 | NOT TESTED | Chưa có response cụ thể cho UID không tồn tại được lưu lại. |
| TC-CUS-03 | NOT TESTED | Đã kiểm tra cập nhật score/tier bằng ADMIN; chưa có bằng chứng cập nhật fullname theo test case này. |
| TC-CUS-04 | PASS | Membership GET trả thông tin điểm và hạng; bộ kiểm thử membership đã đạt 6/6. |
| TC-CUS-05 | NOT TESTED | Chưa có response riêng cho truy vấn Customer không gửi JWT được lưu lại. |

## 3. Product

| Test Case | Status | Evidence / Ghi chú |
|---|---|---|
| TC-PRO-01 | PASS | Product list endpoint được sử dụng khi kiểm tra Redis cache MISS/HIT. |
| TC-PRO-02 | PASS | GET Product P001 trả thông tin sản phẩm và tồn kho. |
| TC-PRO-03 | NOT TESTED | Chưa có response GET một PID không tồn tại được lưu lại. |
| TC-PRO-04 | PASS | Admin tạo product thử nghiệm, nhận HTTP 201; sau đó GET/PUT/DELETE đều thành công. |
| TC-PRO-05 | PASS | Đơn OID 5 làm tồn kho P001 giảm từ 7 xuống 6; đã xác minh trực tiếp Product Service. |

## 4. Order

| Test Case | Status | Evidence / Ghi chú |
|---|---|---|
| TC-ORD-01 | PASS | Tạo Order OID 5 thành công; OrderDetail có P001, quantity 1, unit_price 25,000,000. |
| TC-ORD-02 | NOT TESTED | Chưa lưu response riêng của POST /api/orders khi không gửi JWT. |
| TC-ORD-03 | NOT TESTED | Chưa thực hiện một request vượt tồn kho có ghi nhận response 409. |
| TC-ORD-04 | PASS | Customer UID 5 có score 100; Order OID 5 được giảm 2,500,000 trên tổng 25,000,000 (10%). |
| TC-ORD-05 | PASS | Outbox event ID 6 được publish; Shipment Service tạo SHP000005 từ event đó. |

## 5. Shipment

| Test Case | Status | Evidence / Ghi chú |
|---|---|---|
| TC-SHP-01 | PASS | OrderCreated của OID 5 được consumer xử lý; Shipment SHP000005 được tạo với UID 5, trạng thái PENDING. |
| TC-SHP-02 | NOT TESTED | Chưa gửi Kafka event thiếu oid để xác nhận không tạo Shipment và ghi nhận lỗi. |
| TC-SHP-03 | PASS | ADMIN cập nhật trạng thái Shipment thành SHIPPED thành công; Customer bị từ chối khi thử cập nhật. |
| TC-SHP-04 | PASS | Truy vấn shipid không tồn tại SHP999999 trả HTTP 404. |
| TC-SHP-05 | NOT TESTED | Chưa phát lại cùng event để kiểm tra idempotency bằng một test riêng. |

## Tổng kết

| Bounded Context | PASS | NOT TESTED | Tổng |
|---|---:|---:|---:|
| Identity & Access | 1 | 4 | 5 |
| Customer & Membership | 2 | 3 | 5 |
| Product | 4 | 1 | 5 |
| Order | 4 | 1 | 5 |
| Shipment | 4 | 1 | 5 |
| **Tổng** | **15** | **10** | **25** |

**Lưu ý quan trọng:** Đây là trạng thái dựa trên bằng chứng kiểm thử đã có trong phiên làm việc, không phải kết quả của một lần chạy tự động toàn bộ 25 test cases. Các mục NOT TESTED chưa được xác nhận PASS/FAIL. Inventory rollback khi lỗi sau khi trừ kho cũng chưa được kiểm thử fault-injection riêng.