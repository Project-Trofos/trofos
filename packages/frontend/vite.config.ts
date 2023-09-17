/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { configDefaults } from 'vitest/dist/config';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
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
