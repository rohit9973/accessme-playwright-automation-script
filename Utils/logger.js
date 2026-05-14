

import { createLogger, format, transports } from 'winston';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR   = path.join(__dirname, '../reports/logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const { combine, timestamp, colorize, printf, json, errors } = format;

// ── Console format (human-readable + colors) ──────────────────────
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, testId, ...meta }) => {
    const tag   = testId ? `[${testId}] ` : '';
    const extra = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${tag}${message}${extra}`;
  })
);

// ── File format (structured JSON for CI / dashboards) ────────────
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = createLogger({
  level: 'debug',
  transports: [
    new transports.Console({ format: consoleFormat }),
    new transports.File({
      filename: path.join(LOG_DIR, 'test-run.log'),
      format:   fileFormat,
      maxsize:  5_242_880, // 5 MB
      maxFiles: 3,
    }),
    new transports.File({
      filename: path.join(LOG_DIR, 'errors.log'),
      level:    'error',
      format:   fileFormat,
    }),
  ],
});

export default logger;
