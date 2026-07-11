// js/utils/image-export.js - Exportación compartida de elementos del DOM como imagen
// Usado por TripCardsGenerator y TripStoryGenerator (antes cada uno reimplementaba
// su propia copia de este pipeline).

/**
 * Convierte un nombre en un slug seguro para nombres de archivo.
 */
export function slugifyFilename(name, fallback = 'japitin-trip') {
  return (name || fallback).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Captura un elemento del DOM como PNG (via html2canvas) y dispara su descarga.
 * Los elementos con [data-export-ignore] (ej. botones de acción dentro de la
 * tarjeta capturada) se excluyen de la imagen resultante.
 * @returns {Promise<boolean>} true si se descargó, false si no se pudo generar el blob
 */
export async function downloadElementAsImage(element, filename) {
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
    ignoreElements: (el) => el.hasAttribute('data-export-ignore')
  });
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return false;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}
