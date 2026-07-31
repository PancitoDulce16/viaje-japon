const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
export function enhanceDialog(dialog, { onClose } = {}) {
  if (!dialog) return () => {};
  const previousFocus = document.activeElement;
  dialog.setAttribute('role', dialog.getAttribute('role') || 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  const focusables = () => [...dialog.querySelectorAll(FOCUSABLE)].filter(node => !node.hidden);
  const onKeydown = event => {
    if (event.key === 'Escape' && onClose) { event.preventDefault(); onClose(); return; }
    if (event.key !== 'Tab') return;
    const nodes = focusables();
    if (!nodes.length) { event.preventDefault(); dialog.focus(); return; }
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  dialog.addEventListener('keydown', onKeydown);
  requestAnimationFrame(() => (focusables()[0] || dialog).focus());
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    dialog.removeEventListener('keydown', onKeydown);
    observer.disconnect();
    if (previousFocus?.isConnected) previousFocus.focus();
  };
  const observer = new MutationObserver(() => { if (!dialog.isConnected) cleanup(); });
  observer.observe(document.body, { childList: true, subtree: true });
  dialog.addEventListener('jp:dialog-close', cleanup, { once: true });
  return cleanup;
}
window.JapitinDialog = { enhance: enhanceDialog };
