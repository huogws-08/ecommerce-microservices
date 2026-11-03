const { redisClient } = require("../config/redis");

const CACHE_TTL = 60;
const CACHE_PREFIX = "cache:products:";

function getCacheKey(req) {
    return `${CACHE_PREFIX}${req.originalUrl}`;
}

async function cacheMiddleware(req, res, next) {
    if (req.method !== "GET") {
        return next();
    }

    try {
        const cachedData = await redisClient.get(getCacheKey(req));

        if (cachedData !== null) {
            res.setHeader("X-Cache", "HIT");

            return res
                .status(200)
                .type("application/json")
                .send(cachedData);
        }

        res.setHeader("X-Cache", "MISS");
    } catch (error) {
        console.error("Redis cache read error:", error);
    }

    next();
}

async function saveProductCache(req, data) {
    try {
        await redisClient.setEx(getCacheKey(req), CACHE_TTL, data);
    } catch (error) {
        console.error("Redis cache write error:", error);
    }
}

async function invalidateProductCache() {
    try {
        for await (const key of redisClient.scanIterator({
            MATCH: `${CACHE_PREFIX}*`,
            COUNT: 100,
        })) {
            await redisClient.del(key);
        }
    } catch (error) {
        console.error("Redis cache invalidation error:", error);
    }
}

module.exports = {
    cacheMiddleware,
    saveProductCache,
    invalidateProductCache,
};