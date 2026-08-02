const path = require('path');
const os = require('os');

const PG_PORT = Number(process.env.TEST_PG_PORT || 55432);
const PG_HOST = '127.0.0.1';
const PG_USER = process.env.TEST_PG_USER || 'postgres';
const PG_PASSWORD = process.env.TEST_PG_PASSWORD || 'postgres';
const PG_DB = process.env.TEST_PG_DB || 'dareen_test';
const DATABASE_DIR = process.env.TEST_PG_DATADIR || path.join(os.tmpdir(), 'dareen-embedded-pg');

const TEST_URL = `postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}`;
const ADMIN_URL = `postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/postgres`;

module.exports = { PG_PORT, PG_HOST, PG_USER, PG_PASSWORD, PG_DB, DATABASE_DIR, TEST_URL, ADMIN_URL };
