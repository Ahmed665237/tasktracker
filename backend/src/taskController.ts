import logger from "./utils/logger.js";
import type {
  Request,
  Response,
  NextFunction, // to make the next(), express fn
} from "express";

import {
  Op,
} from "sequelize";

import Task from "./Task.js";
import Project from "./Project.js";

/*
  Creates a new task inside
  a specific project.
*/
export const createTask = async (
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
      Estimated time is optional.

      If provided, it must be a valid number
      between 1 and 10080 minutes
      (7 days).
    */
    if (
      estimatedMinutes !== null &&
      estimatedMinutes !== undefined
    ) {
      const numericEstimatedMinutes =
        Number(estimatedMinutes);

      if (
        Number.isNaN(numericEstimatedMinutes) ||
        numericEstimatedMinutes < 1 ||
        numericEstimatedMinutes > 10080
      ) {
        return res.status(400).json({
          message:
            "Estimated time must be between 1 and 10080 minutes",
        });
      }
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
   logger.info(
  `Task created successfully for user ${userId}` // this message will be displayed in the terminal when a successfull log happens
);// this is the message parameter in logger 
    return res.status(201).json({
      message:
        "Task created successfully",

      task:
        newTask,
    });
  } catch (error) {
    // Centralized error fn passed to middleware
    next(error);
  }
};

/*
  Gets all tasks inside
  a specific project.

  Search and filtering are handled
  by the backend using query parameters.
*/
export const getTasks = async (
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
      Reads optional search/filter values
      from the query string.

      Examples:
      ?search=login
      ?status=In%20Progress
      ?priority=High
      ?overdue=true
    */
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : "";

    const priority =
      typeof req.query.priority === "string"
        ? req.query.priority
        : "";

    const overdue =
      req.query.overdue === "true";

    /*
      Rejects invalid status values instead
      of sending them to PostgreSQL.
    */
    if (
      status !== "" &&
      status !== "To Do" &&
      status !== "In Progress" &&
      status !== "Done"
    ) {
      return res.status(400).json({
        message:
          "Invalid task status filter",
      });
    }

    /*
      Rejects invalid priority values.
    */
    if (
      priority !== "" &&
      priority !== "Low" &&
      priority !== "Medium" &&
      priority !== "High"
    ) {
      return res.status(400).json({
        message:
          "Invalid task priority filter",
      });
    }

    /*
      Starts with the required project filter.

      Additional filters are added below
      only when the frontend sends them.
    */
    const whereConditions: any = {
      projectId:
        projectId,
    };

    /*
      Searches both task title and description.

      Op.iLike performs a case-insensitive
      search in PostgreSQL.
    */
    if (search !== "") {
      whereConditions[Op.or] = [
        {
          title: {
            [Op.iLike]:
              `%${search}%`,
          },
        },
        {
          description: {
            [Op.iLike]:
              `%${search}%`,
          },
        },
      ];
    }

    /*
      Adds an exact status filter
      when one is selected.
    */
    if (status !== "") {
      whereConditions.status =
        status;
    }

    /*
      Adds an exact priority filter
      when one is selected.
    */
    if (priority !== "") {
      whereConditions.priority =
        priority;
    }

    /*
      Overdue means:
      - the due date is before today
      - the task is not Done

      If a specific non-Done status is already
      selected, that status remains in effect.
    */
    if (overdue) {
      const today =
        new Date();

      const year =
        today.getFullYear();

      const month =
        String(
          today.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          today.getDate()
        ).padStart(2, "0");

      const todayDate =
        `${year}-${month}-${day}`;

      whereConditions.dueDate = {
        [Op.lt]:
          todayDate,
      };

      if (status === "") {
        whereConditions.status = {
          [Op.ne]:
            "Done",
        };
      }
    }

    /*
      PostgreSQL now performs the search
      and filtering before returning data.

      The frontend receives only matching tasks.
    */
    const tasks =
      await Task.findAll({
        where:
          whereConditions,

        order: [
          [
            "createdAt",
            "DESC",
          ],
        ],
      });

    /*
      Sends only the matching tasks
      back to the frontend.
    */
    return res.status(200).json({
      tasks:
        tasks,
    });
  } catch (error) {
    // Centralized error fn passed to middleware
    next(error);
  }
};

/*
  Gets one specific task inside
  a specific project.

  This is used when the frontend opens
  a direct task URL such as:
  /projects/5/tasks/10
*/
export const getTaskById = async (
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
      Finds the requested task only
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
      Sends the task back to the frontend.
    */
    return res.status(200).json({
      task:
        task,
    });
  } catch (error) {
    // Centralized error fn passed to middleware
    next(error);
  }
};

/*
  Updates an existing task inside
  a specific project.
*/
export const updateTask = async (
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
      Estimated time is optional.

      If provided, it must be a valid number
      between 1 and 10080 minutes
      (7 days).
    */
    if (
      estimatedMinutes !== null &&
      estimatedMinutes !== undefined
    ) {
      const numericEstimatedMinutes =
        Number(estimatedMinutes);

      if (
        Number.isNaN(numericEstimatedMinutes) ||
        numericEstimatedMinutes < 1 ||
        numericEstimatedMinutes > 10080
      ) {
        return res.status(400).json({
          message:
            "Estimated time must be between 1 and 10080 minutes",
        });
      }
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
    // Centralized error fn passed to middleware
    next(error);
  }
};

/*
  Permanently deletes an existing task inside
  a specific project.
*/
export const deleteTask = async (
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
      Permanently deletes the task
      from PostgreSQL.
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
    // Centralized error fn passed to middleware
    next(error);
  }
};