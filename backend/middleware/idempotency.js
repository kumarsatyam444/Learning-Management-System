const { getRedisClient } = require('../config/redis');

const idempotency = async (req, res, next) => {
  const redisClient = getRedisClient();
  
  if (!redisClient || !redisClient.isOpen) {
    return next();
  }

  const idempotencyKey = req.header('Idempotency-Key');
  
  if (!idempotencyKey) {
    return res.status(400).json({
      error: {
        code: 'FIELD_REQUIRED',
        field: 'Idempotency-Key',
        message: 'Idempotency-Key header is required'
      }
    });
  }

  try {
    const key = `idempotency:${idempotencyKey}`;
    const cached = await redisClient.get(key);

    if (cached) {
      const response = JSON.parse(cached);
      return res.status(response.statusCode).json(response.body);
    }

    const originalJson = res.json.bind(res);
    res.json = function(body) {
      const statusCode = res.statusCode || 200;
      
      redisClient.setEx(key, 86400, JSON.stringify({ statusCode, body }))
        .catch(err => console.error('Redis cache error:', err));

      return originalJson(body);
    };

    next();
  } catch (error) {
    console.error('Idempotency error:', error);
    next();
  }
};

module.exports = idempotency;
