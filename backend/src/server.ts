import taskRouter from "./taskRoutes.js";
import projectRouter from "./projectRoutes.js";
import timeEntryRouter from "./timeEntryRoutes.js";

import "./modelRelations.js";
import sequelize from "./database.js";

import express from "express";
import cors from "cors";
import authRouter from "./auth.js";

const app = express(); // backend application
const port = 3000; // port on which it will run

app.use(cors()); // this allows frontend and backend to talk to each other

app.use(express.json()); // if the frontend sends JSON in the HTTP request body, read it and convert it into a JavaScript object

app.use("/api/auth", authRouter); // authentication endpoints

app.use("/api/projects", projectRouter); // project endpoints

app.use("/api/projects", taskRouter); // task endpoints

/*
  Time entry endpoints.

  Example:
  /api/projects/1/tasks/5/time-entries
*/
app.use("/api/projects", timeEntryRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Backend is working",
  });
});

sequelize
  .authenticate()
  .then(() => {
    console.log(
      "Database connected successfully"
    );
  })
  .catch((error) => {
    console.error(
      "Unable to connect to the database:",
      error
    );
  });

// these messages should appear in terminal
app.listen(port, () => {
  console.log(
    `Server is running on http://localhost:${port}`
  );
});

// start the backend application and connects the pieces together