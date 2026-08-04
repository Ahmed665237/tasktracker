import User from "./models/User.js";
import { Router } from "express"; // lets us organize related routes in a seperate file instead of putting every route in server.ts
// authentication routes can be here 
import bcrypt from "bcryptjs";// to hash passwords
import jwt from "jsonwebtoken";
import { authenticateToken } from "./middleware/authMiddleware.js";

const authRouter = Router();
authRouter.post("/login", async (req, res) => { // this is a post end point and post is used because login sends private data in the request body
  // when a client sends a post request and the backend sends a response
  const { email, password } = req.body; // this extracts the two value from the json request and we use body as we recieve values
  if (!email && password) {
    return res.status(400).json({
      message: "email is required",
    });
  }
  if (email && !password) {
    return res.status(400).json({
      message: "password is required",
    });
  }
  if (!email || !password) {
    return res.status(400).json({
      message: "email and password are required",
    });
  }
  if (
    typeof email !== "string" ||
    !email.includes("@") ||
    email.includes(" ")
  ) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.includes(" ")
  ) {
    return res.status(400).json({
      message: "Password must be at least 8 characters",
    });

    // this upper part validates credentials format
  }
  const existingUser = await User.findOne({ // this searches for the email
    where: {
      email: email,
    },
  });
  // runs if the email does not exist in the database
  if (!existingUser) {
    return res.status(401).json({
      message: "Invalid email",
    });
  }
  // compares the entered password with the password hash stored in the database
  const passwordIsCorrect = await bcrypt.compare(
    password,
    existingUser.passwordHash
  );
  // runs if the entered password is incorrect
  if (!passwordIsCorrect) {
    return res.status(401).json({
      message: "Invalid password",
    });
  }
  // temporary success response until we create the account page
  // gets the JWT secret from the .env file
const jwtSecret = process.env.JWT_SECRET; // reads the private value added in the .env file

if (!jwtSecret) {
  throw new Error("JWT_SECRET is missing");
} // checks whether the secret exists

// creates a token containing the logged-in user's ID
const token = jwt.sign(
  {
    userId: existingUser.id,
  },
  jwtSecret,
  {
    expiresIn: "1h", // token is valid for 1h
  }
);
// sends the token and safe user data to the frontend containing the user id so later when the backend sends the request it knows which user
  return res.status(200).json({
    message: "Successfully signed in",
      token: token,// then this response sends token to the react
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
    },
  });
});
//////////////////////////////////////////////////////////////////////////////////////
authRouter.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (name && !email && !password) {
    return res.status(400).json({
      message: "email and password are required",
    });
  }

  if (!name && email && !password) {
    return res.status(400).json({
      message: "name and password are required",
    });
  }

  if (!name && !email && password) {
    return res.status(400).json({
      message: "name and email are required",
    });
  }

  if (name && email && !password) {
    return res.status(400).json({
      message: "password is required",
    });
  }

  if (name && !email && password) {
    return res.status(400).json({
      message: "email is required",
    });
  }

  if (!name && email && password) {
    return res.status(400).json({
      message: "name is required",
    });
  }

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required",
    });
  }

  if (
    typeof email !== "string" ||
    !email.includes("@") ||
    email.includes(" ")
  ) {
    return res.status(400).json({
      message: "Please enter a valid email address",
    });
  }

  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters",
    });
  }

  const existingUser = await User.findOne({ // does the commands in postgres sql and existing user stores the vlaue
    where: {
      email: email, // sees if email equals one in the db of the user sent
    },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Email already exists",
    });
  }

  // hashes the password before saving it in the database
  const passwordHash = await bcrypt.hash(password, 12); // this hashes the password entered

  // creates the new user in the users table
  const newUser = await User.create({
    name: name,
    email: email,
    passwordHash: passwordHash,
  }); // this tells sequalize to enter the new password into a new row

  const jwtSecret = process.env.JWT_SECRET; // reads the private value added in the .env file

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing");
  } // checks whether the secret exists

  // creates a token containing the logged-in user's ID
  const token = jwt.sign(
    {
      userId: newUser.id,
    },
    jwtSecret,
    {
      expiresIn: "1h", // token is valid for 1h
    }
  );

  // sends the token and safe user data to the frontend containing the user id so later when the backend sends the request it knows which user
  // sends the created user data back without returning the password or password hash
  return res.status(201).json({
    message: "Account created successfully",
    token: token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    }, // this gives a response that an account was updated succcessfully
  });

  // existing user gets checked
}); // closes signup route

authRouter.get("/me", authenticateToken, async (req, res) => { //creates the current user endpoint
  const userId = res.locals.userId;

  const currentUser = await User.findByPk(userId);

  if (!currentUser) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    user: {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
    },
  });
});

export default authRouter;