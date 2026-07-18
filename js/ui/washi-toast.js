// js/ui/washi-toast.js
//
// 🌸 WASHI TOAST — notitas de papel apiladas (idea #156 del brainstorm)
// con soporte de acción ("Deshacer", idea #43).
//
// Uso:
//   WashiToast.show({ message: 'Actividad eliminada', type: 'success' })
//   WashiToast.show({ message: '...', actionLabel: 'Deshacer', onAction: () => {...} })
//
// - type: 'success' (sello ✓ matcha) | 'error' (tinta sango) | 'info' (kasumi)
// - duration ms (default 5000; con acción 6500)
// - Accesible: role=status + aria-live polite; la acción es <button> real.
// - Convive con el sistema Notifications existente; este es para feedback
//   de acciones del usuario (especialmente las reversibles).

const STACK_ID = 'washiToastStack';

function stack() {
  let el = document.getElementById(STACK_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = STACK_ID;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  return el;
}

export const WashiToast = {
  show({ message, type = 'info', actionLabel = null, onAction = null, duration = null } = {}) {
    if (!message) return;
    const ms = duration ?? (actionLabel ? 8000 : 5000);

    const t = document.createElement('div');
    t.className = `washi-toast washi-toast--${type}`;
    t.innerHTML = `
      <span class="washi-toast__icon" aria-hidden="true">${type === 'success' ? '✓' : type === 'error' ? '✕' : '🌸'}</span>
      <span class="washi-toast__msg"></span>
      ${actionLabel ? `<button type="button" class="washi-toast__action"></button>` : ''}
      <span class="washi-toast__timer" style="animation-duration:${ms}ms" aria-hidden="true"></span>
    `;
    t.querySelector('.washi-toast__msg').textContent = message;

    let done = false;
    const dismiss = () => {
      if (done) return;
      done = true;
      t.classList.add('is-leaving');
      setTimeout(() => t.remove(), 260);
    };

    if (actionLabel) {
      const btn = t.querySelector('.washi-toast__action');
      btn.textContent = actionLabel;
      btn.addEventListener('click', () => {
        dismiss();
        try { onAction?.(); } catch (e) { console.error('WashiToast action:', e); }
      });
    }
    t.addEventListener('click', (e) => {
      if (!e.target.closest('.washi-toast__action')) dismiss();
    });

    stack().appendChild(t);
    setTimeout(dismiss, ms);
    return { dismiss };
  }
};

window.WashiToast = WashiToast;
