import { Router } from "express";

import {
  authenticateToken,
} from "./middleware/authMiddleware.js";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "./projectController.js";

const projectRouter = Router();

/*
  Gets all projects that belong to
  the currently logged-in user.

  authenticateToken runs first.

  If the JWT is valid, getProjects runs.
*/
projectRouter.get(
  "/",
  authenticateToken,
  getProjects
);

/*
  Creates a new project.
*/
projectRouter.post(
  "/",
  authenticateToken,
  createProject
);

/*
  Updates one existing project.
*/
projectRouter.put(
  "/:projectId",
  authenticateToken,
  updateProject
);

/*
  Soft deletes one project.
*/
projectRouter.delete(
  "/:projectId",
  authenticateToken,
  deleteProject
);

export default projectRouter;

// this file connects the URL to the controller fn