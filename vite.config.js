import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/properties/' : '/',
  server: {
    port: 3000
  },
  build: {
    clean: true,
    outDir: 'dist',
    emptyOutDir: true, // Make sure directory is cleaned
    minify: true,      // Ensure proper minification
    sourcemap: false,  // Disable sourcemaps in production
  }
})
