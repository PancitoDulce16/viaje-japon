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
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'home';
  syncActive(activeTab);
  const tabs = document.querySelector('#tabSelector');
  if (tabs) new MutationObserver(() => {
    const current = tabs.querySelector('.tab-btn.active')?.dataset.tab;
    if (current) syncActive(current);
  }).observe(tabs, { attributes: true, attributeFilter: ['class'], subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupShell); else setupShell();
window.JapitinShell = { syncActive };

window.addEventListener('itinerary-save-state', ({ detail }) => {
  const status = document.querySelector('#itinerarySaveStatus');
  if (!status) return;
  const labels = {
    saving: 'Itinerario: guardando cambios…',
    pending: 'Itinerario: cambios pendientes de sincronizar. Esperando conexión.',
    saved: 'Itinerario: cambios guardados.',
    error: 'Itinerario: no se pudieron guardar los cambios. Revisa tu conexión e intenta de nuevo.'
  };
  status.hidden = !labels[detail.state];
  status.dataset.state = detail.state;
  status.textContent = labels[detail.state] || '';
});
