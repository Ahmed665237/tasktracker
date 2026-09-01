import {
  getTaskAuditHistory,
} from "../src/taskAuditController.js";
import Project from "../src/Project.js";
import Task from "../src/Task.js";
import TaskAudit from "../src/TaskAudit.js";
import type {
  Request,Response,NextFunction,
} from "express";

jest.mock("../src/Project.js");// prevents the test from using the real project database model
jest.mock("../src/Task.js");// prevents the test from using the real task database model
jest.mock("../src/TaskAudit.js");// prevents the test from using the real audit database model

const mockedProjectFindOne = Project.findOne as jest.Mock;// fake project lookup instead of postgres
const mockedTaskFindOne = Task.findOne as jest.Mock;// fake task lookup instead of postgres
const mockedAuditFindAll = TaskAudit.findAll as jest.Mock;// fake audit lookup instead of postgres

const createMockResponse = () => {
  const res = {
    locals: {
      userId: 1,
    },
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as Response;

  (res.status as jest.Mock).mockReturnValue(res);// allows res.status(...).json(...)
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();// makes every test independent from the previous test
});

describe("getTaskAuditHistory", () => {
  test("returns 400 when project id is invalid", async() => {
    const req = {
      params: {
        projectId: "abc",
        taskId: "1",
      },
    } as unknown as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;
    await getTaskAuditHistory(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid project or task ID",
    });
  });

  test("returns 400 when task id is invalid", async() => {
    const req = {
      params: {
        projectId: "1",
        taskId: "abc",
      },
    } as unknown as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;
    await getTaskAuditHistory(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid project or task ID",
    });
  });

  test("returns 404 when project does not exist", async() => {
    mockedProjectFindOne.mockResolvedValue(null);// fake database did not find the project
    const req = {
      params: {
        projectId: "1",
        taskId: "2",
      },
    } as unknown as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;
    await getTaskAuditHistory(req, res, next);
    expect(mockedProjectFindOne).toHaveBeenCalledWith({
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

  test("returns 404 when task does not exist", async() => {
    mockedProjectFindOne.mockResolvedValue({
      id: 1,
      userId: 1,
    });// fake database found the project
    mockedTaskFindOne.mockResolvedValue(null);// fake database did not find the task
    const req = {
      params: {
        projectId: "1",
        taskId: "2",
      },
    } as unknown as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;
    await getTaskAuditHistory(req, res, next);
    expect(mockedTaskFindOne).toHaveBeenCalledWith({
      where: {
        id: 2,
        projectId: 1,
      },
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Task not found",
    });
  });

  test("returns 200 with empty audit history when no audit records exist", async() => {
    mockedProjectFindOne.mockResolvedValue({
      id: 1,
      userId: 1,
    });// fake database found the project
    mockedTaskFindOne.mockResolvedValue({
      id: 2,
      projectId: 1,
    });// fake database found the task
    mockedAuditFindAll.mockResolvedValue([]);// fake database found no audit records
    const req = {
      params: {
        projectId: "1",
        taskId: "2",
      },
    } as unknown as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;
    await getTaskAuditHistory(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      auditHistory: [],
    });
  });

  test("returns 200 with audit history successfully", async() => {
    mockedProjectFindOne.mockResolvedValue({
      id: 1,
      userId: 1,
    });// fake database found the project
    mockedTaskFindOne.mockResolvedValue({
      id: 2,
      projectId: 1,
    });// fake database found the task
    const auditHistory = [
      {
        id: 2,
        taskId: 2,
        actorUserId: 1,
        actionType: "TASK_UPDATED",
        fieldName: "title",
        oldValue: "Old title",
        newValue: "New title",
        createdAt: new Date(),
      },
      {
        id: 1,
        taskId: 2,
        actorUserId: 1,
        actionType: "TASK_CREATED",
        fieldName: null,
        oldValue: null,
        newValue: null,
        createdAt: new Date(),
      },
    ];

    mockedAuditFindAll.mockResolvedValue(auditHistory);// fake database returns audit history
    const req = {
      params: {
        projectId: "1",
        taskId: "2",
      },
    } as unknown as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;
    await getTaskAuditHistory(req, res, next);
    expect(mockedAuditFindAll).toHaveBeenCalledWith({
      where: {
        taskId: 2,
      },
      order: [
        [
          "createdAt",
          "DESC",
        ],
      ],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      auditHistory: auditHistory,
    });
  });

  test("passes unexpected errors to next", async() => {
    const error = new Error("Database error");
    mockedProjectFindOne.mockRejectedValue(error);// fake database throws an error
    const req = {
      params: {
        projectId: "1",
        taskId: "2",
      },
    } as unknown as Request;
    const res = createMockResponse();
    const next = jest.fn() as NextFunction;
    await getTaskAuditHistory(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});