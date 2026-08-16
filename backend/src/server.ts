import taskRouter from "./taskRoutes.js";
import projectRouter from "./projectRoutes.js";
import timeEntryRouter from "./timeEntryRoutes.js";
import errorHandler from "./utils/errorHandler.js"; // the centralized error handler

import "./modelRelations.js";
import sequelize from "./database.js";

import express from "express";
import cors from "cors";
import authRouter from "./auth.js";

/*
  Swagger UI displays the OpenAPI documentation
  as a webpage in the browser.
*/
import swaggerUi from "swagger-ui-express";

/*
  YAMLJS reads the openapi.yaml file
  and converts it into a JavaScript object
  that Swagger UI can understand.
*/
import YAML from "yamljs";

const app = express(); // backend application
const port = 3000; // port on which it will run

/*
  Reads the OpenAPI documentation file.

  openapi.yaml is located in the backend folder.
*/
const swaggerDocument =
  YAML.load("./openapi.yaml");

app.use(cors()); // this allows frontend and backend to talk to each other

app.use(express.json()); // if the frontend sends JSON in the HTTP request body, read it and convert it into a JavaScript object

/*
  Swagger API documentation.

  Opening:
  http://localhost:3000/api-docs

  will display the OpenAPI documentation
  written inside openapi.yaml.
*/
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

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
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/projects", taskRouter);
app.use("/api/projects", timeEntryRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Backend is working",
  });
});


/*
  Centralized error handler.
*/
app.use(errorHandler);
/*
  Centralized error handler.

  This must come after all normal routes as to handle all unexpected errors
*/
app.use(errorHandler);

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