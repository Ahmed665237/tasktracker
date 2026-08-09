import type {
  Request,
  Response,
} from "express";

import Task from "./Task.js";
import Project from "./Project.js";

/*
  Creates a new task inside
  a specific project.
*/
export const createTask = async (
  req: Request,
  res: Response
) => {
  try {
    /*
      Gets the logged-in user's ID
      from authenticateToken.
    */
    const userId =
      res.locals.userId;

    /*
      Gets projectId from the URL.

      Example:
      /api/projects/5/tasks

      projectId = 5
    */
    const projectId =
      Number(req.params.projectId);

    /*
      Rejects an invalid project ID.
    */
    if (Number.isNaN(projectId)) {
      return res.status(400).json({
        message:
          "Invalid project ID",
      });
    }

    /*
      Makes sure the project exists
      AND belongs to the logged-in user.
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
      Gets the task information
      sent by the frontend.
    */
    const {
      title,
      description,
      status,
      priority,
      estimatedMinutes,
      dueDate,
    } = req.body;

    /*
      Task title is required.
    */
    if (
      typeof title !== "string" ||
      title.trim() === ""
    ) {
      return res.status(400).json({
        message:
          "Task title is required",
      });
    }

    /*
      Keeps backend validation consistent
      with the frontend title limit.
    */
    if (
      title.trim().length > 100
    ) {
      return res.status(400).json({
        message:
          "Task title cannot exceed 100 characters",
      });
    }

    /*
      Creates the task in PostgreSQL.

      We do NOT provide an id.

      PostgreSQL generates the real
      task primary key automatically.
    */
    const newTask =
      await Task.create({
        projectId:
          projectId,

        title:
          title.trim(),

        description:
          typeof description === "string" &&
          description.trim() !== ""
            ? description.trim()
            : null,

        status:
          status ?? "To Do",

        priority:
          priority ?? "Medium",

        estimatedMinutes:
          estimatedMinutes ?? null,

        dueDate:
          dueDate || null,
      });

    /*
      Sends the created task back
      to the frontend.

      newTask contains the real
      database-generated task ID.
    */
    return res.status(201).json({
      message:
        "Task created successfully",

      task:
        newTask,
    });
  } catch (error) {
    console.error(
      "Error creating task:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to create task",
    });
  }
};

/*
  Gets all tasks inside
  a specific project.
*/
export const getTasks = async (
  req: Request,
  res: Response
) => {
  try {
    /*
      Gets the logged-in user's ID
      from authenticateToken.
    */
    const userId =
      res.locals.userId;

    /*
      Gets projectId from the URL.

      Example:
      /api/projects/5/tasks

      projectId = 5
    */
    const projectId =
      Number(req.params.projectId);

    /*
      Rejects an invalid project ID.
    */
    if (Number.isNaN(projectId)) {
      return res.status(400).json({
        message:
          "Invalid project ID",
      });
    }

    /*
      Makes sure the project exists
      AND belongs to the logged-in user.
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
      Gets all tasks that belong
      to this project.

      Because Task uses paranoid: true,
      soft-deleted tasks are automatically
      excluded.
    */
    const tasks =
      await Task.findAll({
        where: {
          projectId:
            projectId,
        },

        order: [
          [
            "createdAt",
            "DESC",
          ],
        ],
      });

    /*
      Sends the tasks back
      to the frontend.
    */
    return res.status(200).json({
      tasks:
        tasks,
    });
  } catch (error) {
    console.error(
      "Error getting tasks:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to get tasks",
    });
  }
};

/*
  Updates an existing task inside
  a specific project.
*/
export const updateTask = async (
  req: Request,
  res: Response
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
      /api/projects/5/tasks/10

      projectId = 5
      taskId = 10
    */
    const projectId =
      Number(req.params.projectId);

    const taskId =
      Number(req.params.taskId);

    /*
      Rejects invalid IDs.
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
      Finds the task only inside
      the selected project.
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
      Gets the updated task information
      sent by the frontend.
    */
    const {
      title,
      description,
      status,
      priority,
      estimatedMinutes,
      dueDate,
    } = req.body;

    /*
      Task title is required.
    */
    if (
      typeof title !== "string" ||
      title.trim() === ""
    ) {
      return res.status(400).json({
        message:
          "Task title is required",
      });
    }

    /*
      Keeps the same title limit
      used when creating tasks.
    */
    if (
      title.trim().length > 100
    ) {
      return res.status(400).json({
        message:
          "Task title cannot exceed 100 characters",
      });
    }

    /*
      Updates the task in PostgreSQL.
    */
    await task.update({
      title:
        title.trim(),

      description:
        typeof description === "string" &&
        description.trim() !== ""
          ? description.trim()
          : null,

      status:
        status ?? task.status,

      priority:
        priority ?? task.priority,

      estimatedMinutes:
        estimatedMinutes ?? null,

      dueDate:
        dueDate || null,
    });

    /*
      Sends the updated task
      back to the frontend.
    */
    return res.status(200).json({
      message:
        "Task updated successfully",

      task:
        task,
    });
  } catch (error) {
    console.error(
      "Error updating task:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update task",
    });
  }
};

/*
  Soft deletes an existing task inside
  a specific project.
*/
export const deleteTask = async (
  req: Request,
  res: Response
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
      DELETE /api/projects/5/tasks/10

      projectId = 5
      taskId = 10
    */
    const projectId =
      Number(req.params.projectId);

    const taskId =
      Number(req.params.taskId);

    /*
      Rejects invalid IDs.
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
      Finds the task only inside
      the selected project.
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
      Soft deletes the task.

      Because Task has:

      paranoid: true

      Sequelize does NOT physically
      remove the row from PostgreSQL.

      Instead it fills:
      deleted_at = current date/time
    */
    await task.destroy();

    /*
      Sends success back
      to the frontend.
    */
    return res.status(200).json({
      message:
        "Task deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error deleting task:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to delete task",
    });
  }
};