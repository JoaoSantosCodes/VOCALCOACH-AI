import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { authConfig } from './auth.config';

const { format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;

// Custom log format for development
const devLogFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += `\n${JSON.stringify(metadata, null, 2)}`;
  }
  return msg;
});

// Custom log format for production
const prodLogFormat = combine(
  timestamp(),
  json()
);

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Create the logger
const logger = winston.createLogger({
  level: authConfig.logging.level || 'info',
  levels: logLevels,
  format: process.env.NODE_ENV === 'production' ? prodLogFormat : combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    devLogFormat
  ),
  transports: [
    // Console transport for development
    new transports.Console({
      level: 'debug',
      handleExceptions: true,
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        devLogFormat
      ),
    }),

    // File transport for errors
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: prodLogFormat,
    }),

    // File transport for all logs
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: prodLogFormat,
    }),
  ],
  // Handle uncaught exceptions and unhandled rejections
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' }),
  ],
  exitOnError: false,
});

// Create a stream object for Morgan middleware
const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper functions for common logging patterns
export const logError = (error: Error, context?: string) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

export const logAPIRequest = (req: any, context?: string) => {
  logger.info({
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    body: req.body,
    context,
    timestamp: new Date().toISOString(),
  });
};

export const logPerformance = (operation: string, duration: number) => {
  logger.debug({
    operation,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  });
};

export const logSecurity = (event: string, details: any) => {
  logger.warn({
    event,
    details,
    timestamp: new Date().toISOString(),
  });
};

export { logger, stream }; 