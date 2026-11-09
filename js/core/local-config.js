// Optional runtime configuration also works on a clean checkout and static hosting.
// Keep the absolute runtime path: bundled modules live under /assets/.
let pending;
export function loadOptionalLocalConfig() {
  pending ??= (async () => {
    try {
      const path = '/js/config-local.js';
      const module = await import(/* @vite-ignore */ path);
      return module.LOCAL_CONFIG || {};
    } catch {
      return {};
    }
  })();
  return pending;
}
