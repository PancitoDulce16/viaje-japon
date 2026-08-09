import { auth, db, storage } from '../../core/firebase-config.js';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { MAX_IMAGE_BYTES } from './budget-tracker.js';
import { formatFileSize, optimizeImage } from '../../utils/image-optimizer.js';

const safe = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));

export const BudgetGallery = {
  images: [],
  unsubscribe: null,
  get tripId() { return window.BudgetTracker?.getCurrentTripId(); },

  open() {
    if (!auth.currentUser || !this.tripId) return;
    this.close();
    const modal = document.createElement('div');
    modal.id = 'budgetGalleryModal';
    modal.className = 'budget-gallery-modal';
    modal.innerHTML = `<div class="budget-gallery" role="dialog" aria-modal="true" aria-labelledby="galleryTitle">
      <header><div><p class="budget-kicker">旅の写真 · ARCHIVO VISUAL</p><h2 id="galleryTitle">Galería y comprobantes</h2></div><button data-gallery-action="close" aria-label="Cerrar galería">×</button></header>
      <form id="budgetGalleryForm" class="gallery-upload">
        <label>Imagen*<input type="file" name="image" accept="image/*" required></label>
        <label>Asociar a gasto<select name="expenseId"><option value="">Solo al viaje</option>${(window.BudgetTracker?.expenses || []).map((item) => `<option value="${item.id}">${safe(item.description || item.desc)}</option>`).join('')}</select></label>
        <button type="submit">Subir imagen</button><p id="galleryUploadStatus" role="status"></p>
      </form>
      <div id="budgetGalleryGrid" class="budget-gallery-grid"><p class="budget-state">Cargando imágenes…</p></div>
      <div id="budgetGalleryLightbox" class="budget-lightbox" hidden></div>
    </div>`;
    document.body.appendChild(modal);
    modal.querySelector('[data-gallery-action="close"]').addEventListener('click', () => this.close());
    modal.addEventListener('click', (event) => { if (event.target === modal) this.close(); });
    modal.querySelector('#budgetGalleryForm').addEventListener('submit', (event) => this.upload(event));
    modal.querySelector('#budgetGalleryGrid').addEventListener('click', (event) => this.handleGridAction(event));
    this.unsubscribe = onSnapshot(query(collection(db, `trips/${this.tripId}/images`), orderBy('createdAt', 'desc')), (snapshot) => {
      this.images = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      this.render();
    }, (error) => {
      modal.querySelector('#budgetGalleryGrid').innerHTML = `<p class="budget-state budget-state--error" role="alert">${safe(error.message)}</p>`;
    });
  },

  render() {
    const grid = document.getElementById('budgetGalleryGrid');
    if (!grid) return;
    if (!this.images.length) {
      grid.innerHTML = '<p class="budget-state">Aún no hay imágenes. Sube el primer recuerdo o comprobante.</p>';
      return;
    }
    grid.innerHTML = this.images.map((image) => `<figure class="budget-gallery-card">
      <button class="budget-gallery-card__preview" data-gallery-action="view" data-id="${image.id}"><img src="${safe(image.url)}" alt="${safe(image.name || 'Imagen del viaje')}" loading="lazy"></button>
      <figcaption><strong>${safe(image.name)}</strong><small>${image.expenseId ? 'Asociada a un gasto' : 'Asociada al viaje'} · ${(image.size / 1024).toFixed(0)} KB</small><button data-gallery-action="delete" data-id="${image.id}">Eliminar</button></figcaption>
    </figure>`).join('');
  },

  async upload(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    let file = data.get('image');
    const status = document.getElementById('galleryUploadStatus');
    if (!file?.type?.startsWith('image/')) { status.textContent = 'Selecciona una imagen válida.'; return; }
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    const name = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `trips/${this.tripId}/images/${auth.currentUser.uid}/${Date.now()}_${name}`;
    try {
      status.textContent = file.size > MAX_IMAGE_BYTES ? 'Optimizando imagen grande…' : 'Preparando imagen…';
      const optimized = await optimizeImage(file, { maxBytes: MAX_IMAGE_BYTES });
      file = optimized.file;
      if (optimized.optimized) status.textContent = `Optimizada: ${formatFileSize(optimized.originalBytes)} → ${formatFileSize(optimized.optimizedBytes)}`;
      const task = uploadBytesResumable(ref(storage, storagePath), file, { contentType: file.type });
      await new Promise((resolve, reject) => task.on('state_changed', (snapshot) => {
        status.textContent = `Subiendo: ${Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100)}%`;
      }, reject, resolve));
      const url = await getDownloadURL(task.snapshot.ref);
      await addDoc(collection(db, `trips/${this.tripId}/images`), {
        storagePath, url, name: file.name, type: file.type, size: file.size,
        originalSize: optimized.originalBytes, optimized: optimized.optimized,
        expenseId: String(data.get('expenseId') || '') || null, tripId: this.tripId,
        userId: auth.currentUser.uid, createdAt: serverTimestamp()
      });
      form.reset(); status.textContent = 'Imagen subida correctamente.';
    } catch (error) { status.textContent = `Error: ${error.message}`; }
    finally { submit.disabled = false; }
  },

  handleGridAction(event) {
    const button = event.target.closest('[data-gallery-action]');
    if (!button) return;
    const image = this.images.find((item) => item.id === button.dataset.id);
    if (button.dataset.galleryAction === 'view' && image) {
      const lightbox = document.getElementById('budgetGalleryLightbox');
      lightbox.hidden = false;
      lightbox.innerHTML = `<button aria-label="Cerrar vista ampliada">×</button><img src="${safe(image.url)}" alt="${safe(image.name)}"><p>${safe(image.name)}</p>`;
      lightbox.querySelector('button').addEventListener('click', () => { lightbox.hidden = true; });
    }
    if (button.dataset.galleryAction === 'delete' && image) this.remove(image);
  },

  async remove(image) {
    if (!confirm(`¿Eliminar “${image.name}” de la galería y Storage?`)) return;
    try {
      await deleteObject(ref(storage, image.storagePath));
      await deleteDoc(doc(db, `trips/${this.tripId}/images/${image.id}`));
    } catch (error) { window.BudgetTracker?.notify('error', `No se pudo eliminar la imagen: ${error.message}`); }
  },

  close() {
    this.unsubscribe?.(); this.unsubscribe = null;
    document.getElementById('budgetGalleryModal')?.remove();
  }
};

window.BudgetGallery = BudgetGallery;
