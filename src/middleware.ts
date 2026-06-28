import { defineMiddleware } from 'astro:middleware';
import { isRateLimited, getClientIp } from './lib/rate-limiter';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url, clientAddress } = context;
  
  // Rate Limiting for sensitive POST routes
  if (request.method === 'POST') {
    const ip = getClientIp(request, clientAddress);
    const path = url.pathname;
    
    if (path.startsWith('/api/upload')) {
      const check = isRateLimited(ip, 'upload', 15, 60 * 1000); // 15 uploads per minute
      if (check.limited) {
        return new Response(JSON.stringify({ error: `Too many upload requests. Please wait ${check.retryAfter} seconds.` }), {
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': String(check.retryAfter)
          }
        });
      }
    } else if (path.includes('/login') || path.includes('/register')) {
      const check = isRateLimited(ip, 'auth', 10, 60 * 1000); // 10 authentication attempts per minute
      if (check.limited) {
        const acceptHeader = request.headers.get('accept') || '';
        if (acceptHeader.includes('json')) {
          return new Response(JSON.stringify({ error: `Too many authentication attempts. Please try again after ${check.retryAfter} seconds.` }), {
            status: 429,
            headers: { 
              'Content-Type': 'application/json',
              'Retry-After': String(check.retryAfter)
            }
          });
        }
        return new Response(`Too many authentication attempts. Please wait ${check.retryAfter} seconds.`, {
          status: 429,
          headers: { 
            'Retry-After': String(check.retryAfter)
          }
        });
      }
    } else if (path.includes('/contact') || path.includes('/inquiry')) {
      const check = isRateLimited(ip, 'contact', 5, 60 * 1000); // 5 submissions per minute
      if (check.limited) {
        return new Response(`Too many submissions. Please wait ${check.retryAfter} seconds before trying again.`, {
          status: 429,
          headers: { 
            'Retry-After': String(check.retryAfter)
          }
        });
      }
    }
  }

  const response = await next();
  
  // Apply standard HTTP security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Set Content-Security-Policy (CSP)
  const csp = [
    "default-src 'self'",
    `img-src 'self' data: blob: res.cloudinary.com https://*.cloudinary.com`,
    `media-src 'self' blob: res.cloudinary.com https://*.cloudinary.com`,
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://*.cloudinary.com",
    "frame-src 'self'",
    "object-src 'none'",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
});
