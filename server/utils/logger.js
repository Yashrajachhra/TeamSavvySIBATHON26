const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const levels = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
};

const currentLevel = levels[process.env.LOG_LEVEL?.toUpperCase()] ?? levels.DEBUG;

const formatMessage = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
};

const writeToFile = (formatted) => {
    const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, formatted + '\n');
};

const logger = {
    error(message, meta = {}) {
        if (currentLevel >= levels.ERROR) {
            const formatted = formatMessage('ERROR', message, meta);
            console.error(formatted);
            writeToFile(formatted);
        }
    },
    warn(message, meta = {}) {
        if (currentLevel >= levels.WARN) {
            const formatted = formatMessage('WARN', message, meta);
            console.warn(formatted);
            writeToFile(formatted);
        }
    },
    info(message, meta = {}) {
        if (currentLevel >= levels.INFO) {
            const formatted = formatMessage('INFO', message, meta);
            console.log(formatted);
            writeToFile(formatted);
        }
    },
    debug(message, meta = {}) {
        if (currentLevel >= levels.DEBUG) {
            const formatted = formatMessage('DEBUG', message, meta);
            console.log(formatted);
        }
    },
};

module.exports = logger;
