import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.{js,ts}'],
        setupFiles: ['src/__tests__/setup.js'],
        testTimeout: 15000,
    },
});
