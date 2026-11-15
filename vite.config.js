import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// three.js and the 3D experience are loaded with a dynamic import
// (see src/story/Story.jsx), so they land in their own lazy chunk.
export default defineConfig({
  plugins: [react()],
  server: { port: 5183 },
  build: { target: 'es2022', chunkSizeWarningLimit: 800 },
});
