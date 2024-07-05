const winston = require('winston');
require('winston-daily-rotate-file');
require("dotenv").config();

const { combine, timestamp, printf, align } = winston.format;
const fs = require('fs');

if (!fs.existsSync('logs')) {
  try {
    fs.mkdirSync('logs');
  } catch (err) {
    console.error('Failed to create logs directory:', err);
  }
}

const timezoned = () => {
  return new Date().toLocaleString('en-US', {
    timeZone: process.env.LOG_TIMEZONE || 'UTC',
  });
};

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: timezoned }),
    align(),
    printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`),
  ),
  transports: [
    fileRotateTransport,
    new winston.transports.Console({
      format: combine(
        timestamp({ format: timezoned }),
        align(),
        printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
      ),
    }),
  ],
});

module.exports = logger;
