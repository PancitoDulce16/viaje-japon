// vite.config.js - Configuración optimizada para la aplicación
import { defineConfig } from 'vite';

const localRoutes = () => ({
  name: 'japitin-local-routes',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const requestUrl = req.url || '';
      const path = requestUrl.split('?')[0].replace(/\/$/, '') || '/';
      const query = requestUrl.includes('?') ? `?${requestUrl.split('?').slice(1).join('?')}` : '';
      if (path === '/dashboard') {
        res.statusCode = 302;
        res.setHeader('Location', '/dashboard.html');
        res.end();
        return;
      }
      if (path === '/login') {
        res.statusCode = 302;
        res.setHeader('Location', '/login.html');
        res.end();
        return;
      }
      if (path === '/design-system') {
        res.statusCode = 302;
        res.setHeader('Location', `/design-system.html${query}`);
        res.end();
        return;
      }
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const requestUrl = req.url || '';
      const path = requestUrl.split('?')[0].replace(/\/$/, '') || '/';
      const query = requestUrl.includes('?') ? `?${requestUrl.split('?').slice(1).join('?')}` : '';
      const target = path === '/dashboard' ? '/dashboard.html' : path === '/login' ? '/login.html' : path === '/design-system' ? `/design-system.html${query}` : null;
      if (!target) return next();
      res.statusCode = 302;
      res.setHeader('Location', target);
      res.end();
    });
  }
});

export default defineConfig({
  plugins: [localRoutes()],
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    open: '/dashboard.html'
  },
  preview: {
    port: 3000,
    host: true,
    strictPort: true,
    open: '/dashboard.html'
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
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase')) return 'firebase';
          if (id.includes('node_modules/html2canvas')) return 'capture';
          if (id.includes('/js/ml/') || id.includes('/js/ai/')) return 'intelligence';
          if (id.includes('/js/features/journal/')) return 'journal';
          if (id.includes('/js/features/social/')) return 'social';
        }
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
