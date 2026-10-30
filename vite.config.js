import { defineConfig } from 'vite';
// three.js is imported dynamically from hero3d.js, so Vite already ships it as its own lazy chunk.
export default defineConfig({ build: { target: 'es2020', chunkSizeWarningLimit: 700 } });
