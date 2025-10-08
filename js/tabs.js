// js/tabs.js
import { AppCore } from './core.js';
import { AppModals } from './modals.js';
import { AppUtils } from './utils.js';
import { GalleryHandler } from './gallery.js';

export const TabsHandler = {
  renderAllTabs() {
    this.renderFlightsTab();
    this.renderFoodTab();
    this.renderSouvenirsTab();
    this.renderUtilsTab();
    GalleryHandler.renderGallery();
    AppCore.renderModals();
  },

  // ... resto de las funciones (renderFlightsTab, renderFoodTab, etc.) ...
};
