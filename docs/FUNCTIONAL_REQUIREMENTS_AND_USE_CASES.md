# Functional Requirements & Use Cases

Nội dung được chuyển từ hai tài liệu Excel do người dùng cung cấp.

## 1. Functional Requirements

| FR ID | Chức năng | Mô tả |
|---|---|---|
| FR01 | Đăng ký tài khoản | Người dùng tạo tài khoản với tên đăng nhập và mật khẩu. |
| FR02 | Đăng nhập | Người dùng đăng nhập để sử dụng các chức năng cần xác thực. |
| FR03 | Quản lý tài khoản | Người dùng xem và cập nhật thông tin cá nhân. |
| FR04 | Quản lý khách hàng | Hệ thống lưu thông tin khách hàng và hạng thành viên. |
| FR05 | Quản lý sản phẩm | Người quản trị thêm, sửa, xóa và xem thông tin sản phẩm. |
| FR06 | Xem sản phẩm | Người dùng xem tên, giá và số lượng còn lại của sản phẩm. |
| FR07 | Đặt hàng | Người dùng chọn sản phẩm, số lượng và gửi yêu cầu đặt hàng. |
| FR08 | Tính giảm giá | Hệ thống dựa trên điểm thành viên để xác định mức giảm giá cho đơn hàng. |
| FR09 | Cập nhật tồn kho | Sau khi đặt hàng thành công, số lượng sản phẩm được cập nhật. |
| FR10 | Quản lý đơn hàng | Hệ thống tạo và lưu thông tin đơn hàng cùng các sản phẩm trong đơn. |
| FR11 | Quản lý giao hàng | Hệ thống chuyển đơn hàng cho bộ phận giao hàng và cập nhật trạng thái. |
| FR12 | Xem trạng thái đơn hàng | Người dùng xem trạng thái xử lý và giao hàng của đơn hàng. |
| FR13 | Phân quyền | Hệ thống xác định quyền sử dụng chức năng dựa trên vai trò của tài khoản. |

## 2. Use Cases

| UC ID | Use Case | Actor | Related FR | Related API |
|---|---|---|---|---|
| UC01 | Register | Customer | FR01 | POST /api/auth/register |
| UC02 | Login | Customer / Admin | FR02 | POST /api/auth/login |
| UC03 | Manage account | Customer | FR03 | GET /api/customers/:uid; PUT /api/customers/:uid |
| UC04 | View product | Customer | FR06 | GET /api/products; GET /api/products/:pid |
| UC05 | Manage product | Admin | FR05 | POST /api/products; PUT /api/products/:pid; DELETE /api/products/:pid |
| UC06 | Place order | Customer | FR07 | POST /api/orders |
| UC07 | Calculate discount | Customer / Order Service | FR08 | POST /api/orders |
| UC08 | Update inventory | Order Service / Product Service | FR09 | Internal gRPC Product Service |
| UC09 | Create order | Order Service | FR07 | POST /api/orders |
| UC10 | View order | Customer / Admin | FR10 | GET /api/orders; GET /api/orders/:oid |
| UC11 | Update shipment | Shipment Staff / Admin | FR11 | PATCH /api/shipments/:shipid/status |
| UC12 | View order status | Customer | FR12 | GET /api/shipments/:shipid |
| UC13 | Authorization | Customer / Admin / Shipment Staff | FR13 | Applies to protected APIs |

## 3. Important Use Case Flows

### UC06 – Place order
1. Customer selects products and quantities.
2. API Gateway verifies JWT.
3. System gets Customer information.
4. System gets membership score.
5. Order Service calculates discount.
6. Product Service checks product price and stock.
7. Product Service updates inventory.
8. Order Service creates Order and OrderDetail.
9. Order Service stores OutboxEvent in the same transaction.
10. Event is published to Kafka.
11. Shipment Service consumes OrderCreated.
12. System returns order result to Customer.

Exceptions: invalid token → 401; Customer/Product not found → 404; insufficient stock → 409; validation error → 400; downstream failure must not leave an inconsistent committed order.

### UC09 – Create order
1. Begin database transaction.
2. Insert Order.
3. Insert OrderDetail records with unit_price.
4. Insert OutboxEvent(OrderCreated).
5. Commit transaction.
6. Background publisher sends event to Kafka.

Exceptions: database failure → rollback transaction; Kafka failure after commit → Outbox remains pending for retry.

### UC13 – Authorization
1. Request arrives at API Gateway.
2. System validates JWT.
3. System reads subject and role claims.
4. System checks required permission.
5. Request is allowed or rejected.

Exceptions: missing/invalid JWT → 401; valid JWT but insufficient role → 403.