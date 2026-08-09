export const MAX_SOURCE_IMAGE_BYTES = 25 * 1024 * 1024;
export const MAX_UPLOAD_IMAGE_BYTES = 5 * 1024 * 1024;

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen.')), type, quality));
}

export async function optimizeImage(file, options = {}) {
  const maxBytes = options.maxBytes || MAX_UPLOAD_IMAGE_BYTES;
  const maxDimension = options.maxDimension || 2560;
  if (!file?.type?.startsWith('image/')) throw new Error('Selecciona un archivo de imagen válido.');
  if (file.size > MAX_SOURCE_IMAGE_BYTES) throw new Error('La imagen original supera 25 MB.');
  if (file.size <= maxBytes && file.type !== 'image/bmp' && file.type !== 'image/tiff') {
    return { file, originalBytes: file.size, optimizedBytes: file.size, optimized: false };
  }
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d', { alpha: false }).drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  let quality = .88;
  let blob = await canvasToBlob(canvas, 'image/webp', quality);
  while (blob.size > maxBytes && quality > .5) {
    quality -= .08;
    blob = await canvasToBlob(canvas, 'image/webp', quality);
  }
  if (blob.size > maxBytes) throw new Error('No fue posible reducir la imagen por debajo de 5 MB.');
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const optimizedFile = new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() });
  return { file: optimizedFile, originalBytes: file.size, optimizedBytes: optimizedFile.size, optimized: true };
}

export function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
