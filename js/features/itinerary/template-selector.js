import { templateCatalog, getTemplate, instantiateTemplate, templateStartDate, shiftCalendarDate } from './template-library.js';
import { enhanceDialog } from '../../ui/dialog-a11y.js';

const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dateLabel = value => new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));

export function renderTemplateCard(template) {
  const start = templateStartDate(template);
  return `<article class="jp-template-card" data-template-id="${safe(template.id)}">
    <div class="jp-eyebrow">${template.defaultStartDate ? 'TU RUTA DE INVIERNO' : 'RUTA CLÁSICA · PERSONALIZABLE'}</div>
    <h3>${safe(template.name)}</h3><p>${safe(template.description)}</p>
    <div class="jp-template-card__facts"><span class="jp-badge">${template.duration} días</span><span class="jp-badge">${template.duration - 1} noches</span><span class="jp-badge">${safe(template.cities.join(' → '))}</span></div>
    <ul class="jp-template-card__highlights">${(template.highlights || []).slice(0, 4).map(item => `<li>${safe(item)}</li>`).join('')}</ul>
    <details class="jp-template-preview"><summary>Ver los ${template.duration} días y pendientes</summary>
      <ol>${template.days.map((day, index) => `<li><strong>Día ${index + 1} · ${safe(day.title)}</strong><span>${safe(day.activities.map(a => a.title || a.name || a.activity).join(' · '))}</span></li>`).join('')}</ol>
      ${(template.pendingDecisions || []).length ? `<h4>Por confirmar</h4><ul>${template.pendingDecisions.map(item => `<li><strong>${safe(item.original)}</strong>: ${safe(item.notes)}</li>`).join('')}</ul>` : ''}
      ${(template.bookingChecklist || []).length ? `<h4>Reservas y preparativos</h4><ul>${template.bookingChecklist.map(item => `<li>${safe(item.title)}${item.dueDate ? ` · ${safe(item.dueDate)} · ${safe(item.deadlineLocalTime)} (${safe(item.timeZone)})` : ''}<p>${safe(item.notes)}</p></li>`).join('')}</ul>` : ''}
    </details>
    <form class="jp-template-create" data-template-form="${safe(template.id)}">
      <label for="template-start-${safe(template.id)}">Primer día<input id="template-start-${safe(template.id)}" name="dateStart" type="date" required value="${start}"></label>
      <p class="jp-template-end" aria-live="polite">Hasta el ${dateLabel(shiftCalendarDate(start, template.duration - 1))}</p>
      <p class="jp-template-create__note">Crea un viaje nuevo y editable. Hoteles y entradas quedan por confirmar.${template.defaultStartDate ? ' Si cambiás la fecha, revisá cierres y reservas.' : ''}</p>
      <p class="jp-template-error" role="alert" hidden></p>
      <button class="jp-button jp-button--primary" type="submit">Crear viaje con esta plantilla</button>
    </form>
  </article>`;
}

export function openTemplateLibrary({ onCreate } = {}) {
  document.getElementById('templateSelectorModal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'templateSelectorModal';
  modal.className = 'jp-template-library';
  modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'template-library-title');
  modal.innerHTML = `<section class="jp-template-library__paper">
    <header><div><span class="jp-eyebrow">TU PRÓXIMA AVENTURA</span><h2 id="template-library-title">Una ruta para empezar</h2><p>Elegí, explorá y hacela tuya. Cada plantilla conserva espacio para improvisar.</p></div><button type="button" class="jp-button" data-close aria-label="Cerrar plantillas">×</button></header>
    <div class="jp-template-library__intro"><img src="/images/illustrations/generated/companions/cat-guide.png" alt="" width="80" height="80"><p>Yo preparo el cuaderno; vos elegís las aventuras.<br><strong>Revisá los pendientes antes de confirmar reservas.</strong></p></div>
    <div class="jp-template-library__grid">${templateCatalog.map(renderTemplateCard).join('')}</div>
  </section>`;
  document.body.append(modal);
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  let submitting = false;
  const close = () => { if (submitting) return; modal.remove(); document.body.style.overflow = previousOverflow; };
  modal.querySelector('[data-close]').onclick = close;
  modal.addEventListener('click', event => { if (event.target === modal) close(); });
  enhanceDialog(modal, { onClose: close });
  modal.addEventListener('input', event => {
    const form = event.target.closest('form');
    if (!form) return;
    const template = getTemplate(form.dataset.templateForm);
    try { form.querySelector('.jp-template-end').textContent = `Hasta el ${dateLabel(shiftCalendarDate(event.target.value, template.duration - 1))}`; }
    catch { form.querySelector('.jp-template-end').textContent = 'Elegí una fecha válida.'; }
  });
  modal.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;
    const form = event.target;
    const errorNode = form.querySelector('[role="alert"]');
    errorNode.hidden = true;
    try {
      const prepared = instantiateTemplate(form.dataset.templateForm, { dateStart: new FormData(form).get('dateStart') });
      submitting = true; modal.setAttribute('aria-busy', 'true');
      modal.querySelectorAll('button, input').forEach(node => { node.disabled = true; });
      await onCreate(prepared);
      submitting = false; close();
    } catch (error) {
      submitting = false; modal.removeAttribute('aria-busy');
      modal.querySelectorAll('button, input').forEach(node => { node.disabled = false; });
      errorNode.textContent = error.message || 'No se pudo crear el viaje. Probá de nuevo.';
      errorNode.hidden = false;
    }
  });
  return modal;
}
