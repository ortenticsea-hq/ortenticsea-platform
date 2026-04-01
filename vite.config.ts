import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: react(),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    sourcemap: false,
    // `esnext` can ship syntax that newer desktop browsers handle but some
    // mobile browsers still fail to parse, causing a blank screen on load.
    target: 'es2019',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/firebase/app') || id.includes('/@firebase/app')) return 'firebase-core';
          if (id.includes('/firebase/auth') || id.includes('/@firebase/auth')) return 'firebase-auth';
          if (id.includes('/firebase/firestore') || id.includes('/@firebase/firestore')) return 'firebase-firestore';
          if (id.includes('/firebase/storage') || id.includes('/@firebase/storage')) return 'firebase-storage';
          if (id.includes('/firebase/functions') || id.includes('/@firebase/functions')) return 'firebase-functions';
          if (id.includes('/firebase')) return 'firebase-core';
          if (id.includes('react')) return 'react-vendor';
          if (id.includes('@heroicons')) return 'ui-vendor';
          return 'vendor';
        },
      },
    },
  },
});
