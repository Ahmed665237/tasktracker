import Project from "./Project.js";
import Task from "./Task.js";
import TimeEntry from "./TimeEntry.js";

/*
  One project can contain many tasks.

  tasks.project_id stores the project ID.
*/
Project.hasMany(Task, {
  foreignKey: "projectId",
  onDelete: "CASCADE",
});

/*
  Every task belongs to one project.

  task.projectId points to project.id.
*/
Task.belongsTo(Project, {
  foreignKey: "projectId",
});

/*
  One task can contain many time entries.

  time_entries.task_id stores the task ID.
*/
Task.hasMany(TimeEntry, {
  foreignKey: "taskId",
  onDelete: "CASCADE",
});

/*
  Every time entry belongs to one task.

  timeEntry.taskId points to task.id.
*/
TimeEntry.belongsTo(Task, {
  foreignKey: "taskId",
});

export {
  Project,
  Task,
  TimeEntry,
};