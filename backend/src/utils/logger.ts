import winston from "winston";

/*
  Winston logger used for operational logging.

  It sends logs to:
  - the backend terminal
  - logs/combined.log
  - logs/error.log
*/
const logger = winston.createLogger({
  /*
    Logs info level and anything more important
    such as warnings and errors.
  */
  level: "info",

  /*
    Gives every log a timestamp.

    errors({ stack: true }) keeps the real
    error stack when an Error object is logged.
  */
  format: winston.format.combine(
    winston.format.timestamp(),

    winston.format.errors({
      stack: true,
    }),

    winston.format.printf(
      ({
        timestamp,
        level,
        message,
        stack,
      }) => {
        /*
          If an error contains a stack trace,
          display it after the message.
        */
        if (stack) {
          return `[${level.toUpperCase()}] ${timestamp} ${message}\n${stack}`;
        }

        return `[${level.toUpperCase()}] ${timestamp} ${message}`;
      }
    )
  ),

  /*
    A transport decides where
    Winston sends the logs.
  */
  transports: [
    /*
      Displays logs in the backend terminal.
    */
    new winston.transports.Console(),

    /*
      Stores only error logs.
    */
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    /*
      Stores both info and error logs.
    */
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

export default logger;