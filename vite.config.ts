import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      sourcemap: false,       // ✅ Disable eval-style source maps to fix CSP white screen
      target: 'esnext',       // Optional: ensures modern browsers, avoids extra transpiling
      minify: 'esbuild',      // Use esbuild for faster, safer minification
    }
  };
});
