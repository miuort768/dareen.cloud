import { defineConfig } from 'vitest/config';
import testDb from './src/__tests__/testDbConfig.js';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.{js,ts}'],
        setupFiles: ['src/__tests__/setup.js'],
        globalSetup: ['src/__tests__/global-setup.js'],
        env: {
            DATABASE_URL: testDb.TEST_URL,
        },
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
