import { test as base, expect } from '@playwright/test';

// These are component/layout previews, not authenticated Firebase end-to-end
// tests. Keep dashboard auth initialization idle so its real signed-out redirect
// cannot race screenshot capture. The Firebase SDK remains signed out, preventing
// previews from writing private data. Production authentication is untouched.
export const test = base.extend({
  page: async ({ page }, use) => {
    // Component previews do not exercise the welcome tour's delayed overlay.
    await page.addInitScript(() => localStorage.setItem('japitin_tour_completed', 'true'));
    await page.route('**/js/core/auth.js*', route => route.fulfill({
      contentType: 'application/javascript',
      body: `export const AuthHandler = { currentUser: null, init: () => new Promise(() => {}) }; window.AuthHandler = AuthHandler; export default AuthHandler;`
    }));
    await use(page);
  }
});
export { expect };
