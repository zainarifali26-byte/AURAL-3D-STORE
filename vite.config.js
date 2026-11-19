import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `npm run dev` / `npm run preview` stay on this computer only. The `:phone`
// scripts add --host so a phone on the same Wi-Fi can open the site.
export default defineConfig({
  plugins: [react()],
  server: { port: 5183 },
  preview: { port: 4183 },
  build: { target: 'es2022', chunkSizeWarningLimit: 800 },
});
