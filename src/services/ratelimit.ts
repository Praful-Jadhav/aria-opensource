// In-memory rate limiter for OTP and auth endpoints
// For production, replace with Redis-based solution

interface RateLimitEntry {
  count: number;
  resetAt: number;
  lockedUntil?: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean expired entries every 2 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt <= now && (!entry.lockedUntil || entry.lockedUntil <= now)) {
        store.delete(key);
      }
    }
  }, 2 * 60 * 1000);
}

export function checkRateLimit(
  key: string,
  maxAttempts: number = 3,
  windowMs: number = 10 * 60 * 1000, // 10 minutes
  lockMs: number = 30 * 60 * 1000 // 30 minutes lockout
): { allowed: boolean; retryAfterMs: number; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || (entry.resetAt <= now && (!entry.lockedUntil || entry.lockedUntil <= now))) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0, remaining: maxAttempts - 1 };
  }

  if (entry.lockedUntil && entry.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterMs: entry.lockedUntil - now,
      remaining: 0,
    };
  }

  if (entry.count >= maxAttempts) {
    entry.lockedUntil = now + lockMs;
    return {
      allowed: false,
      retryAfterMs: lockMs,
      remaining: 0,
    };
  }

  entry.count++;
  return {
    allowed: true,
    retryAfterMs: 0,
    remaining: maxAttempts - entry.count,
  };
}

// Rate limit specifically for OTP sends
export function checkOtpRateLimit(identifier: string, ip: string) {
  const idResult = checkRateLimit(`otp:id:${identifier}`, 3, 10 * 60 * 1000);
  const ipResult = checkRateLimit(`otp:ip:${ip}`, 10, 30 * 60 * 1000); // 10 per 30 mins per IP
  
  if (!ipResult.allowed) return ipResult;
  return idResult;
}

// Rate limit for login verify attempts
export function checkLoginRateLimit(identifier: string, ip: string) {
  const idResult = checkRateLimit(`login:id:${identifier}`, 5, 10 * 60 * 1000, 30 * 60 * 1000); // lockout for 30m after 5 fails
  const ipResult = checkRateLimit(`login:ip:${ip}`, 20, 60 * 60 * 1000); // 20 per hour per IP
  
  if (!ipResult.allowed) return ipResult;
  return idResult;
}
