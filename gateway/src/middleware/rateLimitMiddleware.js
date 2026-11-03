const { redisClient } = require("../config/redis");

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 100;

async function rateLimitMiddleware(req, res, next) {
  const ip = req.ip;
  const key = `rate-limit:${ip}`;

  try {
    const currentCount = await redisClient.incr(key);

    if (currentCount === 1) {
      await redisClient.expire(key, WINDOW_SECONDS);
    }

    if (currentCount > MAX_REQUESTS) {
      return res.status(429).json({
        message: "Too many requests"
      });
    }

    next();
  } catch (error) {
    console.error("Rate limit error:", error);

    return res.status(500).json({
      message: "Rate limiting service error"
    });
  }
}

module.exports = rateLimitMiddleware;