function syncActive(tab) {
  document.querySelectorAll('.jp-desktop-rail [data-rail-tab]').forEach((item) => {
    const active = item.dataset.railTab === tab;
    item.classList.toggle('active', active);
    if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
  });
}

function setupShell() {
  document.querySelectorAll('.tab-btn[data-tab]').forEach((button) => button.addEventListener('click', () => syncActive(button.dataset.tab)));
  document.querySelectorAll('.jp-desktop-rail button').forEach((button) => { if (!button.title) button.title = button.textContent.trim(); });
  window.addEventListener('themeChanged', ({ detail }) => { document.documentElement.dataset.theme = detail.effectiveTheme; });
  syncActive('home');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupShell); else setupShell();
window.JapitinShell = { syncActive };
