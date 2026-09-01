import express from "express";
import request from "supertest";
import errorHandler from "../src/utils/errorHandler.js";
import logger from "../src/utils/logger.js";

jest.mock("../src/utils/logger.js", () => ({
  error: jest.fn(),
}));

const app = express();

app.get("/error", (req, res, next) => {
  next(new Error("Test error"));
  // Sends a fake unexpected error to the centralized error middleware.
});

app.use(errorHandler);
// Error middleware must be added after the routes.

describe("errorHandler middleware", () => {

  test("returns 500 for unexpected server errors", async () => {

    const response = await request(app)
      .get("/error");
    // Calls a route that deliberately throws/sends an error.

    expect(response.status).toBe(500);
    // Confirms the middleware returns HTTP 500.

    expect(response.body.message).toBe(
      "Internal server error"
    );
    // Confirms the standardized response message.
  });

  test("logs the unexpected error", async () => {

    await request(app)
      .get("/error");
    // Trigger the error middleware.

    expect(logger.error).toHaveBeenCalled();
    // Confirms that logger.error() was called.
  });

  test("logs the error stack", async () => {

    await request(app)
      .get("/error");

    expect(logger.error).toHaveBeenCalledWith(
      "Unexpected server error",
      expect.objectContaining({
        stack: expect.any(String),
      })
    );
    // Confirms the logger receives the message
    // and an object containing the error stack.
  });
});