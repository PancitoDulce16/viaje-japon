import { localDate } from './dashboard-summary.js';

const safe = (value = '') => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

export function taskDueLabel(value, now = new Date()) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? localDate(value) : null;
  if (!date || date.getFullYear() !== Number(value.slice(0, 4)) || date.getMonth() + 1 !== Number(value.slice(5, 7)) || date.getDate() !== Number(value.slice(8, 10))) return { text: 'Sin fecha', state: 'undated' };
  const today = localDate(now);
  const state = date < today ? 'overdue' : date.getTime() === today.getTime() ? 'today' : 'upcoming';
  const label = new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short' }).format(date);
  return { state, text: state === 'today' ? 'Hoy' : `${state === 'overdue' ? 'Vencida' : 'Próxima'} · ${label}` };
}

export function renderDashboardTasks(tasks = [], tripId = '', now = new Date()) {
  const pending = tasks.filter(task => !task.completed).sort((a, b) => String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999'))).slice(0, 4);
  return pending.map(task => {
    const due = taskDueLabel(task.dueDate, now);
    return `<li class="dashboard-task" data-due-state="${due.state}">
      <label><input type="checkbox" data-task-id="${safe(task.id || '')}" data-trip-id="${safe(tripId)}" ${!task.id || !tripId ? 'disabled' : ''} onchange="window.JapitinDashboardTasks.toggle(this)"><span>${safe(task.title)}</span></label>
      <time ${due.state !== 'undated' ? `datetime="${safe(task.dueDate)}"` : ''}>${safe(due.text)}</time>
      <span class="dashboard-task__status" role="status" hidden></span>
    </li>`;
  }).join('');
}

export async function toggleDashboardTask(input) {
  if (input.disabled) return;
  const completed = input.checked;
  const row = input.closest('.dashboard-task');
  const status = row?.querySelector('.dashboard-task__status');
  const report = text => { if (status) { status.hidden = false; status.textContent = text; } };
  input.disabled = true;
  report('Guardando…');
  try {
    if (!window.TravelTasks?.setCompleted) throw new Error('Tasks unavailable');
    await window.TravelTasks.setCompleted(input.dataset.taskId, completed, input.dataset.tripId);
    row?.classList.toggle('is-complete', completed);
    report(completed ? 'Tarea completada.' : 'Tarea pendiente.');
  } catch {
    input.checked = !completed;
    report('No se pudo guardar. Revisa tu conexión e intenta de nuevo.');
    input.disabled = false;
    return;
  }
  input.disabled = false;
  // Refresh failures must not undo a write that the server already confirmed.
  try { await window.TripsManager?.loadDashboardProgressiveContent?.(); }
  catch { report('Tarea guardada. Actualiza el inicio para ver el resumen.'); }
}

if (typeof window !== 'undefined') window.JapitinDashboardTasks = { toggle: toggleDashboardTask };
