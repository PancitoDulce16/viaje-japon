export function checklistProgress(items, completedField = 'checked') {
  const total = items.length;
  const completed = items.filter(item => Boolean(item[completedField])).length;
  return { total, completed, percent: total ? Math.round(completed / total * 100) : 0 };
}
