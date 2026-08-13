// goal of middleware

// receive a protected request
// → read the token
// → verify it using JWT_SECRET
// → extract the user ID
// → allow or reject the request

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
interface JwtPayload {
  userId: number;
}
export const authenticateToken = ( // middle ware fn begins 
  req: Request, // receive req
  res: Response,
  next: NextFunction
) => {
  // gets the Authorization header sent by the frontend
  const authorizationHeader = req.headers.authorization;
  // checks if the Authorization header exists
  if (!authorizationHeader) {
    return res.status(401).json({
      message: "Authentication token is required",
    });
  }
  // expected format: Bearer token_value
  const token = authorizationHeader.split(" ")[1];
  // checks if the token exists after Bearer
  if (!token) {
    return res.status(401).json({
      message: "Authentication token is required",
    });
  }
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing");
  }
  try {
    // verifies the token and reads its data
    const decodedToken = jwt.verify(token, jwtSecret) as JwtPayload;
    // temporarily stores the user ID for the next route
    res.locals.userId = decodedToken.userId;

    // allows the request to continue to the protected route
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
