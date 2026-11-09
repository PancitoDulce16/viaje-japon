import { test, expect } from './fixtures.mjs';
import fs from 'node:fs';
import path from 'node:path';

test('A4 layout preserves long notes, Japanese text, and safe page bounds in both themes', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/dashboard.html', { waitUntil:'domcontentloaded' });
  for (const theme of ['light','dark']) {
    await page.setViewportSize({width:theme === 'dark' ? 390 : 1440,height:1000});
    const result = await page.evaluate(async theme => {
      document.documentElement.classList.toggle('dark',theme === 'dark');
      const { createPrintFrame, buildItineraryPages } = await import('/js/features/trips/itinerary-pdf-layout.js');
      const frame = await createPrintFrame();
      const long = 'Nota completa: 東京 京都 日本, dirección y reserva pendientes. '.repeat(90) + 'FIN-NOTA';
      const data = { days:[{ day:8,date:'2027-02-22',city:'Kyoto',title:'Un día en Uji',activities:[{time:'10:00',title:'Nintendo Museum',category:'culture',location:'京都府宇治市神楽田56',notes:long,reservationRequired:true}] },{day:9,date:'2027-02-23',city:'Kyoto',activities:[]}] };
      const pages = await buildItineraryPages(frame.contentDocument,data);
      const bounds = pages.map(node => {
        const p = node.getBoundingClientRect();
        const c = node.querySelector('.pdf-content').getBoundingClientRect();
        return { bottom:c.bottom-p.top, width:node.scrollWidth, height:node.scrollHeight, paper:getComputedStyle(node).backgroundColor };
      });
      const body = frame.contentDocument.body.textContent;
      const color = getComputedStyle(pages[0]).color;
      frame.remove();
      return {bounds,hasEnd:body.includes('FIN-NOTA'),hasJapanese:body.includes('京都府宇治市神楽田56'),color};
    },theme);
    expect(result.hasEnd).toBe(true);
    expect(result.hasJapanese).toBe(true);
    expect(result.bounds.length).toBeGreaterThan(2);
    for (const b of result.bounds) { expect(b.bottom).toBeLessThanOrEqual(1051); expect(b.width).toBe(794); expect(b.height).toBe(1123); expect(b.paper).toBe('rgb(255, 253, 249)'); }
    expect(result.color).toBe('rgb(19, 38, 80)');
  }
});

test('personal template produces an actual PDF and printable page previews', async ({ page }) => {
  test.setTimeout(180000);
  await page.setViewportSize({width:1000,height:1200});
  const output = path.resolve('artifacts/itinerary-pdf'); fs.mkdirSync(output,{recursive:true});
  await page.goto('/dashboard.html',{waitUntil:'domcontentloaded'});
  await page.evaluate(async () => {
    const { instantiateTemplate } = await import('/js/features/itinerary/template-library.js');
    const { createPrintFrame, buildItineraryPages } = await import('/js/features/trips/itinerary-pdf-layout.js');
    const data = instantiateTemplate('japan-february-2027');
    window.pdfPreviewTrip = { info:data.tripData, itinerary:data.itineraryData };
    const frame = await createPrintFrame();
    frame.id='pdf-preview'; frame.style.cssText='position:absolute;left:0;top:0;width:794px;height:1123px;z-index:99999;background:white;';
    await buildItineraryPages(frame.contentDocument,data.itineraryData,window.pdfPreviewTrip);
  });
  const frame = page.frameLocator('#pdf-preview');
  await frame.locator('.pdf-page').first().screenshot({path:path.join(output,'dia-01.png')});
  const uji = frame.locator('.pdf-page').filter({hasText:'Día 8'}).first();
  await uji.screenshot({path:path.join(output,'dia-08-uji.png')});
  await page.evaluate(() => document.querySelector('#pdf-preview').remove());
  const result = await page.evaluate(async () => {
    const { PDFExporter } = await import('/js/features/trips/pdf-exporter.js');
    const doc = await PDFExporter.exportToPDF(window.pdfPreviewTrip,{save:false});
    if (!doc) throw new Error('PDF generation failed');
    return { bytes:Array.from(new Uint8Array(doc.output('arraybuffer'))), pages:doc.getNumberOfPages(), busy:PDFExporter.busy, frames:document.querySelectorAll('iframe[title="Preparando tu itinerario PDF"]').length };
  });
  expect(result.pages).toBeGreaterThanOrEqual(20);
  expect(result.frames).toBe(0); expect(result.busy).toBe(false);
  const bytes = Buffer.from(result.bytes);
  expect(bytes.subarray(0,5).toString()).toBe('%PDF-');
  fs.writeFileSync(path.join(output,'Japitin-Febrero-2027.pdf'),bytes);
});
