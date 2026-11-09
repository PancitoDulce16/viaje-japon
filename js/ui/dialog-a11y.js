const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
export function enhanceDialog(dialog, { onClose } = {}) {
  if (!dialog) return () => {};
  const previousFocus = document.activeElement;
  if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
  dialog.setAttribute('role', dialog.getAttribute('role') || 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  const focusables = () => [...dialog.querySelectorAll(FOCUSABLE)].filter(node =>
    !node.hidden && !node.closest('[hidden], [inert]') && node.getClientRects().length > 0
  );
  const onKeydown = event => {
    if (event.key === 'Escape' && onClose) { event.preventDefault(); event.stopPropagation(); onClose(); return; }
    if (event.key !== 'Tab') return;
    const nodes = focusables();
    if (!nodes.length) { event.preventDefault(); dialog.focus(); return; }
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (event.shiftKey && (document.activeElement === first || !nodes.includes(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !nodes.includes(document.activeElement))) { event.preventDefault(); first.focus(); }
  };
  dialog.addEventListener('keydown', onKeydown);
  requestAnimationFrame(() => { if (dialog.isConnected) (focusables()[0] || dialog).focus(); });
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
