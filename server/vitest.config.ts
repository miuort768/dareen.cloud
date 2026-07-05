import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.{js,ts}'],
        setupFiles: ['src/__tests__/setup.js'],
        testTimeout: 60000,
        hookTimeout: 60000,
        pool: 'forks',
        fileParallelism: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['services/**/*.js', 'constants/**/*.js'],
        },
    },
});
