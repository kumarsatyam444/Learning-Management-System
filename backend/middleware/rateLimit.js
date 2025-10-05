const { getRedisClient } = require('../config/redis');

const rateLimit = async (req, res, next) => {
  const redisClient = getRedisClient();
  
  if (!redisClient || !redisClient.isOpen) {
    return next();
  }

  try {
    const userId = req.userId || req.ip;
    const key = `ratelimit:${userId}`;
    
    const current = await redisClient.get(key);
    
    if (current && parseInt(current) >= 60) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT',
          message: 'Too many requests. Please try again later.'
        }
      });
    }

    const multi = redisClient.multi();
    multi.incr(key);
    if (!current) {
      multi.expire(key, 60);
    }
    await multi.exec();

    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    next();
  }
};

module.exports = rateLimit;
