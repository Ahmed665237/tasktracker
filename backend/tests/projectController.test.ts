import {getProjects,createProject,updateProject,deleteProject,} // fns we want to test
from "../src/projectController.js";
import Project from "../src/Project.js";
import type {
  Request,Response,NextFunction,
} from "express";

jest.mock("../src/Project.js");// prevents the test from using the real project database model
jest.mock("../src/utils/logger.js", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));// prevents real logger output during tests
const mockedFindAll = Project.findAll as jest.Mock;// fake findAll instead of postgres
const mockedCreate = Project.create as jest.Mock;// fake create instead of postgres
const mockedFindOne = Project.findOne as jest.Mock;// fake findOne instead of postgres

const createMockResponse = () => {
  const res = {
    locals: {
      userId: 1, // pretnends that the middleware is ready and already identified
    },
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as Response;
  (res.status as jest.Mock).mockReturnValue(res); // needed to return 200 without it it woudl fail
  return res;
}; // creates a fake response object f

  beforeEach(() => {
    jest.clearAllMocks();// makes every test independent from the previous test
  });


  describe("getProjects", () => {
    test("returns 200 with projects belonging to the logged in user", async() => {
      const projects = [
        {
          id: 1,
          userId: 1,
          name: "Project One",
        },
        {
          id: 2,
          userId: 1,
          name: "Project Two",
        },
      ];
      mockedFindAll.mockResolvedValue(projects);// fake database returns these projects
      const req = {} as Request; // empty fake requests
      const res = createMockResponse(); // response object
      const next = jest.fn() as NextFunction;
      await getProjects(req, res, next); // here we run the real controller using our fake requests
      expect(mockedFindAll).toHaveBeenCalledWith({
        where: {
          userId: 1,
        },
        order: [
          [
            "createdAt",
            "DESC", // for sorting query
          ],
        ],
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        projects: projects, // checks if the controller sent back the projects we gave it
      });
    });

    test("passes unexpected errors to next", async() => {
      const error = new Error("Database error");
      mockedFindAll.mockRejectedValue(error);// fake database throws an error
      const req = {} as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await getProjects(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });




  describe("createProject", () => {
    test("returns 400 when project name is missing", async() => {
      const req = {
        body: {
          description: "Test description",
        },
      } as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await createProject(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Project name is required",
      });
    });

    test("returns 400 when project name is empty", async() => {
      const req = {
        body: {
          name: "   ",
          description: "Test description",
        },
      } as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await createProject(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Project name is required",
      });
    });

    test("returns 400 when project name is more than 60 characters", async() => {
      const req = {
        body: {
          name: "a".repeat(61),
          description: "Test description",
        },
      } as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await createProject(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Project name cannot exceed 60 characters",
      });
    });

    test("creates a project successfully", async() => {
      const newProject = {
        id: 1,
        userId: 1,
        name: "TaskTracker",
        description: "Internship project",
      };

      mockedCreate.mockResolvedValue(newProject);
      const req = {
        body: {
          name: " TaskTracker ",
          description: " Internship project ",
        },
      } as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await createProject(req, res, next);
      expect(mockedCreate).toHaveBeenCalledWith({
        userId: 1,
        name: "TaskTracker",
        description: "Internship project",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Project created successfully",
        project: newProject,
      });
    });

    test("stores null when project description is empty", async() => {
      const newProject = {
        id: 1,
        userId: 1,
        name: "TaskTracker",
        description: null,
      };
      mockedCreate.mockResolvedValue(newProject);
      const req = {
        body: {
          name: "TaskTracker",
          description: "",
        },
      } as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await createProject(req, res, next);
      expect(mockedCreate).toHaveBeenCalledWith({
        userId: 1,
        name: "TaskTracker",
        description: null,
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("passes unexpected errors to next", async() => {
      const error = new Error("Database error");
      mockedCreate.mockRejectedValue(error);// fake database throws an error
      const req = {
        body: {
          name: "TaskTracker",
          description: "Test",
        },
      } as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await createProject(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });



  describe("updateProject", () => {
    test("returns 400 when project id is invalid", async() => {
      const req = {
        params: {
          projectId: "abc",
        },
        body: {
          name: "Updated Project",
        },
      } as unknown as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await updateProject(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid project ID",
      });
    });

    test("returns 404 when project does not exist", async() => {
      mockedFindOne.mockResolvedValue(null);// fake database did not find the project

      const req = {
        params: {
          projectId: "1",
        },
        body: {
          name: "Updated Project",
        },
      } as unknown as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await updateProject(req, res, next);
      expect(mockedFindOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: 1,
        },
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Project not found",
      });
    });

    test("returns 400 when updated project name is missing", async() => {
      const project = {
        update: jest.fn(),
      };
      mockedFindOne.mockResolvedValue(project);// fake database found the project
      const req = {
        params: {
          projectId: "1",
        },
        body: {
          name: "",
        },
      } as unknown as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await updateProject(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Project name is required",
      });
    });

    test("returns 400 when updated project name is more than 60 characters", async() => {
      const project = {
        update: jest.fn(),
      };
      mockedFindOne.mockResolvedValue(project);// fake database found the project

      const req = {
        params: {
          projectId: "1",
        },
        body: {
          name: "a".repeat(61),
        },
      } as unknown as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await updateProject(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Project name cannot exceed 60 characters",
      });
    });

    test("updates a project successfully", async() => {
      const project = {
        id: 1,
        userId: 1,
        name: "Old Name",
        description: "Old Description",
        update: jest.fn().mockResolvedValue(undefined),
      };
      mockedFindOne.mockResolvedValue(project);// fake database found the project
      const req = {
        params: {
          projectId: "1",
        },
        body: {
          name: " Updated Project ",
          description: " Updated Description ",
        },
      } as unknown as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await updateProject(req, res, next);
      expect(project.update).toHaveBeenCalledWith({
        name: "Updated Project",
        description: "Updated Description",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Project updated successfully",
        project: project,
      });
    });

    test("passes unexpected errors to next", async() => {
      const error = new Error("Database error");
      mockedFindOne.mockRejectedValue(error);// fake database throws an error
      const req = {
        params: {
          projectId: "1",
        },
        body: {
          name: "Updated Project",
        },
      } as unknown as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await updateProject(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });



  describe("deleteProject", () => {
    test("returns 400 when project id is invalid", async() => {
      const req = {
        params: {
          projectId: "abc",
        },
      } as unknown as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await deleteProject(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid project ID",
      });
    });

    test("returns 404 when project does not exist", async() => {
      mockedFindOne.mockResolvedValue(null);// fake database did not find the project
      const req = {
        params: {
          projectId: "1",
        },
      } as unknown as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await deleteProject(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Project not found",
      });
    });

    test("deletes a project successfully", async() => {
      const project = {
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      mockedFindOne.mockResolvedValue(project);// fake database found the project
      const req = {
        params: {
          projectId: "1",
        },
      } as unknown as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await deleteProject(req, res, next);
      expect(mockedFindOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: 1,
        },
      });
      expect(project.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Project deleted successfully",
      });
    });

    test("passes unexpected errors to next", async() => {
      const error = new Error("Database error");
      mockedFindOne.mockRejectedValue(error);// fake database throws an error
      const req = {
        params: {
          projectId: "1",
        },
      } as unknown as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;
      await deleteProject(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });