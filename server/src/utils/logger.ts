import winston from 'winston';

const logLevel = process.env['LOG_LEVEL'] || 'info';

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'jenkins-dashboard' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: process.env['LOG_FILE'] || 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: process.env['LOG_FILE'] || 'logs/combined.log' 
    })
  ]
});

if (process.env['NODE_ENV'] !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
} 