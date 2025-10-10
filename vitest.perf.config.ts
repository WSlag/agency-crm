import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/tests/performance/**/*.{test,spec}.{ts,tsx}'],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
