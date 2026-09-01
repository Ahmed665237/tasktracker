import Project from "./Project.js";
import Task from "./Task.js";

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

export {
  Project,
  Task,
};