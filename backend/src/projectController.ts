import type {
  Request,
  Response,
} from "express";

import Project from "./Project.js";

/*
  Gets all projects belonging to
  the currently logged-in user.
*/
export const getProjects = async (
  req: Request,
  res: Response
) => {
  try {
    /*
      authenticateToken reads the JWT
      and stores the logged-in user's ID here.
    */
    const userId =
      res.locals.userId;

    /*
      Finds only projects that belong
      to the logged-in user.

      This prevents one user from seeing
      another user's projects.

      Because Project uses paranoid: true,
      Sequelize automatically ignores
      projects whose deleted_at is not null.
    */
    const projects =
      await Project.findAll({
        where: {
          userId:
            userId,
        },

        /*
          Shows newest projects first.
        */
        order: [
          [
            "createdAt",
            "DESC",
          ],
        ],
      });

    /*
      Sends the user's projects
      back to the frontend as JSON.
    */
    return res.status(200).json({
      projects:
        projects,
    });
  } catch (error) {
    /*
      Runs if something unexpected fails
      while reading projects.
    */
    console.error(
      "Error getting projects:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to get projects",
    });
  }
};


/*
  Creates a new project for
  the currently logged-in user.
*/
export const createProject = async (
  req: Request,
  res: Response
) => {
  try {
    /*
      authenticateToken reads the JWT
      and stores the logged-in user's ID here.
    */
    const userId =
      res.locals.userId;

    /*
      Gets the project information
      sent inside the HTTP request body.
    */
    const {
      name,
      description,
    } = req.body;

    /*
      Makes sure the project name exists
      and is actually a string.
    */
    if (
      typeof name !== "string" ||
      name.trim() === ""
    ) {
      return res.status(400).json({
        message:
          "Project name is required",
      });
    }

    /*
      The frontend allows a maximum
      of 60 characters for project names.

      The backend also checks this so
      someone cannot bypass the frontend.
    */
    if (
      name.trim().length > 60
    ) {
      return res.status(400).json({
        message:
          "Project name cannot exceed 60 characters",
      });
    }

    /*
      Creates the project in PostgreSQL
      using Sequelize.

      We do NOT send an ID here.

      PostgreSQL generates the project's
      real auto-incrementing primary key.
    */
    const newProject =
      await Project.create({
        userId:
          userId,

        name:
          name.trim(),

        /*
          Description is optional.

          If it is empty, null is stored
          in the database.
        */
        description:
          typeof description === "string" &&
          description.trim() !== ""
            ? description.trim()
            : null,
      });

    /*
      Sends the newly created project
      back to the frontend.

      newProject now contains the real
      database-generated project ID.
    */
    return res.status(201).json({
      message:
        "Project created successfully",

      project:
        newProject,
    });
  } catch (error) {
    /*
      Runs if something unexpected fails
      while creating the project.
    */
    console.error(
      "Error creating project:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to create project",
    });
  }
};


/*
  Updates an existing project belonging
  to the currently logged-in user.
*/
export const updateProject = async (
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
      Gets the project ID from the URL.

      Example:
      PUT /api/projects/5

      projectId = 5
    */
    const projectId =
      Number(
        req.params.projectId
      );

    /*
      Rejects an invalid project ID.
    */
    if (
      Number.isNaN(projectId)
    ) {
      return res.status(400).json({
        message:
          "Invalid project ID",
      });
    }

    /*
      Finds the project only if:
      - the project exists
      - it belongs to the logged-in user
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
      Gets the updated project information
      sent by the frontend.
    */
    const {
      name,
      description,
    } = req.body;

    /*
      Project name is required.
    */
    if (
      typeof name !== "string" ||
      name.trim() === ""
    ) {
      return res.status(400).json({
        message:
          "Project name is required",
      });
    }

    /*
      Keeps the same maximum project-name
      length used when creating projects.
    */
    if (
      name.trim().length > 60
    ) {
      return res.status(400).json({
        message:
          "Project name cannot exceed 60 characters",
      });
    }

    /*
      Updates the project in PostgreSQL.
    */
    await project.update({
      name:
        name.trim(),

      description:
        typeof description === "string" &&
        description.trim() !== ""
          ? description.trim()
          : null,
    });

    /*
      Sends the updated project
      back to the frontend.
    */
    return res.status(200).json({
      message:
        "Project updated successfully",

      project:
        project,
    });
  } catch (error) {
    console.error(
      "Error updating project:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update project",
    });
  }
};


/*
  Soft deletes one project belonging
  to the currently logged-in user.
*/
export const deleteProject = async (
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
      Gets the project ID from the URL.

      Example:
      DELETE /api/projects/5

      projectId = 5
    */
    const projectId =
      Number(
        req.params.projectId
      );

    /*
      Rejects an invalid project ID.
    */
    if (
      Number.isNaN(projectId)
    ) {
      return res.status(400).json({
        message:
          "Invalid project ID",
      });
    }

    /*
      Finds the project only if:
      - the project exists
      - it belongs to the logged-in user
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
      Soft deletes the project.

      Because Project has:

      paranoid: true

      Sequelize does NOT remove the row.

      Instead it sets:
      deleted_at = current date/time
    */
    await project.destroy();

    /*
      Sends success back
      to the frontend.
    */
    return res.status(200).json({
      message:
        "Project deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error deleting project:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to delete project",
    });
  }
};