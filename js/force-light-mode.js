// FORZAR LIGHT MODE SIEMPRE - DESACTIVAR DARK MODE COMPLETAMENTE

(function() {
  console.log('🌸 Forzando Light Mode permanentemente...');

  const html = document.documentElement;
  const body = document.body;

  // ELIMINAR clase dark inmediatamente
  html.classList.remove('dark');
  body.classList.remove('dark');
  html.removeAttribute('data-theme');

  // FORZAR light mode en localStorage
  localStorage.setItem('theme-preference', 'light');
  localStorage.setItem('theme', 'light');

  // Observar y eliminar cualquier intento de agregar dark
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (html.classList.contains('dark')) {
          console.log('⚠️ Removiendo dark mode forzado');
          html.classList.remove('dark');
        }
        if (body.classList.contains('dark')) {
          body.classList.remove('dark');
        }
      }
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        if (html.getAttribute('data-theme') === 'dark') {
          html.removeAttribute('data-theme');
        }
      }
    });
  });

  observer.observe(html, {
    attributes: true,
    attributeFilter: ['class', 'data-theme']
  });

  observer.observe(body, {
    attributes: true,
    attributeFilter: ['class']
  });

  // Interceptar cualquier intento de cambiar el tema
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    if (key === 'theme-preference' || key === 'theme') {
      console.log('🌸 Forzando light mode en localStorage');
      value = 'light';
    }
    originalSetItem.apply(this, [key, value]);
  };

  // Desactivar theme manager si existe
  if (window.ThemeManager) {
    console.log('⚠️ Desactivando ThemeManager');
    window.ThemeManager.applyTheme = function() {
      html.classList.remove('dark');
      body.classList.remove('dark');
      console.log('🌸 ThemeManager desactivado - Light mode forzado');
    };
  }

  console.log('✅ Light Mode permanente activado');
})();
