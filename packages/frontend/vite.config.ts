/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { configDefaults } from 'vitest/dist/config';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/socket.io': {
        target: 'ws://localhost:3001',
        ws: true,
        rewrite(path) {
          return path.replace('/api', '');
        },
      },
      '/api': {
        target: 'http://localhost:3001',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/setupTests.ts'],
    },
    exclude: configDefaults.exclude,
    alias: [{ find: /^@antv\/g-base\/lib$/, replacement: '@antv/g-base/esm' }],
    server: {
      deps: {
        inline: ['clsx'],
      },
    },
  },
  resolve: {
    mainFields: ['module', 'main'],
  },
});
