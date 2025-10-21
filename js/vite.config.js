import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // Opcional: para que el service worker funcione correctamente con rutas base
    // Si tu app está en la raíz del dominio, puedes quitar esta línea.
    // Si está en un subdirectorio como /viaje-japon/, ajústalo.
    base: '/', 
  }
});