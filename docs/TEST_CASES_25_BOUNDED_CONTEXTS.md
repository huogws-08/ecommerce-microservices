# 25 Test Cases – 5 Bounded Contexts

Các test case dưới đây được chuyển từ tài liệu `25_TestCases_5_BoundedContexts.xlsx`. Nội dung, mã test, điều kiện đầu vào và kết quả mong đợi được giữ theo tài liệu nguồn.

## 1. Identity & Access

| Test Case ID | Test Case | Input / Điều kiện | Expected Result |
|---|---|---|---|
| TC-IAM-01 | Đăng ký tài khoản hợp lệ | username + password hợp lệ | Tạo User thành công, trả 201 Created |
| TC-IAM-02 | Đăng ký username đã tồn tại | username đã tồn tại | Không tạo User, trả 409 Conflict |
| TC-IAM-03 | Đăng ký thiếu password | username hợp lệ, password rỗng | Trả 400 Bad Request |
| TC-IAM-04 | Đăng nhập đúng thông tin | username + password đúng | Đăng nhập thành công, trả JWT token |
| TC-IAM-05 | Đăng nhập sai password | username đúng, password sai | Trả 401 Unauthorized |

## 2. Customer & Membership

| Test Case ID | Test Case | Input / Điều kiện | Expected Result |
|---|---|---|---|
| TC-CUS-01 | Lấy Customer tồn tại | uid hợp lệ | Trả thông tin Customer |
| TC-CUS-02 | Lấy Customer không tồn tại | uid không tồn tại | Trả 404 Not Found |
| TC-CUS-03 | Cập nhật fullname | fullname hợp lệ | Thông tin Customer được cập nhật |
| TC-CUS-04 | Lấy thông tin Membership | Customer có mid | Trả mname và score |
| TC-CUS-05 | Truy vấn Customer không có token | Không gửi JWT | Trả 401 Unauthorized |

## 3. Product

| Test Case ID | Test Case | Input / Điều kiện | Expected Result |
|---|---|---|---|
| TC-PRO-01 | Lấy danh sách Product | GET /api/products | Trả danh sách sản phẩm |
| TC-PRO-02 | Lấy Product tồn tại | pid hợp lệ | Trả thông tin Product |
| TC-PRO-03 | Lấy Product không tồn tại | pid không tồn tại | Trả 404 Not Found |
| TC-PRO-04 | Tạo Product | pname, price, quantity hợp lệ | Tạo Product, trả 201 Created |
| TC-PRO-05 | Cập nhật tồn kho | pid + quantity hợp lệ | Quantity được cập nhật chính xác |

## 4. Order

| Test Case ID | Test Case | Input / Điều kiện | Expected Result |
|---|---|---|---|
| TC-ORD-01 | Tạo Order hợp lệ | JWT + Product + qty hợp lệ | Tạo Order và OrderDetail thành công |
| TC-ORD-02 | Tạo Order không có JWT | Không có token | Trả 401 Unauthorized |
| TC-ORD-03 | Đặt số lượng vượt tồn kho | qty > quantity | Không tạo Order, trả lỗi tồn kho |
| TC-ORD-04 | Tính discount theo score | Customer có score hợp lệ | Discount được tính đúng |
| TC-ORD-05 | Tạo Order và phát sự kiện | Order hợp lệ | Order được lưu và phát OrderCreated vào Kafka |

## 5. Shipment

| Test Case ID | Test Case | Input / Điều kiện | Expected Result |
|---|---|---|---|
| TC-SHP-01 | Nhận OrderCreated Event | Kafka event hợp lệ | Shipment được tạo |
| TC-SHP-02 | Event thiếu oid | Kafka event không đầy đủ | Không tạo Shipment, ghi nhận lỗi |
| TC-SHP-03 | Cập nhật trạng thái Shipment | status = SHIPPING | Trạng thái được cập nhật |
| TC-SHP-04 | Cập nhật Shipment không tồn tại | shipid không tồn tại | Trả 404 Not Found |
| TC-SHP-05 | Nhận cùng Event hai lần | Cùng OrderCreated event | Không tạo Shipment trùng |

## Tổng hợp
- Identity & Access: 5 test cases
- Customer & Membership: 5 test cases
- Product: 5 test cases
- Order: 5 test cases
- Shipment: 5 test cases
- Tổng: **25 test cases**