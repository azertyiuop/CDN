import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

host:true

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    sourcemap: false, // Désactive les source maps en production pour minimiser les informations visibles
  },
});
