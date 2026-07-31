export function createSerialTaskQueue(task) {
  if (typeof task !== 'function') throw new TypeError('Serial queue requires a task function');
  let tail = Promise.resolve();
  return (...args) => {
    const pending = tail.catch(() => undefined).then(() => task(...args));
    tail = pending;
    return pending;
  };
}
