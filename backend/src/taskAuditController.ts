import type {
  Request,
  Response,
  NextFunction,
} from "express";

import Project from "./Project.js";
import Task from "./Task.js";
import TaskAudit from "./TaskAudit.js";

/*
  Gets the audit history for one task.

  The history is read-only.

  This endpoint only returns existing
  audit records from PostgreSQL.
*/
export const getTaskAuditHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    /*
      Gets the logged-in user's ID
      from authenticateToken.
    */
    const userId =
      res.locals.userId;

    /*
      Gets the project ID and task ID
      from the URL.

      Example:
      /api/projects/5/tasks/10/audit-history

      projectId = 5
      taskId = 10
    */
    const projectId =
      Number(req.params.projectId);

    const taskId =
      Number(req.params.taskId);

    /*
      Rejects invalid URL IDs.
    */
    if (
      Number.isNaN(projectId) ||
      Number.isNaN(taskId)
    ) {
      return res.status(400).json({
        message:
          "Invalid project or task ID",
      });
    }

    /*
      Makes sure the project exists
      AND belongs to the logged-in user.

      This prevents one user from reading
      another user's task history.
    */
    const project =
      await Project.findOne({
        where: {
          id:
            projectId,

          userId:
            userId,
        },
      });

    /*
      Stops if the project does not exist
      or belongs to another user.
    */
    if (!project) {
      return res.status(404).json({
        message:
          "Project not found",
      });
    }

    /*
      Makes sure the requested task exists
      inside the selected project.
    */
    const task =
      await Task.findOne({
        where: {
          id:
            taskId,

          projectId:
            projectId,
        },
      });

    /*
      Stops if the task does not exist
      inside this project.
    */
    if (!task) {
      return res.status(404).json({
        message:
          "Task not found",
      });
    }

    /*
      Gets all audit-history records
      belonging to this task.

      Newest records are returned first
      so the latest change appears
      at the top of the history.
    */
    const auditHistory =
      await TaskAudit.findAll({
        where: {
          taskId:
            taskId,
        },

        order: [
          [
            "createdAt",
            "DESC",
          ],
        ],
      });

    /*
      Sends the read-only task history
      back to the frontend.
    */
    return res.status(200).json({
      auditHistory:
        auditHistory,
    });
  } catch (error) {
    // Centralized error fn passed to middleware
    next(error);
  }
};