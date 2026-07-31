let accountPromise;
export function loadAccount() {
  accountPromise ||= Promise.allSettled([
    import('../ui/user-profile.js'), import('../ui/user-settings.js'), import('../ui/settings-ui.js')
  ]).then(() => true);
  return accountPromise;
}
document.addEventListener('click', async (event) => {
  const trigger = event.target.closest('[onclick*="openProfile"],[onclick*="openSettings"]');
  if (!trigger || trigger.dataset.accountReady) return;
  event.preventDefault(); event.stopImmediatePropagation(); await loadAccount(); trigger.dataset.accountReady = 'true'; trigger.click();
}, true);
window.JapitinPerformance = { ...(window.JapitinPerformance || {}), loadAccount };
