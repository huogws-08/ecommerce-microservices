
const express = require("express");

const {
  createProxyMiddleware,
  fixRequestBody,
  responseInterceptor,
} = require("http-proxy-middleware");

const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const requireOwnerOrAdmin = require("../middleware/ownershipMiddleware");

const {
  cacheMiddleware,
  saveProductCache,
  invalidateProductCache,
} = require("../middleware/cacheMiddleware");

const router = express.Router();

// ==================== HEALTH ====================

router.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// ==================== JWT TEST ====================

router.get("/test-auth", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "JWT authentication passed",
    user: req.user,
  });
});

// ==================== AUTH SERVICE ====================

router.use(
  "/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/auth${path}`,
    on: {
      proxyReq: fixRequestBody,
    },
  })
);

// ==================== CUSTOMER SERVICE ====================

const customerProxy = createProxyMiddleware({
  target: process.env.CUSTOMER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: (path) =>
    `/api/customers${path.replace(/^\/customers(?=\/|$)/, "")}`,
  on: {
    proxyReq: fixRequestBody,
  },
});

// Customer xem thông tin của mình, ADMIN xem được tất cả.
router.get(
  "/customers/:uid",
  authMiddleware,
  requireOwnerOrAdmin,
  customerProxy
);

router.put(
  "/customers/:uid",
  authMiddleware,
  requireOwnerOrAdmin,
  customerProxy
);

// Membership: CUSTOMER chỉ xem của mình, ADMIN xem được tất cả.
router.get(
  "/customers/:uid/membership",
  authMiddleware,
  requireOwnerOrAdmin,
  customerProxy
);

// Chỉ ADMIN được cập nhật score và tier.
router.patch(
  "/customers/:uid/membership",
  authMiddleware,
  requireRole("ADMIN"),
  customerProxy
);

// ==================== PRODUCT SERVICE ====================

const productProxy = createProxyMiddleware({
  target: process.env.PRODUCT_SERVICE_URL,
  changeOrigin: true,

  pathRewrite: (path) => `/api/products${path}`,

  selfHandleResponse: true,

  on: {
    proxyReq: fixRequestBody,

    proxyRes: responseInterceptor(
      async (responseBuffer, proxyRes, req, res) => {
        const statusCode = proxyRes.statusCode;

        if (req.method === "GET" && statusCode === 200) {
          await saveProductCache(
            req,
            responseBuffer.toString("utf8")
          );
        }

        if (
          ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
          statusCode >= 200 &&
          statusCode < 300
        ) {
          await invalidateProductCache();
        }

        return responseBuffer;
      }
    ),
  },
});

router.use(
  "/products",
  authMiddleware,

  (req, res, next) => {
    if (
      ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
    ) {
      return requireRole("ADMIN")(req, res, next);
    }

    next();
  },
  cacheMiddleware,
  productProxy
);

// ==================== ORDER SERVICE ====================

router.use(
  "/orders",
  authMiddleware,

  (req, res, next) => {
    delete req.headers["x-user-id"];
    delete req.headers["x-user-role"];
    next();
  },

  createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/orders${path}`,

    on: {
      proxyReq: (proxyReq, req, res) => {
        // Set headers trước khi ghi request body
        proxyReq.setHeader("x-user-id", String(req.user.uid));
        proxyReq.setHeader("x-user-role", String(req.user.role));

        // Forward body sau khi đã thiết lập headers
        fixRequestBody(proxyReq, req, res);
      },
    },
  })
);

// ==================== SHIPMENT SERVICE ====================

router.use(
  "/shipments",
  authMiddleware,
  createProxyMiddleware({
    target: process.env.SHIPMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/shipments${path}`,
    on: {
      proxyReq: (proxyReq, req) => {
        proxyReq.removeHeader("x-user-id");
        proxyReq.removeHeader("x-user-role");

        proxyReq.setHeader("x-user-id", String(req.user.uid));
        proxyReq.setHeader("x-user-role", req.user.role);

        fixRequestBody(proxyReq, req);
      },
    },
  })
);

module.exports = router;
