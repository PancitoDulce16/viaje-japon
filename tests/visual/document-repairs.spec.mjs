import { test, expect } from '@playwright/test';
import fs from 'node:fs';

// Isolated document UI: no real Firebase account, network reads or writes.
for (const width of [1440, 1024, 768, 390]) for (const theme of ['light', 'dark']) {
  test(`document upload close and retry ${theme} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/js/core/firebase-config.js*', route => route.fulfill({
      contentType: 'application/javascript',
      body: `export const db={},storage={},auth={currentUser:{uid:'preview-user'}},app={},googleProvider={};`
    }));
    await page.goto('/design-system', { waitUntil: 'domcontentloaded' });
    await page.addStyleTag({ url: '/css/app.css' });
    await page.evaluate(async theme => {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.dataset.theme = theme;
      document.body.innerHTML = '<button id="documentTrigger">Abrir documentos</button>';
      window.TripsManager = { currentTrip: { id: 'A', info: { createdBy: 'preview-user' } } };
      const { TripDocuments } = await import('/js/features/documents/trip-documents.js');
      const { tripDocumentService } = await import('/js/features/documents/document-service.js');
      TripDocuments.load = async function() { this.documents = []; this.render(); };
      tripDocumentService.upload = options => {
        window.documentUploadContext = { tripId: options.tripId, reservationId: options.reservationId };
        let reject;
        const promise = new Promise((_, no) => { reject = no; window.rejectDocumentUpload = no; });
        return { promise, cancel: () => { window.documentCancelled = true; reject({ code: 'storage/canceled' }); } };
      };
      document.querySelector('#documentTrigger').onclick = () => TripDocuments.open({ reservationId: 'r1' });
    }, theme);
    await page.locator('#documentTrigger').click();
    const dialog = page.getByRole('dialog', { name: 'Documentos del viaje' });
    const contrast = await dialog.evaluate(node => {
      const luminance = color => {
        const values = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => {
          const channel = value / 255;
          return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
        });
        return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
      };
      const text = luminance(getComputedStyle(node.querySelector('label')).color);
      const background = luminance(getComputedStyle(node).backgroundColor);
      return (Math.max(text, background) + .05) / (Math.min(text, background) + .05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
    const checkbox = await dialog.locator('[name="sensitive"]').boundingBox();
    expect(checkbox.width).toBeLessThanOrEqual(24);
    expect(checkbox.height).toBeLessThanOrEqual(24);
    const upload = dialog.getByRole('button', { name: 'Confirmar y subir' });
    await dialog.locator('[name="file"]').setInputFiles({ name: 'ticket.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\n') });
    await upload.click();
    await expect(dialog.getByRole('button', { name: 'Subiendo' })).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Cancelar subida' })).toBeFocused();
    expect(await page.evaluate(() => window.documentUploadContext)).toEqual({ tripId: 'A', reservationId: 'r1' });
    expect(await dialog.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(2);
    fs.mkdirSync(`artifacts/document-repairs/${theme}`, { recursive: true });
    await page.screenshot({ path: `artifacts/document-repairs/${theme}/${width}.png`, animations: 'disabled' });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    expect(await page.evaluate(() => window.documentCancelled)).toBe(true);
    await expect(page.locator('#documentTrigger')).toBeFocused();

    // A rejected transfer leaves the selected file available for retry.
    await page.locator('#documentTrigger').click();
    await dialog.locator('[name="file"]').setInputFiles({ name: 'ticket.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\n') });
    await upload.click();
    await page.evaluate(() => window.rejectDocumentUpload(new Error('Conexión interrumpida')));
    await expect(dialog.getByRole('button', { name: 'Reintentar' })).toBeEnabled();
    await expect(dialog.locator('[data-status]')).toContainText('Conexión interrumpida');
    expect(await dialog.locator('[name="file"]').evaluate(input => input.files[0]?.name)).toBe('ticket.pdf');
  });
}
