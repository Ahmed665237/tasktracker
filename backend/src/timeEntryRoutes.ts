import { Router } from "express";

import {
  createTimeEntry,
  getTimeEntries,
  updateTimeEntry,
  deleteTimeEntry,
} from "./timeEntryController.js";

import {
  authenticateToken,
} from "./middleware/authMiddleware.js";

const timeEntryRouter = Router();

/*
  Gets all time entries for one task.

  Also returns:
  - total logged minutes
  - remaining minutes
  - exceeded minutes
*/
timeEntryRouter.get(
  "/:projectId/tasks/:taskId/time-entries",
  authenticateToken,
  getTimeEntries
);

/*
  Creates a new time entry
  for one task.
*/
timeEntryRouter.post(
  "/:projectId/tasks/:taskId/time-entries",
  authenticateToken,
  createTimeEntry
);

/*
  Updates one existing
  time entry.
*/
timeEntryRouter.put(
  "/:projectId/tasks/:taskId/time-entries/:timeEntryId",
  authenticateToken,
  updateTimeEntry
);

/*
  Permanently deletes one
  time entry.
*/
timeEntryRouter.delete(
  "/:projectId/tasks/:taskId/time-entries/:timeEntryId",
  authenticateToken,
  deleteTimeEntry
);

export default timeEntryRouter;