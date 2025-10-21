import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // La raíz del proyecto donde está index.html
  root: resolve(__dirname, ''),
  resolve: {
    alias: {
      // Permite usar rutas absolutas como /js/module.js en los imports
      '/js': resolve(__dirname, 'js')
    }
  },
  build: {
    // La carpeta donde se generará la versión final
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true, // Limpia la carpeta dist antes de cada build
    rollupOptions: { input: resolve(__dirname, 'index.html') }
  }
});