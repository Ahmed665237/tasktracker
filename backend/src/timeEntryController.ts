import type {
  Request,
  Response,
} from "express";

import Project from "./Project.js";
import Task from "./Task.js";
import TimeEntry from "./TimeEntry.js";

/*
  Helper function used by the time-entry endpoints.

  It checks:
  1. The project exists.
  2. The project belongs to the logged-in user.
  3. The task exists inside that project.

  Returning the task also gives us access
  to estimatedMinutes when calculating totals.
*/
const findOwnedTask = async (
  userId: number,
  projectId: number,
  taskId: number
) => {
  /*
    Checks that the project belongs
    to the logged-in user.
  */
  const project =
    await Project.findOne({
      where: {
        id: projectId,
        userId: userId,
      },
    });

  if (!project) {
    return null;
  }

  /*
    Checks that the task belongs
    to the selected project.
  */
  const task =
    await Task.findOne({
      where: {
        id: taskId,
        projectId: projectId,
      },
    });

  if (!task) {
    return null;
  }

  return task;
};
const isValidDate = (
  dateValue: string
) => {
  const datePattern =
    /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(dateValue)) {
    return false;
  }

  const parsedDate =
    new Date(`${dateValue}T00:00:00Z`);

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate
      .toISOString()
      .slice(0, 10) === dateValue
  );
}; // this validates the date but not in the string  way  

/*
  Creates a new time entry
  for a specific task.

  The frontend sends durationHours.

  Example:
  1.5 hours

  The backend converts it to:

  90 minutes

  before storing it in PostgreSQL.
*/
export const createTimeEntry = async (
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
      Reads projectId and taskId
      from the URL.
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
      Verifies ownership before allowing
      a time entry to be created.
    */
    const task =
      await findOwnedTask(
        userId,
        projectId,
        taskId
      );

    if (!task) {
      return res.status(404).json({
        message:
          "Task not found",
      });
    }

    /*
      Gets the values sent
      by the frontend.
    */
    const {
      durationHours,
      date,
      note,
    } = req.body;

    /*
      Duration is required
      and must be greater than zero.
    */
    const numericDurationHours =
      Number(durationHours);

    if (
      durationHours === null ||
      durationHours === undefined ||
      !Number.isFinite(numericDurationHours) ||
      numericDurationHours <= 0
    ) {
      return res.status(400).json({
        message:
          "Duration must be greater than zero",
      });
    }

    /*
      PostgreSQL stores integer minutes.

      Example:
      1.5 hours * 60 = 90 minutes.
    */
    const durationMinutes =
      Math.round(
        numericDurationHours * 60
      );

    /*
      Prevents a very small positive hour value
      from becoming 0 minutes after conversion.
    */
    if (durationMinutes < 1) {
      return res.status(400).json({
        message:
          "Duration must be at least 1 minute",
      });
    }

    /*
      Date is required.
    */
    if (
      typeof date !== "string" || !isValidDate(date)||
      date.trim() === ""
    ) {
      return res.status(400).json({
        message:
          "Date is required",
      });
    }

    /*
      Creates the time entry.

      Notice that this does NOT update
      task.status.

      Logging time must not automatically
      change the task status.
    */
    const newTimeEntry =
      await TimeEntry.create({
        taskId:
          taskId,

        durationMinutes:
          durationMinutes,

        date:
          date,

        note:
          typeof note === "string" &&
          note.trim() !== ""
            ? note.trim()
            : null,
      });

    return res.status(201).json({
      message:
        "Time entry created successfully",

      timeEntry:
        newTimeEntry,
    });
  } catch (error) {
    console.error(
      "Error creating time entry:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to create time entry",
    });
  }
};

/*
  Gets all time entries belonging
  to one task.

  It also calculates:
  - total logged time
  - remaining estimated time
  - exceeded estimated time
*/
export const getTimeEntries = async (
  req: Request,
  res: Response
) => {
  try {
    const userId =
      res.locals.userId;

    const projectId =
      Number(req.params.projectId);

    const taskId =
      Number(req.params.taskId);

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
      Checks that the logged-in user
      owns the task.
    */
    const task =
      await findOwnedTask(
        userId,
        projectId,
        taskId
      );

    if (!task) {
      return res.status(404).json({
        message:
          "Task not found",
      });
    }

    /*
      Loads all time entries
      for this task.
    */
    const timeEntries =
      await TimeEntry.findAll({
        where: {
          taskId:
            taskId,
        },

        order: [
          [
            "date",
            "DESC",
          ],
          [
            "createdAt",
            "DESC",
          ],
        ],
      });

    /*
      Adds all logged minutes together.

      Example:

      45 + 30 = 75 minutes logged.
    */
    const totalLoggedMinutes =
      timeEntries.reduce(
        (
          total,
          timeEntry
        ) =>
          total +
          timeEntry.durationMinutes,
        0
      );

    /*
      These remain null when the task
      does not have an estimate.
    */
    let remainingMinutes:
      number | null = null;

    let exceededMinutes:
      number | null = null;

    /*
      Calculates remaining/exceeded time
      only when an estimate exists.
    */
    if (
      task.estimatedMinutes !== null
    ) {
      const difference =
        task.estimatedMinutes -
        totalLoggedMinutes;

      /*
        Positive difference means
        estimated time still remains.
      */
      if (difference >= 0) {
        remainingMinutes =
          difference;

        exceededMinutes =
          0;
      } else {
        /*
          Negative difference means the user
          logged more than the estimate.
        */
        remainingMinutes =
          0;

        exceededMinutes =
          Math.abs(
            difference
          );
      }
    }

    return res.status(200).json({
      timeEntries:
        timeEntries,

      totalLoggedMinutes:
        totalLoggedMinutes,

      estimatedMinutes:
        task.estimatedMinutes,

      remainingMinutes:
        remainingMinutes,

      exceededMinutes:
        exceededMinutes,
    });
  } catch (error) {
    console.error(
      "Error getting time entries:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to get time entries",
    });
  }
};

/*
  Updates an existing time entry.
*/
export const updateTimeEntry = async (
  req: Request,
  res: Response
) => {
  try {
    const userId =
      res.locals.userId;

    const projectId =
      Number(req.params.projectId);

    const taskId =
      Number(req.params.taskId);

    const timeEntryId =
      Number(req.params.timeEntryId);

    /*
      Rejects invalid URL IDs.
    */
    if (
      Number.isNaN(projectId) ||
      Number.isNaN(taskId) ||
      Number.isNaN(timeEntryId)
    ) {
      return res.status(400).json({
        message:
          "Invalid project, task, or time entry ID",
      });
    }

    /*
      Makes sure the logged-in user
      owns the task.
    */
    const task =
      await findOwnedTask(
        userId,
        projectId,
        taskId
      );

    if (!task) {
      return res.status(404).json({
        message:
          "Task not found",
      });
    }

    /*
      Finds the time entry only
      inside this task.
    */
    const timeEntry =
      await TimeEntry.findOne({
        where: {
          id:
            timeEntryId,

          taskId:
            taskId,
        },
      });

    if (!timeEntry) {
      return res.status(404).json({
        message:
          "Time entry not found",
      });
    }

    const {
      durationHours,
      date,
      note,
    } = req.body;

    /*
      Duration remains required
      when editing an entry.
    */
    const numericDurationHours =
      Number(durationHours);

    if (
      durationHours === null ||
      durationHours === undefined ||
      Number.isNaN(numericDurationHours) ||
      numericDurationHours <= 0
    ) {
      return res.status(400).json({
        message:
          "Duration must be greater than zero",
      });
    }

    const durationMinutes =
      Math.round(
        numericDurationHours * 60
      );

    if (durationMinutes < 1) {
      return res.status(400).json({
        message:
          "Duration must be at least 1 minute",
      });
    }

    /*
      Date is also required
      when editing.
    */
    if (
      typeof date !== "string" ||
      date.trim() === ""
    ) {
      return res.status(400).json({
        message:
          "Date is required",
      });
    }

    /*
      Updates the existing PostgreSQL row.
    */
    await timeEntry.update({
      durationMinutes:
        durationMinutes,

      date:
        date,

      note:
        typeof note === "string" &&
        note.trim() !== ""
          ? note.trim()
          : null,
    });

    return res.status(200).json({
      message:
        "Time entry updated successfully",

      timeEntry:
        timeEntry,
    });
  } catch (error) {
    console.error(
      "Error updating time entry:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update time entry",
    });
  }
};

/*
  Permanently deletes one
  time entry.
*/
export const deleteTimeEntry = async (
  req: Request,
  res: Response
) => {
  try {
    const userId =
      res.locals.userId;

    const projectId =
      Number(req.params.projectId);

    const taskId =
      Number(req.params.taskId);

    const timeEntryId =
      Number(req.params.timeEntryId);

    if (
      Number.isNaN(projectId) ||
      Number.isNaN(taskId) ||
      Number.isNaN(timeEntryId)
    ) {
      return res.status(400).json({
        message:
          "Invalid project, task, or time entry ID",
      });
    }

    /*
      Verifies ownership first.
    */
    const task =
      await findOwnedTask(
        userId,
        projectId,
        taskId
      );

    if (!task) {
      return res.status(404).json({
        message:
          "Task not found",
      });
    }

    /*
      Finds only an entry belonging
      to this specific task.
    */
    const timeEntry =
      await TimeEntry.findOne({
        where: {
          id:
            timeEntryId,

          taskId:
            taskId,
        },
      });

    if (!timeEntry) {
      return res.status(404).json({
        message:
          "Time entry not found",
      });
    }

    /*
      Hard deletes the time entry
      from PostgreSQL.
    */
    await timeEntry.destroy();

    return res.status(200).json({
      message:
        "Time entry deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error deleting time entry:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to delete time entry",
    });
  }
};