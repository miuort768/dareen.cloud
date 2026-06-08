const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');

if (!fs.existsSync(LOG_DIR)) {
    try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch {}
}

const logFile = path.join(LOG_DIR, 'app.log');
const errorFile = path.join(LOG_DIR, 'error.log');

const writeToFile = (file, message) => {
    try {
        fs.appendFileSync(file, message + '\n');
    } catch {}
};

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
        writeToFile(logFile, line);
    },
    error: (message, error, ...args) => {
        const details = error?.stack || error?.message || error;
        const extra = args.map(sanitizeForFile).join(' ');
        const line = `[ERROR] [${new Date().toISOString()}] ${message} ${details} ${extra}`;
        console.error(line);
        writeToFile(errorFile, line);
        writeToFile(logFile, line);
    },
    warn: (message, ...args) => {
        const line = `[WARN] [${new Date().toISOString()}] ${message} ${args.map(sanitizeForFile).join(' ')}`;
        console.warn(line);
        writeToFile(logFile, line);
    },
    debug: (message, ...args) => {
        if (process.env.NODE_ENV !== 'production') {
            const line = `[DEBUG] [${new Date().toISOString()}] ${message} ${args.map(sanitizeForFile).join(' ')}`;
            console.log(line);
        }
    }
};

module.exports = logger;
