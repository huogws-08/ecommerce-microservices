# API Specification – E-commerce MVP

Đặc tả được chuyển từ `API_Specification_Ecommerce_MVP.xlsx`. Endpoint và response mẫu được giữ theo tài liệu nguồn.

| API ID | Bounded Context | Method | Endpoint | Auth | Success |
|---|---|---|---|---|---|
| API-AUTH-01 | Identity & Access | POST | /api/auth/register | No | 201 |
| API-AUTH-02 | Identity & Access | POST | /api/auth/login | No | 200 |
| API-CUS-01 | Customer & Membership | GET | /api/customers/:uid | Bearer JWT | 200 |
| API-CUS-02 | Customer & Membership | PUT | /api/customers/:uid | Bearer JWT | 200 |
| API-PRO-01 | Product Catalog | GET | /api/products | Bearer JWT | 200 |
| API-PRO-02 | Product Catalog | GET | /api/products/:pid | Bearer JWT | 200 |
| API-PRO-03 | Product Catalog | POST | /api/products | Bearer JWT (Admin) | 201 |
| API-PRO-04 | Product Catalog | PUT | /api/products/:pid | Bearer JWT (Admin) | 200 |
| API-PRO-05 | Product Catalog | DELETE | /api/products/:pid | Bearer JWT (Admin) | 200 |
| API-ORD-01 | Order Management | POST | /api/orders | Bearer JWT | 201 |
| API-ORD-02 | Order Management | GET | /api/orders | Bearer JWT | 200 |
| API-ORD-03 | Order Management | GET | /api/orders/:oid | Bearer JWT | 200 |
| API-SHP-01 | Shipment | GET | /api/shipments/:shipid | Bearer JWT | 200 |
| API-SHP-02 | Shipment | PATCH | /api/shipments/:shipid/status | Bearer JWT (Shipment Staff/Admin) | 200 |
| API-HEALTH-01 | System | GET | /api/health | No | 200 |

## Request/response mẫu theo đặc tả

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john",
  "password": "P@ss123",
  "email": "john@example.com",
  "phone": "0900000000"
}
```

Expected: `201`
```json
{"message":"User registered successfully","uid":1}
```
Errors: 400 missing/invalid data; 409 duplicate username/email. Password must be hashed with bcrypt.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{"username":"john","password":"P@ss123"}
```

Expected: `200`, JWT response. Errors: 400 missing data; 401 invalid username/password. JWT payload should include `sub` and `role`.

### Create Order
```http
POST /api/orders
Authorization: Bearer <JWT>
Content-Type: application/json

{"items":[{"pid":1,"qty":2},{"pid":2,"qty":1}]}
```

Expected: `201`; backend calculates discount and unit prices, then publishes OrderCreated through Outbox/Kafka. Errors: 400 invalid items; 401 unauthorized; 404 Product/Customer not found; 409 insufficient stock.

### Shipment status
```http
PATCH /api/shipments/:shipid/status
Authorization: Bearer <JWT>
Content-Type: application/json

{"status":"SHIPPING"}
```

Expected: `200`. Errors: 400 invalid status; 401 unauthorized; 403 forbidden; 404 shipment not found.

### Health
```http
GET /api/health
```

Expected: `200` and system status UP. The source notes that dependency health checks can be extended for PostgreSQL, MongoDB, Redis and Kafka.

## Notes
- Product write operations are Admin-only in the source specification.
- Customer can access own order; Admin may access a broader scope according to authorization rules.
- Shipment creation/update is asynchronous from OrderCreated.
- The source API specification uses `qty` in the sample order request. The current implementation test in this project used `quantity`; verify the contract before using the sample unchanged.