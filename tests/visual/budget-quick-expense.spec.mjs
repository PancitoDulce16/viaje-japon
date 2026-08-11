import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const widths = [1440, 1024, 768, 390];
const themes = ['light', 'dark'];
const expenses = [
  { id: 'e1', description: 'Ichiran Ramen', amountMinor: 2000, originalCurrency: 'JPY', convertedAmountMinor: 7380, baseCurrency: 'CRC', category: 'Alimentación', vendor: 'Ichiran', date: '2026-08-17', paidBy: 'preview-user' },
  { id: 'e2', description: 'Suica', amountMinor: 1500, originalCurrency: 'JPY', convertedAmountMinor: 5535, baseCurrency: 'CRC', category: 'Transporte', vendor: 'JR East', date: '2026-08-16', paidBy: 'friend' },
  { id: 'cash1', description: 'Retiro en 7-Eleven', amountMinor: 20000, originalCurrency: 'JPY', convertedAmountMinor: 73800, baseCurrency: 'CRC', category: 'Efectivo / Cajero', movementType: 'cash-withdrawal', date: '2026-08-15', paidBy: 'preview-user' }
];

async function mountBudget(page, theme, editingId = 'new') {
  await page.addInitScript(({ selectedTheme }) => {
    sessionStorage.setItem('authenticated', 'true');
    localStorage.setItem('theme-preference', selectedTheme);
  }, { selectedTheme: theme });
  await page.goto('/dashboard.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async ({ selectedTheme, expenseFixture, selectedEditingId }) => {
    document.querySelector('#appDashboard')?.classList.remove('hidden');
    document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
    document.documentElement.dataset.theme = selectedTheme;
    document.querySelector('#currentTripHeader')?.classList.add('hidden');
    document.querySelectorAll('.tab-content').forEach(node => node.classList.add('hidden'));
    document.querySelector('#content-budget')?.classList.remove('hidden');
    window.ItineraryHandler = { currentItinerary: { days: [{ day: 1, date: '2026-08-21', activities: [{ id: 'a1', title: 'Kiyomizu-dera', category: 'Cultura', cost: 400, currency: 'JPY' }] }] } };
    window.ReservationsManager = { reservations: [{ id: 'r1', title: 'Ryokan Sakura', costMinor: 36900, currency: 'CRC' }] };
    const { BudgetTracker } = await import('/js/features/budget/budget-tracker.js');
    BudgetTracker.preview(expenseFixture, {
      trip: { id: 'budget-preview' },
      members: [{ userId: 'preview-user', name: 'Noelia' }, { userId: 'friend', name: 'David' }],
      baseCurrency: 'CRC',
      budget: { amountMinor: 250000, currency: 'CRC', minorUnit: 1 },
      editingId: selectedEditingId
    });
  }, { selectedTheme: theme, expenseFixture: expenses, selectedEditingId: editingId });
  await page.addStyleTag({ content: '#appDashboard.hidden{display:block!important} body > .fixed:not(#mobile-bottom-nav){display:none!important}' });
}

for (const width of widths) for (const theme of themes) {
  test(`quick expense ${theme} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await mountBudget(page, theme);
    await expect(page.locator('.budget-module')).toBeVisible();
    await expect(page.locator('.expense-form__grid--quick > label')).toHaveCount(5);
    await expect(page.locator('.expense-form__advanced')).not.toHaveAttribute('open', '');
    await expect(page.locator('.budget-cash-summary')).toContainText('No se cuenta como gasto');
    await expect(page.locator('.expense-row--withdrawal')).toContainText('No suma al gasto');
    await expect(page.locator('[data-action="duplicate"]')).toHaveCount(3);
    await page.locator('[data-prefill-target="description"]').first().click();
    await expect(page.locator('#expenseForm [name="description"]')).toHaveValue('Ichiran Ramen');
    const advanced = page.locator('.expense-form__advanced');
    await advanced.locator('summary').click();
    await expect(advanced.locator('[name="movementType"]')).toBeVisible();
    await expect(advanced.locator('[name="activityId"] option')).toHaveCount(2);
    await expect(advanced.locator('[name="reservationId"] option')).toHaveCount(2);
    await advanced.locator('summary').click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    const target = path.resolve('artifacts/budget-quick-expense', theme, `${width}.png`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    await page.screenshot({ path: target, fullPage: true, animations: 'disabled' });
  });
}

test('expense draft restores only safe form values', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('japitin:draft:expense:guest:budget-preview', JSON.stringify({
      savedAt: Date.now(),
      data: { description: 'Matcha pendiente', amount: '850', currency: 'JPY', category: 'Alimentación', paidBy: 'preview-user', date: '2026-08-21', notes: 'Sin archivo sensible' }
    }));
  });
  await mountBudget(page, 'light');
  await expect(page.locator('.expense-draft-banner')).toBeVisible();
  await page.locator('[data-action="restore-expense-draft"]').click();
  await expect(page.locator('#expenseForm [name="description"]')).toHaveValue('Matcha pendiente');
  await expect(page.locator('#expenseForm [name="amount"]')).toHaveValue('850');
  await expect(page.locator('#expenseForm [name="notes"]')).toHaveValue('Sin archivo sensible');
});
