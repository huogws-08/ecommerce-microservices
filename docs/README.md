# Project Documentation

Tài liệu yêu cầu và kiểm thử của E-commerce Microservices MVP.

## Tài liệu
- [Customer Requirement](./CUSTOMER_REQUIREMENT.md): yêu cầu tổng quan từ khách hàng.
- [Functional Requirements & Use Cases](./FUNCTIONAL_REQUIREMENTS_AND_USE_CASES.md): FR01–FR13 và UC01–UC13.
- [API Specification](./API_SPECIFICATION.md): danh sách API, request/response và mã HTTP.
- [Requirements Traceability](./REQUIREMENTS_TRACEABILITY.md): liên kết CR → BR → FR → UC → API.
- [25 Test Cases](./TEST_CASES_25_BOUNDED_CONTEXTS.md): 25 test case gốc theo 5 Bounded Contexts.
- [Test Execution Report](./TEST_EXECUTION_REPORT.md): trạng thái thực thi dựa trên bằng chứng hiện có.

## Bounded Contexts
1. Identity & Access
2. Customer & Membership
3. Order Management
4. Product Catalog
5. Shipment

## Lưu ý
Các tài liệu Markdown này được chuyển nội dung từ tài liệu phân tích/đặc tả được cung cấp cho dự án. Trạng thái kiểm thử chỉ được đánh dấu PASS khi có bằng chứng chạy thực tế; trường hợp chưa có bằng chứng được ghi NOT TESTED.