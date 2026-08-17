import { Router } from "express";

import {
  authenticateToken, // to check the token
} from "./middleware/authMiddleware.js";

import {
  getTaskAuditHistory,
} from "./taskAuditController.js";

const taskAuditRouter =
  Router();

/*
  Gets the read-only audit history
  for one task.

  Example:
  GET /api/projects/5/tasks/10/audit-history
*/
taskAuditRouter.get(
  "/:projectId/tasks/:taskId/audit-history", // connects the URL to the authentication middle ware then the controller fetches the history
  authenticateToken,
  getTaskAuditHistory
);

export default taskAuditRouter;