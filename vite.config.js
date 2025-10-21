// vite.config.js - Configuración optimizada para la aplicación
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    host: true,
    // Configurar redirecciones para SPA
    historyApiFallback: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: './index.html',
        login: './login.html',
        dashboard: './dashboard.html'
      }
    }
  },
  // Optimizaciones de rendimiento
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage'
    ]
  },
  // Configuración de CSS
  css: {
    postcss: './postcss.config.js'
  }
});