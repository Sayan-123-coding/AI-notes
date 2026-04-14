import rateLimit from 'express-rate-limit';

// Rate limiter for write operations (POST, PUT, DELETE)
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => req.method === 'GET', // Only apply to non-GET requests
  keyGenerator: (req) => req.userId || req.ip // Use userId if available, otherwise IP
});

// Rate limiter for read operations (GET)
export const readLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== 'GET', // Only apply to GET requests
  keyGenerator: (req) => req.userId || req.ip
});

// General limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes (more reasonable for testing)
  message: 'Too many login/register attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
});
