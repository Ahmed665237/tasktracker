import logger from "./logger.js";
import type {
  Request,
  Response,
  NextFunction,
} from "express";

/*
  Handles unexpected backend errors
  in one centralized place.

  Controllers send unexpected errors
  here using next(error).
*/
const errorHandler = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  /*
    Prints the real error in the backend terminal
    so it can be debugged it.
  */
  logger.error(
  "Unexpected server error",
  error
); // to make all logs follow one consistant format then print the type of error

  /*
    Sends one consistent response
    for unexpected server errors.
  */
  response.status(500).json({
    message: "Internal server error",
  });
};

export default errorHandler;
// this has been created as 500 is the response for unexpected server errors and so on