import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/highlevel': {
        target: 'https://services.leadconnectorhq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/highlevel/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Preserve original headers
            Object.keys(req.headers).forEach(key => {
              proxyReq.setHeader(key, req.headers[key]);
            });
          });
        }
      }
    }
  },
  build: {
    clean: true,
    outDir: 'dist',
    emptyOutDir: true, // Make sure directory is cleaned
    minify: true,      // Ensure proper minification
    sourcemap: false,  // Disable sourcemaps in production
  }
})
