import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../src/middleware/authMiddleware.js";

const app = express();
app.use(express.json());
app.get(
  "/protected",
  authenticateToken,
  (req, res) => {
    return res.status(200).json({
      message: "Access granted",
      userId: res.locals.userId,
    });
  }
);

describe("authenticateToken middleware", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";// creates a temp JWT 
  });

  test("returns 401 when authorization header is missing", async () => {
    const response = await request(app)
      .get("/protected");
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Authentication token is required"
    );
  });

  test("returns 401 when token is missing after Bearer", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer");
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Authentication token is required"
    );
  });

  test("returns 401 when token is invalid", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer fake-token");
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Invalid or expired token"
    );
  });

  test("returns 401 when token is expired", async () => {
    const expiredToken = jwt.sign(
      {
        userId: 1,
      },
      process.env.JWT_SECRET as string, // creating an already expired token
      {
        expiresIn: "-1s",
      }
    );
    const response = await request(app)
      .get("/protected")
      .set(
        "Authorization",
        `Bearer ${expiredToken}` // the header
      );
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Invalid or expired token"
    );
  });

  test("allows request when token is valid", async () => {
    const validToken = jwt.sign(
      {
        userId: 1,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );
    const response = await request(app)
      .get("/protected")
      .set(
        "Authorization",
        `Bearer ${validToken}`
      );
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "Access granted"
    );
    expect(response.body.userId).toBe(1);
  });

});