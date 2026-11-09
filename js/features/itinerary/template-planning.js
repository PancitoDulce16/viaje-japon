const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sourceLink = item => {
  try {
    const url = new URL(item.url);
    if (url.protocol !== 'https:') return safe(item.title);
    return `<a href="${safe(url.href)}" target="_blank" rel="noopener noreferrer">${safe(item.title)}</a>`;
  } catch { return safe(item.title); }
};
export function renderTemplatePlanning(planning) {
  if (!planning) return '';
  return `<details class="jp-template-planning"><summary>Tu plantilla · reservas, ideas y pendientes</summary>
    ${planning.datesChanged ? '<p class="jp-template-planning__warning">Cambiaste las fechas: revisá cierres semanales, festivos y plazos de reserva. Las fechas límite originales no se trasladan automáticamente.</p>' : ''}
    <p>Horarios orientativos. Los hoteles y entradas de la plantilla quedan por confirmar.</p>
    <h3>Reservas y preparativos</h3><ul>${(planning.bookingChecklist || []).map(item => `<li><strong>${sourceLink(item)}</strong>${item.dueDate ? ` · ${safe(item.dueDate)} · ${safe(item.deadlineLocalTime || '')} (${safe(item.timeZone || '')})` : ''}<p>${safe(item.notes)}</p></li>`).join('')}</ul>
    ${(planning.pendingDecisions || []).length ? `<h3>Por confirmar con vos</h3><ul>${planning.pendingDecisions.map(item => `<li><strong>${safe(item.original)}</strong>: ${safe(item.notes)}</li>`).join('')}</ul>` : ''}
    <h3>Ideas para disfrutar la ruta</h3><ul>${(planning.notes || []).map(note => `<li>${safe(note)}</li>`).join('')}</ul>
    <h3>Fuentes para volver a comprobar</h3><ul>${(planning.sources || []).map(item => `<li>${sourceLink(item)}${item.checkedAt ? ` · consultado ${safe(item.checkedAt)}` : ''}</li>`).join('')}</ul>
  </details>`;
}
