import { defineConfig } from 'vite';

export default defineConfig({
  // Base path — sesuaikan dengan nama repo GitHub untuk GitHub Pages
  // Contoh: '/mapbencana/' jika repo namanya mapbencana
  base: './',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
});
