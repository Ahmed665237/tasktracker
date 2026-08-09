import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import ProjectModal from "./ProjectModal";
import TaskModal from "./TaskModal";

/*
  This describes the values Home sends
  into ProjectDashboard.
*/
interface ProjectDashboardProps {
  /*
    The logged-in user's name is displayed
    in the welcome heading.
  */
  currentUserName: string;
}

/*
  This describes the shape of one project object
  and what its properties are.
*/
interface Project {
  id: number;
  name: string;
  description: string;
}

/*
  These are the only task statuses allowed
  by the project requirements.
*/
type TaskStatus =
  | "To Do"
  | "In Progress"
  | "Done";

/*
  These are the only task priorities allowed
  by the project requirements.
*/
type TaskPriority =
  | "Low"
  | "Medium"
  | "High";

/*
  This describes the shape of one task object.

  projectId connects the task to one project.
*/
interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedMinutes: number | null;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

function ProjectDashboard({
  currentUserName,
}: ProjectDashboardProps) {
  /*
    Stores all projects temporarily in React.

    Later, this list will come from:
    GET /api/projects
  */
  const [projects, setProjects] = useState<Project[]>([]);

  /*
    Stores the ID of the project currently opened by the user.

    null means no project is currently selected.
  */
  const [selectedProjectId, setSelectedProjectId] =
    useState<number | null>(null);

  /*
    Controls whether the Create/Edit Project modal is visible.
  */
  const [showProjectModal, setShowProjectModal] =
    useState(false);

  /*
    Stores the project currently being edited.

    null means the form is creating a new project.

    A number means the form is editing that project ID.
  */
  const [editingProjectId, setEditingProjectId] =
    useState<number | null>(null);

  /*
    Stores the project name entered by the user.
  */
  const [projectName, setProjectName] = useState("");

  /*
    Stores the project description entered by the user.
  */
  const [projectDescription, setProjectDescription] =
    useState("");

  /*
    Stores an error belonging only to the project-name field.
  */
  const [projectNameError, setProjectNameError] =
    useState("");

  /*
    Stores the task-search value.

    It is not connected to real tasks yet.
  */
  const [searchText, setSearchText] = useState("");

  /*
    Stores the selected task status filter.

    It will be used after task data is added.
  */
  const [statusFilter, setStatusFilter] =
    useState("All");

  /*
    Stores the selected task priority filter.

    It will be used after task data is added.
  */
  const [priorityFilter, setPriorityFilter] =
    useState("All");

  /*
    Controls whether only overdue tasks should appear.

    It will be connected when task data is added.
  */
  const [showOverdueOnly, setShowOverdueOnly] =
    useState(false);


  /*
    Stores all tasks temporarily in React.

    Later, this list will come from the backend.
  */
  const [tasks, setTasks] = useState<Task[]>([]);

  /*
    Controls whether the Create/Edit Task modal is visible.
  */
  const [showTaskModal, setShowTaskModal] =
    useState(false);

  /*
    Stores the task currently being edited.

    null means the modal is creating a new task.
  */
  const [editingTaskId, setEditingTaskId] =
    useState<number | null>(null);

  /*
    Stores the task currently being viewed.

    null means no task details view is open.
  */
  const [viewingTaskId, setViewingTaskId] =
    useState<number | null>(null);

  /*
    Stores the task title written inside the modal.
  */
  const [taskTitle, setTaskTitle] = useState("");

  /*
    Stores the optional task description.
  */
  const [taskDescription, setTaskDescription] =
    useState("");

  /*
    Stores the selected task status.

    New tasks default to To Do.
  */
  const [taskStatus, setTaskStatus] =
    useState<TaskStatus>("To Do");

  /*
    Stores the selected task priority.

    New tasks default to Medium.
  */
  const [taskPriority, setTaskPriority] =
    useState<TaskPriority>("Medium");

  /*
    Stores estimated minutes as text while
    the user is typing inside the form.
  */
  const [estimatedMinutes, setEstimatedMinutes] =
    useState("");

  /*
    Stores the optional due date.
  */
  const [dueDate, setDueDate] = useState("");

  /*
    Stores the validation error for the required title.
  */
  const [taskTitleError, setTaskTitleError] =
    useState("");

  /*
    Allows the component to navigate between routes.
  */
  const navigate = useNavigate();

  /*
    Gives us information about the current browser URL.

    Example:
    /projects/new
  */
  const location = useLocation();

  /*
    Reads dynamic values from the current URL.

    Example:
    /projects/123/edit

    projectId will contain "123".
  */
  const { projectId, taskId } = useParams();

  /*
    Checks whether the current URL is specifically
    the Create Project URL.
  */
  const isCreateProjectRoute =
    location.pathname === "/projects/new";

  /*
    Checks whether the current URL is specifically
    a Project Edit URL.

    The tasks check prevents a future task-edit URL
    from being treated as a project-edit URL.
  */
  const isEditProjectRoute =
    location.pathname.startsWith("/projects/") &&
    location.pathname.endsWith("/edit") &&
    !location.pathname.includes("/tasks/");


  /*
    Checks whether the current URL is the
    Create Task URL.

    Example:
    /projects/5/tasks/new
  */
  const isCreateTaskRoute =
    location.pathname.includes("/tasks/new");

  /*
    Checks whether the current URL is the
    Edit Task URL.

    Example:
    /projects/5/tasks/10/edit
  */
  const isEditTaskRoute =
    location.pathname.includes("/tasks/") &&
    location.pathname.endsWith("/edit");

  /*
    Checks whether the current URL is the
    View Task URL.

    Example:
    /projects/5/tasks/10

    The checks exclude Create Task and Edit Task URLs.
  */
  const isViewTaskRoute =
    location.pathname.includes("/tasks/") &&
    !location.pathname.endsWith("/edit") &&
    !location.pathname.includes("/tasks/new");

  /*
    Finds the complete selected project object.

    Example:

    selectedProjectId = 5

    React searches the projects array for the project
    whose id is 5.
  */
  const selectedProject =
    projects.find(
      (project) => project.id === selectedProjectId
    ) || null;

  /*
    Finds tasks that belong only to the selected project.
  */
  const selectedProjectTasks = tasks.filter(
    (task) => task.projectId === selectedProjectId
  );

  /*
    Finds the complete task object currently being viewed.
  */
  const viewedTask =
    tasks.find(
      (task) => task.id === viewingTaskId
    ) || null;

  /*
    Applies the current search and filters together.

    Search checks both the title and description.
  */
  const filteredTasks = selectedProjectTasks.filter(
    (task) => {
      const normalizedSearch =
        searchText.trim().toLowerCase();

      const matchesSearch =
        normalizedSearch === "" ||
        task.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        task.description
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        task.priority === priorityFilter;

      /*
        A task is overdue only when:
        - it has a due date
        - the due date has passed
        - its status is not Done
      */
      const isOverdue =
        task.dueDate !== "" &&
        new Date(task.dueDate) <
          new Date(new Date().toDateString()) &&
        task.status !== "Done";

      const matchesOverdue =
        !showOverdueOnly || isOverdue;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesOverdue
      );
    }
  );

  /*
    Opens the Create Task modal for the selected project.

    The status argument comes from the column whose
    plus button the user clicked.
  */
  const openCreateTaskModal = (
    status: TaskStatus
  ) => {
    /*
      A task cannot be created without a selected project.
    */
    if (!selectedProject) {
      return;
    }

    /*
      Clears old task form values.
    */
    setTaskTitle("");
    setTaskDescription("");
    setTaskStatus(status);
    setTaskPriority("Medium");
    setEstimatedMinutes("");
    setDueDate("");
    setTaskTitleError("");
    setEditingTaskId(null);

    /*
      Gives the popup its own URL while keeping
      the dashboard visible behind it.
    */
    navigate(
      `/projects/${selectedProject.id}/tasks/new`
    );
  };

  /*
    Opens a task in read-only view mode.

    The URL contains both the project ID
    and the task ID.
  */
  const openTaskView = (task: Task) => {
    navigate(
      `/projects/${task.projectId}/tasks/${task.id}`
    );
  };

  /*
    Closes the read-only task view and returns
    to the selected project's board.
  */
  const closeTaskView = () => {
    setViewingTaskId(null);

    if (selectedProjectId !== null) {
      navigate(
        `/projects/${selectedProjectId}`
      );
    } else {
      navigate("/home");
    }
  };

  /*
    Opens the currently viewed task in edit mode.
  */
  const openViewedTaskEdit = () => {
    if (!viewedTask) {
      return;
    }

    navigate(
      `/projects/${viewedTask.projectId}/tasks/${viewedTask.id}/edit`
    );
  };

  /*
    Closes the task modal and returns
    to the selected project's board.
  */
  const closeTaskModal = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskStatus("To Do");
    setTaskPriority("Medium");
    setEstimatedMinutes("");
    setDueDate("");
    setTaskTitleError("");
    setEditingTaskId(null);

    if (selectedProjectId !== null) {
      navigate(
        `/projects/${selectedProjectId}`
      );
    } else {
      navigate("/home");
    }
  };

  /*
    Creates a new task or updates an existing task.

    TaskModal calls this function directly when
    Create Task / Save Changes is clicked.
  */
  const handleTaskSubmit = async () => {
    setTaskTitleError("");

    /*
      Title is required.
    */
    if (taskTitle.trim() === "") {
      setTaskTitleError(
        "Task title is required"
      );

      return;
    }

    /*
      A task cannot be created or edited
      without a selected project ID.
    */
    if (selectedProjectId === null) {
      return;
    }

    /*
      Saves the selected project ID in a normal
      number variable.
    */
    const currentProjectId =
      selectedProjectId;

    /*
      Converts the estimate from text into minutes.

      Empty means no estimate.
    */
    const parsedEstimate =
      estimatedMinutes.trim() === ""
        ? null
        : Number(estimatedMinutes);

    /*
      EDIT TASK

      Sends the updated task to the backend
      so the changes remain after refresh/logout.
    */
    if (editingTaskId !== null) {
      /*
        Gets the JWT token saved
        when the user logged in.
      */
      const token =
        localStorage.getItem("token");

      if (!token) {
        console.error(
          "Authentication token is missing"
        );

        return;
      }

      try {
        /*
          Updates the existing task
          in PostgreSQL.
        */
        const response = await fetch(
          `http://localhost:3000/api/projects/${currentProjectId}/tasks/${editingTaskId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              title:
                taskTitle.trim(),

              description:
                taskDescription.trim(),

              status:
                taskStatus,

              priority:
                taskPriority,

              estimatedMinutes:
                parsedEstimate,

              dueDate:
                dueDate || null,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          console.error(
            "Unable to update task:",
            data
          );

          return;
        }

        /*
          Replaces the old React task with
          the updated task returned by the backend.
        */
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === editingTaskId
              ? {
                  id:
                    data.task.id,

                  projectId:
                    data.task.projectId,

                  title:
                    data.task.title,

                  description:
                    data.task.description ?? "",

                  status:
                    data.task.status,

                  priority:
                    data.task.priority,

                  estimatedMinutes:
                    data.task.estimatedMinutes,

                  dueDate:
                    data.task.dueDate ?? "",

                  createdAt:
                    data.task.createdAt,

                  updatedAt:
                    data.task.updatedAt,
                }
              : task
          )
        );

        /*
          Returns to the selected project board
          after the database update succeeds.
        */
        closeTaskModal();

        return;
      } catch (error) {
        console.error(
          "Error updating task:",
          error
        );

        return;
      }
    }

    /*
      CREATE TASK

      Gets the JWT token saved
      when the user logged in.
    */
    const token =
      localStorage.getItem("token");

    if (!token) {
      console.error(
        "Authentication token is missing"
      );

      return;
    }

    try {
      /*
        Sends the new task to the backend.

        PostgreSQL creates the real task ID.
      */
      const response = await fetch(
        `http://localhost:3000/api/projects/${currentProjectId}/tasks`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            title:
              taskTitle.trim(),

            description:
              taskDescription.trim(),

            status:
              taskStatus,

            priority:
              taskPriority,

            estimatedMinutes:
              parsedEstimate,

            dueDate:
              dueDate || null,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          "Unable to create task:",
          data
        );

        return;
      }

      /*
        Uses the exact task returned by the backend.

        The ID is the PostgreSQL-generated ID,
        just like project creation uses data.project.id.
      */
      const newTask: Task = {
        id:
          data.task.id,

        projectId:
          data.task.projectId,

        title:
          data.task.title,

        description:
          data.task.description ?? "",

        status:
          data.task.status,

        priority:
          data.task.priority,

        estimatedMinutes:
          data.task.estimatedMinutes,

        dueDate:
          data.task.dueDate ?? "",

        createdAt:
          data.task.createdAt,

        updatedAt:
          data.task.updatedAt,
      };

      setTasks((currentTasks) => [
        ...currentTasks,
        newTask,
      ]);

      /*
        The task is now in React state with its
        real database ID. Clicking the card uses:
        /projects/:projectId/tasks/:taskId
      */
      closeTaskModal();
    } catch (error) {
      console.error(
        "Error creating task:",
        error
      );
    }
  };

 /*
  Soft deletes the task currently being edited.

  The frontend calls:
  DELETE /api/projects/:projectId/tasks/:taskId
*/
const handleDeleteTask = async () => {
  /*
    Stops if no task is currently being edited.
  */
  if (
    editingTaskId === null ||
    selectedProjectId === null
  ) {
    return;
  }

  /*
    Asks the user to confirm before deleting
    the task from the active dashboard.
  */
  const confirmed = window.confirm(
    "Are you sure you want to delete this task?"
  );

  /*
    Cancel keeps the task unchanged.
  */
  if (!confirmed) {
    return;
  }

  /*
    Gets the JWT token saved
    when the user logged in.
  */
  const token =
    localStorage.getItem("token");

  if (!token) {
    console.error(
      "Authentication token is missing"
    );

    return;
  }

  try {
    /*
      Tells the backend to soft delete
      the selected task.
    */
    const response = await fetch(
      `http://localhost:3000/api/projects/${selectedProjectId}/tasks/${editingTaskId}`,
      {
        method: "DELETE",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    const data =
      await response.json();

    /*
      Stops if the backend could not
      delete the task.
    */
    if (!response.ok) {
      console.error(
        "Unable to delete task:",
        data
      );

      return;
    }

    /*
      Removes the soft-deleted task
      from the current React screen.
    */
    setTasks((currentTasks) =>
      currentTasks.filter(
        (task) =>
          task.id !== editingTaskId
      )
    );

    /*
      Returns to the selected
      project's board.
    */
    closeTaskModal();
  } catch (error) {
    console.error(
      "Error deleting task:",
      error
    );
  }
};

  /*
    Opens the Create Project modal.
  */
  const openCreateProjectModal = () => {
    /*
      Clears old form values.
    */
    setProjectName("");
    setProjectDescription("");

    /*
      null means we are creating a new project.
    */
    setEditingProjectId(null);

    /*
      Clears old validation errors.
    */
    setProjectNameError("");

    /*
      Because App.tsx renders Home for /projects/new,
      the dashboard stays visible behind the modal.
    */
    navigate("/projects/new");
  };

  /*
    Opens the Edit Project modal.

    The URL effect below loads the selected project's
    existing values into the reusable modal.
  */
  const openEditProjectModal = () => {
    /*
      Stops if no project is selected.
    */
    if (!selectedProject) {
      return;
    }

    /*
      Changes the URL to include the selected project ID.
    */
    navigate(`/projects/${selectedProject.id}/edit`);
  };

  /*
    Soft deletes the currently selected project.

    The frontend calls:
    DELETE /api/projects/:projectId

    Because the backend Project model uses
    paranoid: true, the project row stays
    in PostgreSQL and deleted_at is filled in.
  */
  const handleDeleteProject = async () => {
    /*
      Stops if no project is selected.
    */
    if (!selectedProject) {
      return;
    }

    /*
      Asks the user to confirm before deleting
      the project from the active dashboard.
    */
    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedProject.name}"?`
    );

    /*
      Cancel keeps the project unchanged.
    */
    if (!confirmed) {
      return;
    }

    /*
      Gets the JWT token saved
      when the user logged in.
    */
    const token =
      localStorage.getItem("token");

    if (!token) {
      console.error(
        "Authentication token is missing"
      );

      return;
    }

    try {
      /*
        Tells the backend to soft delete
        the selected project.
      */
      const response = await fetch(
        `http://localhost:3000/api/projects/${selectedProject.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      /*
        Stops if the backend could not
        delete the project.
      */
      if (!response.ok) {
        console.error(
          "Unable to delete project:",
          data
        );

        return;
      }

      /*
        Removes the deleted project from
        the current React project list.
      */
      setProjects((currentProjects) =>
        currentProjects.filter(
          (project) =>
            project.id !== selectedProject.id
        )
      );

      /*
        Removes that project's tasks from
        the current React screen.
      */
      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) =>
            task.projectId !== selectedProject.id
        )
      );

      /*
        No deleted project should remain selected.
      */
      setSelectedProjectId(null);

      /*
        Returns to the normal dashboard URL.
      */
      navigate("/home");
    } catch (error) {
      console.error(
        "Error deleting project:",
        error
      );
    }
  };

  /*
    Closes the project modal.
  */
  const closeProjectModal = () => {
    /*
      Saves whether this modal was editing
      before clearing the edit state.
    */
    const wasEditing =
      editingProjectId !== null;

    /*
      Clears the project form.
    */
    setProjectName("");
    setProjectDescription("");
    setEditingProjectId(null);
    setProjectNameError("");

    /*
      When editing, return to the same project board.
      When cancelling Create Project, return to /home.
    */
    if (
      wasEditing &&
      selectedProjectId !== null
    ) {
      navigate(
        `/projects/${selectedProjectId}`
      );
    } else {
      navigate("/home");
    }
  };

  /*
    Creates a new project or updates an existing project.
  */
  const handleProjectSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    /*
      Removes any old validation error.
    */
    setProjectNameError("");

    /*
      Prevents creating a project without a name.
    */
    if (projectName.trim() === "") {
      setProjectNameError(
        "Project name is required"
      );

      return;
    }

    /*
      Edit Project is still using React state for now.

      Later, this will call:
      PUT /api/projects/:projectId
    */
    if (editingProjectId !== null) {
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === editingProjectId
            ? {
                ...project,
                name:
                  projectName.trim(),
                description:
                  projectDescription.trim(),
              }
            : project
        )
      );
    } else {
      /*
        Gets the JWT token saved when
        the user logged in.
      */
      const token =
        localStorage.getItem("token");

      /*
        A project cannot be created through
        the protected backend endpoint
        without a login token.
      */
      if (!token) {
        console.error(
          "Authentication token is missing"
        );

        return;
      }

      try {
        /*
          Sends the project information
          to the backend.

          POST means we are creating
          a new project.
        */
        const response = await fetch(
          "http://localhost:3000/api/projects",
          {
            method: "POST",

            headers: {
              /*
                Tells Express that the body
                contains JSON.
              */
              "Content-Type":
                "application/json",

              /*
                Sends the JWT so authenticateToken
                can identify the logged-in user.
              */
              Authorization:
                `Bearer ${token}`,
            },

            /*
              Converts the JavaScript values
              into JSON for the HTTP request.
            */
            body: JSON.stringify({
              name:
                projectName.trim(),

              description:
                projectDescription.trim(),
            }),
          }
        );

        /*
          Reads the JSON response sent
          back by the backend.
        */
        const data =
          await response.json();

        /*
          Stops if the backend returned
          an error response.
        */
        if (!response.ok) {
          console.error(
            "Unable to create project:",
            data
          );

          return;
        }

        /*
          Creates the frontend Project object
          using the project returned by PostgreSQL.

          The ID comes from the database.
        */
        const newProject: Project = {
          id:
            data.project.id,

          name:
            data.project.name,

          description:
            data.project.description ?? "",
        };

        /*
          Adds the backend-created project
          into React state.
        */
        setProjects((currentProjects) => [
          ...currentProjects,
          newProject,
        ]);

        /*
          Automatically selects the new project
          using its real database ID.
        */
        setSelectedProjectId(
          newProject.id
        );

        /*
          Opens the new project's permanent URL.

          Refreshing this URL keeps the same
          project selected.
        */
        navigate(
          `/projects/${newProject.id}`
        );

        /*
          Clears and closes the project modal
          without navigating back to /home.
        */
        setProjectName("");
        setProjectDescription("");
        setEditingProjectId(null);
        setProjectNameError("");

        return;
      } catch (error) {
        console.error(
          "Error creating project:",
          error
        );

        return;
      }
    }

    /*
      Closes the project modal after
      a successful create or update.
    */
    closeProjectModal();
  };

  /*
    Opens and prepares the project modal depending
    on the current browser URL.
  */
  useEffect(() => {
    /*
      If the URL is /projects/new,
      open the modal in create mode.
    */
    if (isCreateProjectRoute) {
      setProjectName("");
      setProjectDescription("");
      setEditingProjectId(null);
      setProjectNameError("");
      setShowProjectModal(true);

      return;
    }

    /*
      If the URL is /projects/:projectId/edit,
      find that project and open the modal in edit mode.
    */
    if (isEditProjectRoute && projectId) {
      const numericProjectId = Number(projectId);

      /*
        Finds the project whose ID matches
        the projectId inside the URL.
      */
      const projectToEdit = projects.find(
        (project) =>
          project.id === numericProjectId
      );

      /*
        Loads the existing project data
        into the edit form.
      */
      if (projectToEdit) {
        setProjectName(projectToEdit.name);

        setProjectDescription(
          projectToEdit.description
        );

        setEditingProjectId(
          projectToEdit.id
        );

        setProjectNameError("");
        setShowProjectModal(true);
      }

      return;
    }

    /*
      If the URL is not a project modal route,
      hide the modal.
    */
    setShowProjectModal(false);
  }, [
    isCreateProjectRoute,
    isEditProjectRoute,
    projectId,
    projects,
  ]);


  /*
    Loads all projects belonging to
    the logged-in user from the backend.
  */
  useEffect(() => {
    /*
      Gets the JWT token saved
      when the user logged in.
    */
    const token =
      localStorage.getItem("token");

    /*
      If there is no token, the user is
      not currently logged in.
    */
    if (!token) {
      return;
    }

    /*
      Loads the logged-in user's projects
      from PostgreSQL through the backend.
    */
    const loadProjects = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/projects",
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          console.error(
            "Unable to load projects:",
            data
          );

          return;
        }

        /*
          Replaces the empty React project list
          with the projects returned by PostgreSQL.
        */
        setProjects(
          data.projects
        );
      } catch (error) {
        console.error(
          "Error loading projects:",
          error
        );
      }
    };

    loadProjects();
  }, []);

  /*
    Keeps the selected project synchronized
    with the project ID inside the URL.

    This works for:
    /projects/10
    /projects/10/edit
    /projects/10/tasks/new
    /projects/10/tasks/5
    /projects/10/tasks/5/edit
  */
  useEffect(() => {
    if (!projectId) {
      return;
    }

    const numericProjectId =
      Number(projectId);

    if (!Number.isNaN(numericProjectId)) {
      setSelectedProjectId(
        numericProjectId
      );
    }
  }, [
    projectId,
  ]);
      
  /*
    Loads all tasks for the currently
    selected project from the backend.
  */
  useEffect(() => {
    /*
      If no project is selected,
      clear the task list.
    */
    if (selectedProjectId === null) {
      setTasks([]);
      return;
    }

    /*
      Gets the JWT token saved
      when the user logged in.
    */
    const token =
      localStorage.getItem("token");

    if (!token) {
      console.error(
        "Authentication token is missing"
      );

      return;
    }

    /*
      Loads tasks from the backend.
    */
    const loadTasks = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/projects/${selectedProjectId}/tasks`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          console.error(
            "Unable to load tasks:",
            data
          );

          return;
        }

        /*
          Replaces the React task list
          with the tasks returned by PostgreSQL.
        */
        setTasks(
          data.tasks
        );
      } catch (error) {
        console.error(
          "Error loading tasks:",
          error
        );
      }
    };

    loadTasks();
  }, [selectedProjectId]);

  

  /*
    Opens and prepares the task modal depending
    on the current browser URL.
  */
  useEffect(() => {
    /*
      Create Task route:
      /projects/:projectId/tasks/new
    */
    if (isCreateTaskRoute && projectId) {
      const numericProjectId = Number(projectId);

      /*
        Keeps the project from the URL selected.
      */
      setSelectedProjectId(numericProjectId);
      setViewingTaskId(null);
      setEditingTaskId(null);
      setShowTaskModal(true);

      return;
    }

    /*
      View Task route:
      /projects/:projectId/tasks/:taskId
    */
    if (
      isViewTaskRoute &&
      projectId &&
      taskId
    ) {
      const numericProjectId = Number(projectId);
      const numericTaskId = Number(taskId);

      const taskToView = tasks.find(
        (task) =>
          task.id === numericTaskId &&
          task.projectId === numericProjectId
      );

      if (taskToView) {
        setSelectedProjectId(
          taskToView.projectId
        );
        setViewingTaskId(taskToView.id);
        setShowTaskModal(false);
      }

      return;
    }

    /*
      Edit Task route:
      /projects/:projectId/tasks/:taskId/edit
    */
    if (
      isEditTaskRoute &&
      projectId &&
      taskId
    ) {
      const numericProjectId = Number(projectId);
      const numericTaskId = Number(taskId);

      const taskToEdit = tasks.find(
        (task) =>
          task.id === numericTaskId &&
          task.projectId === numericProjectId
      );

      if (taskToEdit) {
        setSelectedProjectId(
          taskToEdit.projectId
        );
        setViewingTaskId(null);
        setTaskTitle(taskToEdit.title);
        setTaskDescription(
          taskToEdit.description
        );
        setTaskStatus(taskToEdit.status);
        setTaskPriority(taskToEdit.priority);
        setEstimatedMinutes(
          taskToEdit.estimatedMinutes === null
            ? ""
            : String(
                taskToEdit.estimatedMinutes
              )
        );
        setDueDate(taskToEdit.dueDate);
        setTaskTitleError("");
        setEditingTaskId(taskToEdit.id);
        setShowTaskModal(true);
      }

      return;
    }

    /*
      Any other route hides the task modal
      and the read-only task view.
    */
    setShowTaskModal(false);
    setViewingTaskId(null);
  }, [
    isCreateTaskRoute,
    isViewTaskRoute,
    isEditTaskRoute,
    projectId,
    taskId,
    tasks,
  ]);
  

  return (
    <>
      <style>
        {`
          /*
            Controls the maximum width and spacing
            of the dashboard content.
          */
          .home-content {
            width: 100%;
            max-width: 1500px;
            margin: 0 auto;
            padding: 34px 32px 50px;
          }

          /*
            Contains the welcome text and Create Project button.
          */
          .welcome-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
            margin-bottom: 28px;
          }

          .welcome-title {
            margin: 0 0 6px;
            font-size: 32px;
            font-weight: 750;
            color: #0f172a;
          }

          .welcome-subtitle {
            margin: 0;
            color: #64748b;
            font-size: 16px;
          }

          .create-project-button {
            min-height: 48px;
            border: none;
            border-radius: 12px;
            padding: 0 20px;
            background:
              linear-gradient(
                135deg,
                #0f9b9b,
                #087f8c
              );
            color: white;
            font-weight: 650;
            display: flex;
            align-items: center;
            gap: 9px;
            box-shadow:
              0 10px 22px
              rgba(8, 127, 140, 0.2);
          }

          .create-project-button:hover {
            background:
              linear-gradient(
                135deg,
                #0d8b8b,
                #066f7a
              );
          }

          .project-section {
            background:
              rgba(255, 255, 255, 0.95);
            border:
              1px solid #e2e8f0;
            border-radius: 20px;
            padding: 24px;
            box-shadow:
              0 18px 40px
              rgba(15, 23, 42, 0.06);
          }

          .project-heading-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 22px;
          }

          .project-title {
            margin: 0 0 5px;
            font-size: 25px;
            font-weight: 700;
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          .project-description {
            margin: 0;
            color: #64748b;
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          .project-actions {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .project-selector {
            min-width: 220px;
            min-height: 44px;
            border:
              1px solid #d8e1ea;
            border-radius: 11px;
            background: white;
            padding: 0 13px;
            color: #334155;
          }

          .edit-project-button {
            min-height: 44px;
            border:
              1px solid #0f9b9b;
            border-radius: 11px;
            background: white;
            color: #087f8c;
            padding: 0 15px;
            font-weight: 600;
          }

          .edit-project-button:hover {
            background: #ecfeff;
          }

          /*
            Styles the Delete Project button.
          */
          .delete-project-button {
            min-height: 44px;
            border:
              1px solid #dc3545;
            border-radius: 11px;
            background: white;
            color: #dc3545;
            padding: 0 15px;
            font-weight: 600;
          }

          .delete-project-button:hover {
            background: #fff5f5;
          }

          .edit-project-button:disabled,
          .delete-project-button:disabled,
          .project-selector:disabled {
            cursor: not-allowed;
            opacity: 0.55;
          }

          .no-projects-state {
            min-height: 420px;
            border:
              2px dashed #d8e1ea;
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: #64748b;
            padding: 30px;
          }

          .no-projects-icon {
            width: 65px;
            height: 65px;
            border-radius: 18px;
            background: #eaf7f7;
            color: #0f9b9b;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 17px;
          }

          .no-projects-title {
            margin: 0 0 7px;
            color: #334155;
            font-size: 21px;
            font-weight: 700;
          }

          .task-filters {
            display: grid;
            grid-template-columns:
              minmax(260px, 1fr)
              180px
              180px
              150px;
            gap: 14px;
            margin-bottom: 22px;
          }

          .search-container {
            position: relative;
          }

          .search-icon {
            position: absolute;
            left: 15px;
            top: 50%;
            transform:
              translateY(-50%);
            color: #64748b;
            pointer-events: none;
          }

          .task-search-input {
            width: 100%;
            min-height: 46px;
            border:
              1px solid #d8e1ea;
            border-radius: 11px;
            padding-left: 46px;
            padding-right: 14px;
            font-size: 15px;
          }

          .task-filter-select {
            min-height: 46px;
            border:
              1px solid #d8e1ea;
            border-radius: 11px;
            background: white;
            padding: 0 13px;
            color: #334155;
          }

          .task-search-input:focus,
          .task-filter-select:focus,
          .project-selector:focus,
          .project-form-input:focus,
          .project-form-textarea:focus {
            border-color: #0f9b9b;
            box-shadow:
              0 0 0 4px
              rgba(15, 155, 155, 0.11);
            outline: none;
          }

          .overdue-control {
            min-height: 46px;
            border:
              1px solid #d8e1ea;
            border-radius: 11px;
            background: white;
            padding: 0 13px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            color: #334155;
          }

          /*
            Places one Create Task button above
            the complete three-column board.
          */
          .board-toolbar {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 14px;
          }

          /*
            Styles the single Create Task button.
          */
          .create-task-button {
            min-height: 42px;
            border: none;
            border-radius: 11px;
            padding: 0 16px;
            background:
              linear-gradient(
                135deg,
                #0f9b9b,
                #087f8c
              );
            color: white;
            font-weight: 650;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .create-task-button:hover {
            background:
              linear-gradient(
                135deg,
                #0d8b8b,
                #066f7a
              );
          }

          .board-grid {
            display: grid;
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
            gap: 18px;
          }

          .task-column {
            min-height: 420px;
            border:
              1px solid #e2e8f0;
            border-radius: 16px;
            padding: 16px;
            background: #f8fafc;
          }

          .task-column-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 13px;
            margin-bottom: 14px;
            border-bottom:
              3px solid #cbd5e1;
          }

          .task-column.todo
          .task-column-header {
            border-color: #0f9b9b;
          }

          .task-column.in-progress
          .task-column-header {
            border-color: #f59e0b;
          }

          .task-column.done
          .task-column-header {
            border-color: #22c55e;
          }

          .task-column-title-wrapper {
            display: flex;
            align-items: center;
            gap: 9px;
          }

          .task-column-title {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
          }

          .task-count {
            min-width: 26px;
            height: 26px;
            border-radius: 999px;
            background: #e2e8f0;
            color: #475569;
            font-size: 13px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .column-add-button {
            width: 34px;
            height: 34px;
            border: none;
            border-radius: 9px;
            background: transparent;
            color: #475569;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .column-add-button:hover {
            background: #e9f8f8;
            color: #087f8c;
          }

          .empty-column {
            min-height: 320px;
            border:
              2px dashed #d8e1ea;
            border-radius: 13px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 24px;
            color: #64748b;
          }

          .empty-column-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 13px;
            border-radius: 13px;
            background: #eaf7f7;
            color: #0f9b9b;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .empty-column-title {
            margin: 0 0 5px;
            font-size: 16px;
            font-weight: 650;
            color: #334155;
          }

          .empty-column-text {
            margin: 0;
            font-size: 14px;
          }

          .project-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 100;
            background:
              rgba(15, 23, 42, 0.48);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 22px;
          }

          .project-modal {
            width: 100%;
            max-width: 570px;
            background: white;
            border-radius: 20px;
            box-shadow:
              0 30px 80px
              rgba(15, 23, 42, 0.25);
            padding: 28px;
          }

          .project-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 24px;
          }

          .project-modal-title {
            margin: 0 0 6px;
            font-size: 25px;
            font-weight: 700;
          }

          .project-modal-subtitle {
            margin: 0;
            color: #64748b;
          }

          .project-modal-close {
            width: 38px;
            height: 38px;
            border: none;
            border-radius: 10px;
            background: transparent;
            color: #475569;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .project-modal-close:hover {
            background: #f1f5f9;
          }

          .project-form-label {
            display: block;
            margin-bottom: 8px;
            color: #0f172a;
            font-weight: 600;
          }

          .project-form-input {
            width: 100%;
            min-height: 50px;
            border:
              1px solid #cbd5e1;
            border-radius: 11px;
            padding: 0 14px;
          }

          .project-form-textarea {
            width: 100%;
            min-height: 120px;
            border:
              1px solid #cbd5e1;
            border-radius: 11px;
            padding: 13px 14px;
            resize: vertical;
          }

          .project-form-input.project-input-error {
            border-color: #dc3545;
            background: #fff8f8;
          }

          .project-field-error {
            margin: 7px 0 0;
            color: #dc3545;
            font-size: 14px;
          }

          .project-modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 11px;
            margin-top: 25px;
          }

          .project-cancel-button {
            min-height: 45px;
            border:
              1px solid #cbd5e1;
            border-radius: 11px;
            background: white;
            color: #334155;
            padding: 0 18px;
            font-weight: 600;
          }

          .project-save-button {
            min-height: 45px;
            border: none;
            border-radius: 11px;
            background:
              linear-gradient(
                135deg,
                #0f9b9b,
                #087f8c
              );
            color: white;
            padding: 0 20px;
            font-weight: 650;
          }


          /*
            Styles one task card.
          */
          .task-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 13px;
            padding: 15px;
            margin-bottom: 12px;
            box-shadow:
              0 8px 20px
              rgba(15, 23, 42, 0.05);
            cursor: pointer;
          }

          /*
            Gives visual feedback that a task card
            can be clicked to view the task.
          */
          .task-card:hover {
            border-color: #0f9b9b;
            box-shadow:
              0 10px 24px
              rgba(15, 155, 155, 0.12);
          }

          .task-card:focus {
            outline: none;
            border-color: #0f9b9b;
            box-shadow:
              0 0 0 4px
              rgba(15, 155, 155, 0.11);
          }

          .task-card-title {
            margin: 0 0 7px;
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          .task-card-description {
            margin: 0 0 12px;
            font-size: 14px;
            color: #64748b;
            overflow-wrap: anywhere;
            word-break: break-word;
            white-space: normal;
          }

          .task-card-details {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            font-size: 12px;
          }

          .task-card-badge {
            background: #f1f5f9;
            border-radius: 999px;
            padding: 5px 9px;
            color: #475569;
          }

          /*
            Styles the read-only task details popup.
          */
          .task-view-backdrop {
            position: fixed;
            inset: 0;
            z-index: 109;
            background:
              rgba(15, 23, 42, 0.48);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 22px;
          }

          .task-view {
            width: 100%;
            max-width: 680px;
            max-height: 90vh;
            overflow-y: auto;
            background: white;
            border-radius: 20px;
            box-shadow:
              0 30px 80px
              rgba(15, 23, 42, 0.25);
            padding: 28px;
          }

          .task-view-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 22px;
          }

          .task-view-title {
            margin: 0;
            font-size: 25px;
            font-weight: 700;
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          .task-view-description {
            margin: 0 0 20px;
            color: #64748b;
            overflow-wrap: anywhere;
            word-break: break-word;
            white-space: pre-wrap;
          }

          .task-view-details {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 24px;
          }

          .task-view-actions {
            display: flex;
            justify-content: flex-end;
            gap: 11px;
          }

          .task-view-edit-button {
            min-height: 45px;
            border: none;
            border-radius: 11px;
            background:
              linear-gradient(
                135deg,
                #0f9b9b,
                #087f8c
              );
            color: white;
            padding: 0 20px;
            font-weight: 650;
          }

          /*
            TaskModal uses these classes.
          */
          .task-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 110;
            background:
              rgba(15, 23, 42, 0.48);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 22px;
          }

          .task-modal {
            width: 100%;
            max-width: 680px;
            max-height: 90vh;
            overflow-y: auto;
            background: white;
            border-radius: 20px;
            box-shadow:
              0 30px 80px
              rgba(15, 23, 42, 0.25);
            padding: 28px;
          }

          .task-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 24px;
          }

          .task-modal-title {
            margin: 0 0 6px;
            font-size: 25px;
            font-weight: 700;
          }

          .task-modal-subtitle {
            margin: 0;
            color: #64748b;
          }

          .task-modal-close {
            width: 38px;
            height: 38px;
            border: none;
            border-radius: 10px;
            background: transparent;
            color: #475569;
          }

          .task-form-group {
            width: 100%;
            margin-bottom: 18px;
          }

          .task-form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .task-form-label {
            display: block;
            margin-bottom: 8px;
            color: #0f172a;
            font-weight: 600;
          }

          .task-form-input,
          .task-form-textarea,
          .task-form-select {
            width: 100%;
            border: 1px solid #cbd5e1;
            border-radius: 11px;
            padding: 0 14px;
          }

          .task-form-input,
          .task-form-select {
            min-height: 48px;
          }

          .task-form-textarea {
            min-height: 110px;
            padding-top: 12px;
            resize: vertical;
          }

          .task-input-error {
            border-color: #dc3545;
            background: #fff8f8;
          }

          .task-field-error {
            margin: 7px 0 0;
            color: #dc3545;
            font-size: 14px;
          }

          .task-modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 11px;
            margin-top: 8px;
          }

          .task-cancel-button,
          .task-save-button {
            min-height: 45px;
            border-radius: 11px;
            padding: 0 18px;
            font-weight: 600;
          }

          .task-cancel-button {
            border: 1px solid #cbd5e1;
            background: white;
            color: #334155;
          }

          .task-save-button {
            border: none;
            background:
              linear-gradient(
                135deg,
                #0f9b9b,
                #087f8c
              );
            color: white;
          }

          @media (max-width: 1050px) {
            .task-filters {
              grid-template-columns:
                1fr 1fr;
            }

            .board-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 700px) {
            .home-content {
              padding: 24px 16px 35px;
            }

            .welcome-section {
              flex-direction: column;
            }

            .create-project-button {
              width: 100%;
              justify-content: center;
            }

            .project-heading-row {
              flex-direction: column;
            }

            .project-actions {
              width: 100%;
              flex-direction: column;
              align-items: stretch;
            }

            .project-selector,
            .edit-project-button,
            .delete-project-button {
              width: 100%;
            }

            .task-filters {
              grid-template-columns: 1fr;
            }

            .project-section {
              padding: 18px;
            }

            .project-modal {
              padding: 22px;
            }

            .project-modal-actions {
              flex-direction: column-reverse;
            }

            .project-cancel-button,
            .project-save-button {
              width: 100%;
            }

            .task-form-row {
              grid-template-columns: 1fr;
            }

            .task-modal-actions {
              flex-direction: column-reverse;
            }

            .task-cancel-button,
            .task-save-button {
              width: 100%;
            }
          }
        `}
      </style>

      <main className="home-content">
        {/* Welcome area */}
        <section className="welcome-section">
          <div>
            <h2 className="welcome-title">
              Welcome back, {currentUserName}
            </h2>

            <p className="welcome-subtitle">
              Organize your personal projects and tasks.
            </p>
          </div>

          {/* Opens the Create Project modal */}
          <button
            type="button"
            className="create-project-button"
            onClick={openCreateProjectModal}
          >
            +
            Create Project
          </button>
        </section>

        {/* Main project-board section */}
        <section className="project-section">
          {projects.length === 0 ? (
            /*
              This appears before the user creates
              their first project.
            */
            <div className="no-projects-state">
              <div className="no-projects-icon">
                +
              </div>

              <h3 className="no-projects-title">
                No projects yet
              </h3>

              <p>
                Create your first project to start
                organizing tasks.
              </p>

              <button
                type="button"
                className="create-project-button mt-2"
                onClick={openCreateProjectModal}
              >
                Create Project
              </button>
            </div>
          ) : (
            <>
              {/* Selected project information */}
              <div className="project-heading-row">
                <div>
                  <h3 className="project-title">
                    {selectedProject
                      ? selectedProject.name
                      : "Select a project"}
                  </h3>

                  <p className="project-description">
                    {selectedProject
                      ? selectedProject.description
                        ? selectedProject.description.length > 200
                          ? selectedProject.description.slice(0, 200) + "..."
                          : selectedProject.description
                        : "No project description provided."
                      : "Choose a project to view its task board."}
                  </p>
                </div>

                {/* Project selection and editing */}
                <div className="project-actions">
                  <select
                    className="project-selector"
                    value={selectedProjectId ?? ""}
                    onChange={(event) => {
                      const value =
                        event.target.value;

                     const numericProjectId =
                        value
                          ? Number(value)
                          : null;

                      setSelectedProjectId(
                        numericProjectId
                      );

                      if (numericProjectId !== null) {
                        navigate(
                          `/projects/${numericProjectId}`
                        );
                      } else {
                        navigate("/home");
                      }
                    }}
                    aria-label="Select project"
                  >
                    <option value="">
                      Select project
                    </option>

                    {projects.map((project) => (
                      <option
                        key={project.id}
                        value={project.id}
                      >
                        {project.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="edit-project-button"
                    onClick={openEditProjectModal}
                    disabled={!selectedProject}
                  >
                    Edit Project
                  </button>

                </div>
              </div>

              {selectedProject ? (
                <>
                  {/* Task search and filters */}
                  <div className="task-filters">
                    <div className="search-container">
                      <span className="search-icon">
                        🔍
                      </span>

                      <input
                        type="text"
                        className="task-search-input"
                        value={searchText}
                        onChange={(event) =>
                          setSearchText(
                            event.target.value
                          )
                        }
                        placeholder="Search tasks by title or description"
                      />
                    </div>

                    <select
                      className="task-filter-select"
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(
                          event.target.value
                        )
                      }
                    >
                      <option value="All">
                        Status: All
                      </option>

                      <option value="To Do">
                        To Do
                      </option>

                      <option value="In Progress">
                        In Progress
                      </option>

                      <option value="Done">
                        Done
                      </option>
                    </select>

                    <select
                      className="task-filter-select"
                      value={priorityFilter}
                      onChange={(event) =>
                        setPriorityFilter(
                          event.target.value
                        )
                      }
                    >
                      <option value="All">
                        Priority: All
                      </option>

                      <option value="Low">
                        Low
                      </option>

                      <option value="Medium">
                        Medium
                      </option>

                      <option value="High">
                        High
                      </option>
                    </select>

                    <label className="overdue-control">
                      <span>Overdue</span>

                      <input
                        type="checkbox"
                        checked={showOverdueOnly}
                        onChange={(event) =>
                          setShowOverdueOnly(
                            event.target.checked
                          )
                        }
                      />
                    </label>
                  </div>

                  {/*
                    One button creates a task for the selected project.

                    The modal opens with To Do as the default status,
                    and the user can choose another status inside it.
                  */}
                  <div className="board-toolbar">
                    <button
                      type="button"
                      className="create-task-button"
                      onClick={() =>
                        openCreateTaskModal("To Do")
                      }
                    >
                      + Create Task
                    </button>
                  </div>

                  {/* Exactly three task columns */}
                  <div className="board-grid">
                    {(
                      [
                        {
                          title: "To Do" as TaskStatus,
                          className: "todo",
                          emptyTitle:
                            "No To Do tasks",
                          emptyText:
                            "Add a task to this project.",
                        },
                        {
                          title:
                            "In Progress" as TaskStatus,
                          className: "in-progress",
                          emptyTitle:
                            "Nothing in progress",
                          emptyText:
                            "Start a task when ready.",
                        },
                        {
                          title: "Done" as TaskStatus,
                          className: "done",
                          emptyTitle:
                            "No completed tasks",
                          emptyText:
                            "Completed tasks appear here.",
                        },
                      ]
                    ).map((column) => {
                      /*
                        Gets only the filtered tasks that
                        belong in this specific status column.
                      */
                      const columnTasks =
                        filteredTasks.filter(
                          (task) =>
                            task.status ===
                            column.title
                        );

                      return (
                        <section
                          key={column.title}
                          className={`task-column ${column.className}`}
                        >
                          <div className="task-column-header">
                            <div className="task-column-title-wrapper">
                              <h4 className="task-column-title">
                                {column.title}
                              </h4>

                              <span className="task-count">
                                {columnTasks.length}
                              </span>
                            </div>

                          </div>

                          {columnTasks.length === 0 ? (
                            <div className="empty-column">
                              <div className="empty-column-icon">
                                ✓
                              </div>

                              <p className="empty-column-title">
                                {column.emptyTitle}
                              </p>

                              <p className="empty-column-text">
                                {column.emptyText}
                              </p>
                            </div>
                          ) : (
                            columnTasks.map((task) => (
                              <article
                                key={task.id}
                                className="task-card"

                                /*
                                  Clicking the task card opens that
                                  specific task in read-only view mode.

                                  The URL contains both the project ID
                                  and task ID.
                                */
                                onClick={() =>
                                  openTaskView(task)
                                }

                                /*
                                  Makes the clickable task card usable
                                  from the keyboard as well.
                                */
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                  if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                  ) {
                                    openTaskView(task);
                                  }
                                }}
                              >
                                <h5 className="task-card-title">
                                  {task.title}
                                </h5>

                                <p className="task-card-description">
                                  {task.description
                                    ? task.description.length > 200
                                      ? task.description.slice(0, 200) + "..."
                                      : task.description
                                    : "No description provided."}
                                </p>

                                <div className="task-card-details">
                                  <span className="task-card-badge">
                                    {task.priority}
                                  </span>

                                  {task.estimatedMinutes !==
                                    null && (
                                    <span className="task-card-badge">
                                      {
                                        task.estimatedMinutes
                                      }{" "}
                                      min
                                    </span>
                                  )}

                                  {task.dueDate && (
                                    <span className="task-card-badge">
                                      Due: {task.dueDate}
                                    </span>
                                  )}
                                </div>

                              </article>
                            ))
                          )}
                        </section>
                      );
                    })}
                  </div>

                </>
              ) : (
                /*
                  Appears when projects exist but none
                  is selected.
                */
                <div className="no-projects-state">
                  <h3 className="no-projects-title">
                    Select a project
                  </h3>

                  <p>
                    Choose a project from the dropdown
                    to open its task board.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/*
        Displays the reusable Create/Edit Project modal.

        ProjectDashboard now owns the project data and form state.
        ProjectModal is responsible only for displaying the form
        and sending the user's actions back here.
      */}
      {showProjectModal && (
        <ProjectModal
          /*
            If editingProjectId contains a project ID,
            the modal opens in edit mode.

            If it is null, the modal opens in create mode.
          */
          mode={
            editingProjectId !== null
              ? "edit"
              : "create"
          }

          /*
            Sends the current project form values
            from ProjectDashboard into ProjectModal.
          */
          projectName={projectName}
          projectDescription={projectDescription}

          /*
            Sends the project-name validation error
            so ProjectModal can display it below the input.
          */
          projectNameError={projectNameError}

          /*
            Updates the project name when the user types.
          */
          onProjectNameChange={(value) => {
            setProjectName(value);

            if (projectNameError) {
              setProjectNameError("");
            }
          }}

          /*
            Updates the project description.
          */
          onProjectDescriptionChange={(value) => {
            setProjectDescription(value);
          }}

          /*
            Runs when the user clicks Cancel or the X button.
          */
          onClose={closeProjectModal}

          /*
            Runs when the user submits the form.
          */
          onSubmit={handleProjectSubmit}

          /*
            Runs when the user clicks Delete Project
            while the modal is in edit mode.
          */
          onDelete={handleDeleteProject}
        />
      )}


      {/*
        Displays one task in read-only mode.

        Clicking a task card opens this view first.
        Editing is a separate action.
      */}
      {viewedTask && (
        <div className="task-view-backdrop">
          <div className="task-view">
            <div className="task-view-header">
              <div>
                <h3 className="task-view-title">
                  {viewedTask.title}
                </h3>
              </div>

              <button
                type="button"
                className="task-modal-close"
                onClick={closeTaskView}
                aria-label="Close task details"
              >
                ×
              </button>
            </div>

            <p className="task-view-description">
              {viewedTask.description ||
                "No description provided."}
            </p>

            <div className="task-view-details">
              <span className="task-card-badge">
                Status: {viewedTask.status}
              </span>

              <span className="task-card-badge">
                Priority: {viewedTask.priority}
              </span>

              {viewedTask.estimatedMinutes !==
                null && (
                <span className="task-card-badge">
                  Estimated:{" "}
                  {viewedTask.estimatedMinutes} min
                </span>
              )}

              {viewedTask.dueDate && (
                <span className="task-card-badge">
                  Due: {viewedTask.dueDate}
                </span>
              )}
            </div>

            <div className="task-view-actions">
              <button
                type="button"
                className="task-cancel-button"
                onClick={closeTaskView}
              >
                Close
              </button>

              <button
                type="button"
                className="task-view-edit-button"
                onClick={openViewedTaskEdit}
              >
                Edit Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/*
        Displays the reusable Create/Edit Task modal.

        ProjectDashboard owns the task data and form state.
        TaskModal only displays the fields and sends actions
        back into this component.
      */}
      {showTaskModal && (
        <TaskModal
          mode={
            editingTaskId !== null
              ? "edit"
              : "create"
          }
          taskTitle={taskTitle}
          taskDescription={taskDescription}
          taskStatus={taskStatus}
          taskPriority={taskPriority}
          estimatedMinutes={estimatedMinutes}
          dueDate={dueDate}
          taskTitleError={taskTitleError}
          onTaskTitleChange={(value) => {
            setTaskTitle(value);

            if (taskTitleError) {
              setTaskTitleError("");
            }
          }}
          onTaskDescriptionChange={(value) => {
            setTaskDescription(value);
          }}
          onTaskStatusChange={(value) => {
            setTaskStatus(value);
          }}
          onTaskPriorityChange={(value) => {
            setTaskPriority(value);
          }}
          onEstimatedMinutesChange={(value) => {
            setEstimatedMinutes(value);
          }}
          onDueDateChange={(value) => {
            setDueDate(value);
          }}
          onClose={closeTaskModal}
          onSubmit={handleTaskSubmit}
          onDelete={handleDeleteTask}
        />
      )}
    </>
  );
}
export default ProjectDashboard;