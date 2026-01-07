/**
 * Security Utilities
 * Helper functions for security-related operations
 */

/**
 * Content Security Policy configuration
 */
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': [
    "'self'",
    'https://api.skyraven-ministries.org',
    'https://*.sentry.io',
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': [],
};

/**
 * Generate CSP header value from configuration
 */
export function generateCSPHeader(): string {
  return Object.entries(CSP_CONFIG)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Check if URL is safe (same origin or allowed domains)
 */
export function isSafeURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const allowedDomains = [
      'skyraven-ministries.org',
      'api.skyraven-ministries.org',
    ];

    return (
      urlObj.origin === window.location.origin ||
      allowedDomains.some((domain) => urlObj.hostname.endsWith(domain))
    );
  } catch {
    return false;
  }
}

/**
 * Rate limiter for client-side operations
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests = 10, timeWindowMs = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  check(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside time window
    const recentRequests = requests.filter((time) => now - time < this.timeWindow);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

/**
 * Generate a secure random ID
 */
export function generateSecureId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash sensitive data before storing/logging
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
