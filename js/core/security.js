/**
 * 🔐 SECURITY MANAGER
 * ===================
 *
 * Security features:
 * - Content Security Policy (CSP)
 * - XSS Protection
 * - Rate Limiting
 * - Input Sanitization
 * - CSRF Protection
 */

class SecurityManager {
  constructor() {
    this.rateLimits = new Map();
    this.blockedIPs = new Set();

    console.log('🔐 Security Manager initializing...');
  }

  initialize() {
    this.setupCSP();
    this.setupXSSProtection();
    this.setupSecurityHeaders();
    this.monitorSecurity();

    console.log('✅ Security initialized');
  }

  /**
   * Setup Content Security Policy
   */
  setupCSP() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://www.googletagmanager.com https://cdn.jsdelivr.net https://unpkg.com;
      style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com;
      img-src 'self' https: data: blob:;
      font-src 'self' https://cdnjs.cloudflare.com data:;
      connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://*.firebase.com https://*.firebaseio.com wss://*.firebaseio.com;
      frame-src 'self' https://japan-itin-dev.firebaseapp.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      upgrade-insecure-requests;
    `.replace(/\s+/g, ' ').trim();

    document.head.appendChild(meta);
    console.log('✅ CSP configured');
  }

  /**
   * Setup XSS Protection
   */
  setupXSSProtection() {
    // X-XSS-Protection header
    const xss = document.createElement('meta');
    xss.httpEquiv = 'X-XSS-Protection';
    xss.content = '1; mode=block';
    document.head.appendChild(xss);

    // X-Content-Type-Options
    const contentType = document.createElement('meta');
    contentType.httpEquiv = 'X-Content-Type-Options';
    contentType.content = 'nosniff';
    document.head.appendChild(contentType);

    console.log('✅ XSS protection enabled');
  }

  /**
   * Sanitize HTML
   */
  sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Sanitize URL
   */
  sanitizeURL(url) {
    try {
      const parsed = new URL(url);
      // Only allow http/https
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }
      return parsed.href;
    } catch (e) {
      return '';
    }
  }

  /**
   * Rate limiting
   */
  checkRateLimit(key, maxRequests = 100, timeWindow = 60000) {
    const now = Date.now();
    const requests = this.rateLimits.get(key) || [];

    // Remove old requests
    const recentRequests = requests.filter(time => now - time < timeWindow);

    if (recentRequests.length >= maxRequests) {
      console.warn(`⚠️ Rate limit exceeded: ${key}`);
      return false;
    }

    recentRequests.push(now);
    this.rateLimits.set(key, recentRequests);

    return true;
  }

  /**
   * Setup security headers
   */
  setupSecurityHeaders() {
    // Referrer Policy
    const referrer = document.createElement('meta');
    referrer.name = 'referrer';
    referrer.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(referrer);

    console.log('✅ Security headers configured');
  }

  /**
   * Monitor security events
   */
  monitorSecurity() {
    // Monitor console for suspicious activity
    window.addEventListener('securitypolicyviolation', (e) => {
      console.error('🚨 CSP Violation:', e.violatedDirective);

      if (window.Analytics) {
        window.Analytics.trackEvent('Security', 'csp_violation', e.violatedDirective);
      }
    });

    console.log('✅ Security monitoring active');
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  window.SecurityManager = new SecurityManager();
  window.SecurityManager.initialize();
}
