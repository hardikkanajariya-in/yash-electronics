interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory registry for rate limit records
const limiters = new Map<string, Map<string, RateLimitRecord>>();

/**
 * Checks if a client IP is rate limited for a specific route.
 * @returns Object with limited status, retryAfter (seconds), and remaining requests.
 */
export function isRateLimited(
  ip: string,
  route: string,
  limit: number,
  windowMs: number
): { limited: boolean; retryAfter: number; remaining: number } {
  const now = Date.now();
  
  if (!limiters.has(route)) {
    limiters.set(route, new Map());
  }
  
  const routeLimiters = limiters.get(route)!;
  const record = routeLimiters.get(ip);
  
  if (!record) {
    routeLimiters.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { limited: false, retryAfter: 0, remaining: limit - 1 };
  }
  
  // If the window has expired, reset the counter
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { limited: false, retryAfter: 0, remaining: limit - 1 };
  }
  
  // Check if limit is exceeded
  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { limited: true, retryAfter, remaining: 0 };
  }
  
  record.count++;
  const remaining = limit - record.count;
  return { limited: false, retryAfter: 0, remaining };
}

/**
 * Resolves the client's public IP address, preferring proxy headers (Cloudflare, Load balancers).
 */
export function getClientIp(request: Request, clientAddress?: string): string {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;
  
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  return clientAddress || '127.0.0.1';
}

// Clean up expired entries every 10 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [_, routeLimiters] of limiters.entries()) {
    for (const [ip, record] of routeLimiters.entries()) {
      if (now > record.resetTime) {
        routeLimiters.delete(ip);
      }
    }
  }
}, 10 * 60 * 1000);
