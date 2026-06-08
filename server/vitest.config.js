const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
    test: {
        globals: true,
        environment: 'node',
        root: '..',
        include: ['tests/**/*.test.js'],
        testTimeout: 10000,
    },
});
