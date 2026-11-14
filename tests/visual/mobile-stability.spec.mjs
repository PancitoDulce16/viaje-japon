import { test, expect } from './fixtures.mjs';
import fs from 'node:fs';

test.use({ hasTouch: true, reducedMotion: 'no-preference' });

for (const width of [320, 390, 768, 1440]) for (const theme of ['light', 'dark']) {
  test(`reported mobile failures ${theme} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() => localStorage.setItem('japitin_a11y_settings', '{broken'));
    const chatSource = fs.readFileSync('js/features/social/group-chat.js', 'utf8').replace(/^import[\s\S]*?;\r?\n/gm, '');
    await page.route('**/js/features/social/group-chat.js*', route => route.fulfill({ contentType: 'application/javascript', body: `
      const auth={currentUser:{uid:'test',displayName:'Ana',email:null}},db={};
      const collection=(_,path)=>path,serverTimestamp=()=>1;
      async function addDoc(path,data){window.sentSticker={path,data};return {id:'sticker'};}
      ${chatSource}
    ` }));
    await page.goto('/dashboard.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(async theme => {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.dataset.theme = theme;
      document.querySelector('#appDashboard').classList.remove('hidden');
      window.TripsManager.currentTrip={id:'test-trip',info:{name:'Viaje de prueba'}};
      const { AttractionsHandler } = await import('/js/api/attractions.js');
      AttractionsHandler.renderAttractions();
      document.querySelectorAll('.tab-content').forEach(node=>node.classList.add('hidden'));
      document.querySelector('#content-attractions').classList.remove('hidden');
    }, theme);
    const filters = page.locator('.jp-attractions-filters');
    await expect(filters).toBeVisible();
    if (width <= 768) {
      expect(await filters.evaluate(node => getComputedStyle(node).flexWrap)).toBe('nowrap');
      expect(await page.locator('.jp-attractions-advanced').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(2);
      const nav = page.locator('#mobile-bottom-nav');
      await expect(nav).toBeVisible();
      const boxes = await nav.locator('.mobile-nav-item').evaluateAll(nodes => nodes.map(node => { const r=node.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,height:r.height}; }));
      expect(boxes).toHaveLength(5);
      for (const box of boxes) { expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44); expect(box.right).toBeLessThanOrEqual(width); }
      for(let i=1;i<boxes.length;i++) expect(boxes[i].left).toBeGreaterThanOrEqual(boxes[i-1].right-1);
    }
    await page.screenshot({ path: `artifacts/mobile-stability/${theme}-${width}-explore.png` });

    await page.evaluate(async () => {
      const { BudgetCalculator }=await import('/js/features/budget/budget-calculator.js');
      document.querySelector('#content-attractions').innerHTML=`<div class="jp-prep-page"><div class="jp-prep-guides">${BudgetCalculator.renderBudgetItem('Hoteles',50,100)}</div></div>`;
    });
    const track=page.locator('.jp-budget-progress');
    const fill=track.locator('> div');
    const trackBox=await track.boundingBox(),fillBox=await fill.boundingBox();
    expect(fillBox.height).toBeLessThanOrEqual(trackBox.height+1);
    expect(fillBox.width/trackBox.width).toBeCloseTo(.5,1);

    await page.evaluate(async () => {
      const { EmergencyAssistant }=await import('/js/features/planning/emergency-assistant.js');
      EmergencyAssistant.init();
      document.querySelector('#emergencyModal').classList.add('active');
    });
    const emergency=page.locator('#emergencyModal');
    await expect(emergency).toBeVisible();
    const scroll=page.locator('#emergencyContent');
    expect(await scroll.evaluate(node=>node.scrollHeight>node.clientHeight)).toBe(true);
    if (width <= 768) {
      const box = await scroll.boundingBox();
      const cdp = await page.context().newCDPSession(page);
      const x = box.x + box.width / 2, y = box.y + Math.min(box.height - 20, 300);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let step = 1; step <= 5; step++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - step * 25 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await expect.poll(() => scroll.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
      await cdp.detach();
    }
    // Exercise the production document touch handlers; a down swipe must not dismiss SOS.
    await scroll.evaluate(node=>{
      for(const [type,y] of [['touchstart',100],['touchmove',180],['touchend',220]]) {
        const event=new Event(type,{bubbles:true,cancelable:true});
        Object.defineProperty(event,'changedTouches',{value:[{screenX:100,screenY:y}]});
        node.dispatchEvent(event);
        if(type==='touchmove') window.sosScrollPrevented=event.defaultPrevented;
      }
      node.scrollTop=200;
    });
    expect(await page.evaluate(()=>window.sosScrollPrevented)).toBe(false);
    await expect(emergency).toHaveClass(/active/);
    expect(await scroll.evaluate(node=>node.scrollTop)).toBeGreaterThan(0);
    await page.screenshot({ path: `artifacts/mobile-stability/${theme}-${width}-sos.png` });
    await emergency.getByRole('button',{name:'Cerrar',exact:true}).click();

    await page.evaluate(async()=>{
      await import('/js/utils/accessibility-manager.js');
      window.AccessibilityManager.showPanel();
    });
    await page.setViewportSize({width,height:360});
    const panel=page.locator('#a11yPanel');
    const panelBox=await panel.boundingBox();
    expect(panelBox.y).toBeGreaterThanOrEqual(0);
    expect(panelBox.y+panelBox.height).toBeLessThanOrEqual(360);
    expect(await panel.evaluate(node=>node.scrollHeight>node.clientHeight)).toBe(true);
    await panel.locator('[data-setting="focusIndicators"]').scrollIntoViewIfNeeded();
    await panel.locator('[data-setting="focusIndicators"]').click();
    await expect(panel.locator('[data-setting="focusIndicators"]')).toHaveAttribute('aria-checked','false');
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    await page.setViewportSize({width,height:844});

    await page.evaluate(()=>{
      document.querySelector('#content-attractions').innerHTML='<div class="hero-moment__petal" style="animation-duration:12s"></div>';
    });
    expect(await page.locator('.hero-moment__petal').evaluate(node=>parseFloat(getComputedStyle(node).animationDuration))).toBe(12);
    if(theme==='dark') expect(await page.locator('.hero-moment__petal').evaluate(node=>parseFloat(getComputedStyle(node,'::after').animationDuration))).toBe(2.6);

    await page.evaluate(async()=>{
      const { ModalRenderer }=await import('/js/ui/modals.js');
      document.querySelector('#modal-chat')?.remove();
      document.querySelector('#modalsContainer').insertAdjacentHTML('beforeend', ModalRenderer.getChatModal());
      document.querySelector('#modal-chat').classList.add('active');
      window.GroupChat.renderChatUI();
    });
    const sticker=page.getByRole('button',{name:'Abrir stickers',exact:true});
    await expect(sticker).toBeVisible();
    if(width<=480) expect((await page.locator('#chatInput').boundingBox()).width).toBeGreaterThanOrEqual(160);
    await sticker.click();
    await expect(page.locator('#chatStickerPicker')).toBeVisible();
    await page.getByRole('button',{name:'Enviar sticker Amor',exact:true}).click();
    expect(await page.evaluate(()=>window.sentSticker.data.stickerIndex)).toBe(0);
    expect(await page.evaluate(()=>window.sentSticker.path)).toBe('trips/test-trip/chat');
    await expect(sticker).toHaveAttribute('aria-expanded','false');
    await page.screenshot({ path: `artifacts/mobile-stability/${theme}-${width}-chat.png` });
  });
}
