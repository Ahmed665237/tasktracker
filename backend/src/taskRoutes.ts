import { Router } from "express";

import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "./taskController.js";

import {
  authenticateToken,
} from "./middleware/authMiddleware.js";

const taskRouter = Router();

/*
  Loads all tasks inside
  a specific project.
*/
taskRouter.get(
  "/:projectId/tasks",
  authenticateToken,
  getTasks
);

/*
  Creates a task inside
  a specific project.
*/
taskRouter.post(
  "/:projectId/tasks",
  authenticateToken,
  createTask
);

/*
  Updates one existing task
  inside a specific project.
*/
taskRouter.put(
  "/:projectId/tasks/:taskId",
  authenticateToken,
  updateTask
);

/*
  Soft deletes one existing task
  inside a specific project.
*/
taskRouter.delete(
  "/:projectId/tasks/:taskId",
  authenticateToken,
  deleteTask
);

export default taskRouter;