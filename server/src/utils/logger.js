import winston from "winston";

const logger = winston.createLogger({
  level: "info", // default logging level
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }), // include stack trace
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    // Log errors to file
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // Log all messages to combined log
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// During development, log to console too
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;
