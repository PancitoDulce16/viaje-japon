/** Creates a shared, retryable promise for a feature split across ES modules. */
export function createFeatureLoader(loaders) {
  if (!Array.isArray(loaders) || loaders.length === 0 || loaders.some(loader => typeof loader !== 'function')) {
    throw new TypeError('Feature loaders must be a non-empty array of functions');
  }
  let pending = null;
  return function loadFeature() {
    if (!pending) {
      pending = Promise.all(loaders.map(loader => loader())).then(() => true).catch(error => {
        pending = null;
        throw error;
      });
    }
    return pending;
  };
}
