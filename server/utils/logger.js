const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');

if (!fs.existsSync(LOG_DIR)) {
    try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch {}
}

const logFile = path.join(LOG_DIR, 'app.log');
const errorFile = path.join(LOG_DIR, 'error.log');

const logStream = fs.createWriteStream(logFile, { flags: 'a' });
const errorStream = fs.createWriteStream(errorFile, { flags: 'a' });

logStream.on('error', () => {});
errorStream.on('error', () => {});

const sanitizeForFile = (obj) => {
    if (!obj) return '';
    if (obj instanceof Error) return obj.message;
    if (typeof obj === 'object') {
        const safe = { ...obj };
        delete safe.password;
        delete safe.token;
        delete safe.authorization;
        delete safe['x-auth-token'];
        return JSON.stringify(safe);
    }
    return String(obj);
};

const logger = {
    info: (message, ...args) => {
        const line = `[INFO] [${new Date().toISOString()}] ${message} ${args.map(sanitizeForFile).join(' ')}`;
        console.log(line);
        logStream.write(line + '\n');
    },
    error: (message, error, ...args) => {
        const details = error?.stack || error?.message || error;
        const extra = args.map(sanitizeForFile).join(' ');
        const line = `[ERROR] [${new Date().toISOString()}] ${message} ${details} ${extra}`;
        console.error(line);
        errorStream.write(line + '\n');
        logStream.write(line + '\n');
    },
    warn: (message, ...args) => {
        const line = `[WARN] [${new Date().toISOString()}] ${message} ${args.map(sanitizeForFile).join(' ')}`;
        console.warn(line);
        logStream.write(line + '\n');
    },
    debug: (message, ...args) => {
        if (process.env.NODE_ENV !== 'production') {
            const line = `[DEBUG] [${new Date().toISOString()}] ${message} ${args.map(sanitizeForFile).join(' ')}`;
            console.log(line);
        }
    },
    close: async () => {
        await Promise.all([
            new Promise(resolve => logStream.end(resolve)),
            new Promise(resolve => errorStream.end(resolve)),
        ]);
    }
};

module.exports = logger;
