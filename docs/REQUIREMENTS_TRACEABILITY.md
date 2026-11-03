# Requirements Traceability

Nội dung được chuyển từ `Customer_Business_Functional_Requirements_Traceability.xlsx`.

| CR ID | Customer Requirement | BR ID | Business Requirement | FR ID | Functional Requirement | UC ID | Use Case | API |
|---|---|---|---|---|---|---|---|---|
| CR01 | Customer muốn đăng ký tài khoản để sử dụng hệ thống. | BR01 | Hệ thống phải hỗ trợ quản lý tài khoản Customer. | FR01 | Đăng ký tài khoản | UC01 | Register | POST /api/auth/register |
| CR02 | Customer muốn đăng nhập an toàn. | BR02 | Hệ thống phải xác thực người dùng trước khi truy cập các chức năng yêu cầu đăng nhập. | FR02 | Đăng nhập | UC02 | Login | POST /api/auth/login |
| CR03 | Customer muốn xem thông tin sản phẩm và số lượng còn lại. | BR03 | Hệ thống phải cung cấp thông tin sản phẩm và số lượng tồn kho. | FR06 | Xem sản phẩm | UC04 | View product | GET /api/products; GET /api/products/:pid |
| CR04 | Customer muốn đặt nhiều sản phẩm với số lượng mong muốn. | BR04 | Hệ thống phải cho phép Customer tạo đơn hàng từ các sản phẩm được chọn. | FR07 | Đặt hàng | UC06 | Place order | POST /api/orders |
| CR05 | Customer muốn được hưởng giảm giá dựa trên điểm thành viên. | BR05 | Hệ thống phải xác định mức giảm giá dựa trên điểm thành viên của Customer. | FR08 | Tính giảm giá | UC07 | Calculate discount | POST /api/orders |
| CR06 | Customer muốn biết đơn hàng của mình đang ở trạng thái nào. | BR06 | Hệ thống phải quản lý và cung cấp trạng thái đơn hàng/giao hàng. | FR12 | Xem trạng thái đơn hàng | UC12 | View order status | GET /api/shipments/:shipid |
| CR07 | Customer muốn cập nhật thông tin cá nhân. | BR07 | Hệ thống phải cho phép Customer xem và cập nhật thông tin cá nhân. | FR03 | Quản lý tài khoản | UC03 | Manage account | GET /api/customers/:uid; PUT /api/customers/:uid |

## Ghi chú
- Traceability trên giữ nguyên quan hệ CR → BR → FR → UC → API trong file nguồn.
- Các FR04, FR05, FR09, FR10, FR11 và FR13 được mô tả trong Functional Requirements nhưng không xuất hiện như một hàng CR riêng trong bảng traceability nguồn.
- Bảng này là truy vết yêu cầu, không phải kết quả kiểm thử. Xem [Test Execution Report](./TEST_EXECUTION_REPORT.md) để biết trạng thái 25 test cases.