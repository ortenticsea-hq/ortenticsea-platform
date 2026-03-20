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
      },
    },
    build: {
      sourcemap: false,
      // `esnext` can ship syntax that newer desktop browsers handle but some
      // mobile browsers still fail to parse, causing a blank screen on load.
      target: 'es2019',
      minify: 'esbuild',
    },
  };
});
