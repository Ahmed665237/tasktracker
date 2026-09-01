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
/*
  This describes one time entry returned
  by the backend.
*/
interface TimeEntry {
  id: number;
  taskId: number;
  durationMinutes: number;
  date: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

/*
  This describes one read-only audit-history
  record returned by the backend.
*/
interface TaskAudit {
  id: number;
  taskId: number;
  actorUserId: number;
  actionType: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
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
    Becomes true after the logged-in user's
    projects have been loaded from the backend.
  */
  const [projectsLoaded, setProjectsLoaded] =
    useState(false);

  /*
    Stores a short message shown at the
    top-center of the dashboard.
  */
  const [pageMessage, setPageMessage] =
    useState("");

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

    This value is sent to the backend as a query parameter.
  */
  const [searchText, setSearchText] = useState("");

  /*
    Stores the selected task status filter.

    This value is sent to the backend as a query parameter.
  */
  const [statusFilter, setStatusFilter] =
    useState("All");

  /*
    Stores the selected task priority filter.

    This value is sent to the backend as a query parameter.
  */
  const [priorityFilter, setPriorityFilter] =
    useState("All");

  /*
    Controls whether only overdue tasks should appear.

    When enabled, overdue=true is sent to the backend.
  */
  const [showOverdueOnly, setShowOverdueOnly] =
    useState(false);


  /*
    Stores the tasks returned by the backend
    for the currently selected project.
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
    Stores the task loaded directly from
    GET /api/projects/:projectId/tasks/:taskId.

    This stays separate from the board task list
    because search/filtering can hide a valid task.
  */
  const [routeTask, setRouteTask] =
    useState<Task | null>(null);

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
  const {
    projectId,
    taskId,
    timeEntryId,
  } = useParams();
  /*
  Stores all time entries belonging
  to the task currently being viewed.
*/
const [timeEntries, setTimeEntries] =
  useState<TimeEntry[]>([]);

/*
  Stores the total amount of time
  logged for the viewed task.
*/
const [totalLoggedMinutes, setTotalLoggedMinutes] =
  useState(0);

/*
  Stores how much estimated time
  is still remaining.
*/
const [remainingMinutes, setRemainingMinutes] =
  useState<number | null>(null);

/*
  Stores how much logged time
  exceeded the estimate.
*/
const [exceededMinutes, setExceededMinutes] =
  useState<number | null>(null);

/*
  Stores the read-only audit-history records
  returned by the backend for the viewed task.
*/
const [auditHistory, setAuditHistory] =
  useState<TaskAudit[]>([]);

/*
  Changes whenever a Time Entry operation succeeds.

  This tells React to reload the audit history
  so the newest backend-generated event appears.
*/
const [auditRefreshKey, setAuditRefreshKey] =
  useState(0);

/*
  Stores which long Audit History values
  are currently expanded.

  The key contains both the audit ID
  and whether the value is old or new,
  so each side can expand independently.
*/
const [expandedAuditValues, setExpandedAuditValues] =
  useState<string[]>([]);

/*
  Stores which Time Entry notes are expanded.

  Time Entry notes use a smaller preview than
  Audit History values so the Time Entries table
  stays compact and the Edit/Delete actions remain visible.
*/
const [expandedTimeEntryNotes, setExpandedTimeEntryNotes] =
  useState<number[]>([]);


  /*
  Controls whether the Add/Edit Time Entry
  modal is visible.
*/
const [showTimeEntryModal, setShowTimeEntryModal] =
  useState(false);

/*
  Stores the time entry currently being edited.

  null means we are creating a new time entry.
*/
const [editingTimeEntryId, setEditingTimeEntryId] =
  useState<number | null>(null);

/*
  Stores duration in hours while
  the user is typing in the form.
*/
const [timeEntryHours, setTimeEntryHours] =
  useState("");

/*
  Stores the required date.
*/
const [timeEntryDate, setTimeEntryDate] =
  useState("");

/*
  Stores the optional note.
*/
const [timeEntryNote, setTimeEntryNote] =
  useState("");

/*
  Stores validation errors for duration.
*/
const [timeEntryHoursError, setTimeEntryHoursError] =
  useState("");

/*
  Stores validation errors for date.
*/
const [timeEntryDateError, setTimeEntryDateError] =
  useState("");

/*
  Remembers whether the user entered
  an invalid Date value.

  This lets us distinguish:
  - empty date -> "Date is required"
  - invalid date -> "Invalid date"
*/
const [
  timeEntryDateInvalid,
  setTimeEntryDateInvalid,
] = useState(false);

 /*
  Stores a general backend/API error
  when saving a Time Entry fails.

  The modal stays open so the user can
  understand the problem and retry.
*/
const [timeEntrySubmitError, setTimeEntrySubmitError] =
  useState("");

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
    Checks whether the current URL is for
    adding a new Time Entry.

    Example:
    /projects/5/tasks/10/time-entries/new
  */
  const isCreateTimeEntryRoute =
    location.pathname.includes(
      "/time-entries/new"
    );

  /*
    Checks whether the current URL is for
    editing an existing Time Entry.

    Example:
    /projects/5/tasks/10/time-entries/3/edit
  */
  const isEditTimeEntryRoute =
    location.pathname.includes(
      "/time-entries/"
    ) &&
    location.pathname.endsWith("/edit");

  /*
    True when either Time Entry route
    is currently open.
  */
  const isTimeEntryRoute =
    isCreateTimeEntryRoute ||
    isEditTimeEntryRoute;

  /*
    Checks whether the current URL is the
    Edit Task URL.

    Time Entry edit URLs are excluded so
    they are not mistaken for task-edit URLs.

    Example:
    /projects/5/tasks/10/edit
  */
  const isEditTaskRoute =
    location.pathname.includes("/tasks/") &&
    location.pathname.endsWith("/edit") &&
    !location.pathname.includes(
      "/time-entries/"
    );

  /*
    Checks whether the current URL is the
    View Task URL.

    Example:
    /projects/5/tasks/10

    Create Task, Edit Task, and Time Entry
    URLs are excluded.
  */
  const isViewTaskRoute =
    location.pathname.includes("/tasks/") &&
    !location.pathname.endsWith("/edit") &&
    !location.pathname.includes("/tasks/new") &&
    !location.pathname.includes(
      "/time-entries/"
    );

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
    Finds the complete task object currently being viewed.

    This must remain separate from the search/filter logic
    because the task details popup uses it.
  */
  const viewedTask =
    routeTask &&
    routeTask.id === viewingTaskId
      ? routeTask
      : null;

  /*
    Displays long Audit History values
    without allowing them to stretch
    and ruin the table layout.

    The complete value still remains
    stored in PostgreSQL.

    Old Value and New Value use separate
    keys so each one can expand independently.
  */
  const renderExpandableAuditValue = (
    auditId: number,
    valueType: "old" | "new",
    value: string
  ) => {
    /*
      Limits only what is displayed.

      It does NOT limit what the user
      can save in the database.
    */
    const characterLimit =
      120;

    const expansionKey =
      `${auditId}-${valueType}`;

    const isExpanded =
      expandedAuditValues.includes(
        expansionKey
      );

    /*
      Short values do not need
      a Read more button.
    */
    if (
      value.length <= characterLimit
    ) {
      return value;
    }

    /*
      When expanded, display the complete
      value and allow it to be collapsed.
    */
    if (isExpanded) {
      return (
        <>
          {value}

          <button
            type="button"
            className="audit-read-more"
            onClick={() =>
              setExpandedAuditValues(
                (currentValues) =>
                  currentValues.filter(
                    (key) =>
                      key !== expansionKey
                  )
              )
            }
          >
            Show less
          </button>
        </>
      );
    }

    /*
      Initially displays only the first
      120 characters followed by ...
    */
    return (
      <>
        {value.slice(
          0,
          characterLimit
        )}
        ...

        <button
          type="button"
          className="audit-read-more"
          onClick={() =>
            setExpandedAuditValues(
              (currentValues) => [
                ...currentValues,
                expansionKey,
              ]
            )
          }
        >
          Read more
        </button>
      </>
    );
  };

  /*
    Displays a Time Entry note without allowing
    a long note to stretch the table.

    Only the displayed text is shortened.
    The complete note remains stored in PostgreSQL.

    Time Entry notes use a smaller 60-character
    preview than Audit History values.
  */
  const renderTimeEntryNote = (
    timeEntry: TimeEntry
  ) => {
    const note =
      timeEntry.note;

    if (!note) {
      return "No note";
    }

    const characterLimit =
      60;

    const isExpanded =
      expandedTimeEntryNotes.includes(
        timeEntry.id
      );

    /*
      Short notes fit normally and do not
      need a Read more button.
    */
    if (
      note.length <= characterLimit
    ) {
      return note;
    }

    /*
      Expanded notes show the complete text,
      but the table column keeps a fixed width
      so the Actions column does not disappear.
    */
    if (isExpanded) {
      return (
        <>
          {note}

          <button
            type="button"
            className="time-entry-read-more"
            onClick={() =>
              setExpandedTimeEntryNotes(
                (currentIds) =>
                  currentIds.filter(
                    (id) =>
                      id !== timeEntry.id
                  )
              )
            }
          >
            Show less
          </button>
        </>
      );
    }

    /*
      Long notes initially show only the first
      60 characters followed by ... and Read more.
    */
    return (
      <>
        {note.slice(
          0,
          characterLimit
        )}
        ...

        <button
          type="button"
          className="time-entry-read-more"
          onClick={() =>
            setExpandedTimeEntryNotes(
              (currentIds) => [
                ...currentIds,
                timeEntry.id,
              ]
            )
          }
        >
          Read more
        </button>
      </>
    );
  };

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
    Opens the Time Entry modal
    in create mode.

    The browser URL also changes so
    the modal has its own frontend route.
  */
  const openCreateTimeEntryModal = () => {
    if (!viewedTask) {
      return;
    }

    setEditingTimeEntryId(null);
    setTimeEntryHours("");
    setTimeEntryDate("");
    setTimeEntryNote("");
    setTimeEntryHoursError("");
    setTimeEntryDateError("");
    setTimeEntryDateInvalid(false);
    setTimeEntrySubmitError("");
    setShowTimeEntryModal(true);

    /*
      Example:
      /projects/1/tasks/4/time-entries/new
    */
    navigate(
      `/projects/${viewedTask.projectId}/tasks/${viewedTask.id}/time-entries/new`
    );
  };

  /*
    Opens one existing Time Entry
    in edit mode.
  */
  const openEditTimeEntryModal = (
    timeEntry: TimeEntry
  ) => {
    if (!viewedTask) {
      return;
    }

    /*
      Saves which Time Entry is being edited.
    */
    setEditingTimeEntryId(
      timeEntry.id
    );

    /*
      The backend stores duration in minutes.

      The form displays hours,
      so minutes are converted back to hours.
    */
    setTimeEntryHours(
      String(
        timeEntry.durationMinutes / 60
      )
    );

    setTimeEntryDate(
      timeEntry.date
    );

    setTimeEntryNote(
      timeEntry.note ?? ""
    );

    setTimeEntryHoursError("");
    setTimeEntryDateError("");
    setTimeEntryDateInvalid(false);
    setTimeEntrySubmitError("");
    setShowTimeEntryModal(true);

    /*
      Example:
      /projects/1/tasks/4/time-entries/3/edit
    */
    navigate(
      `/projects/${viewedTask.projectId}/tasks/${viewedTask.id}/time-entries/${timeEntry.id}/edit`
    );
  };

  /*
    Closes the Time Entry modal and
    returns to the task-details URL.
  */
  const closeTimeEntryModal = () => {
    setShowTimeEntryModal(false);
    setEditingTimeEntryId(null);
    setTimeEntryHours("");
    setTimeEntryDate("");
    setTimeEntryNote("");
    setTimeEntryHoursError("");
    setTimeEntryDateError("");
    setTimeEntryDateInvalid(false);
    setTimeEntrySubmitError("");

    if (viewedTask) {
      navigate(
        `/projects/${viewedTask.projectId}/tasks/${viewedTask.id}`
      );
    }
  };
  /*
  Creates a new time entry or updates
  an existing time entry.

  The actual save happens in the backend.
*/
const handleTimeEntrySubmit = async () => {
  /*
    Clears old validation errors.
  */
  setTimeEntryHoursError("");
  setTimeEntryDateError("");
  setTimeEntrySubmitError("");

  /*
    Converts the entered hours
    from text into a number.
  */
  const numericHours =
    Number(timeEntryHours);
    const maxDurationHours =
  2147483647 / 60;

  /*
  Checks if the entered number is too large
  to be stored as a normal finite number.
*/
if (!Number.isFinite(numericHours)||  numericHours > maxDurationHours) {
  setTimeEntryHoursError(
    "Number is way too big"
  );

  return;
}

/*
  Duration is required
  and must be greater than zero.
*/
if (
  timeEntryHours.trim() === "" ||
  numericHours <= 0
) {
  setTimeEntryHoursError(
    "Duration must be greater than zero"
  );

  return;
}

  /*
    If the user entered something but the
    browser says the Date is invalid,
    show an invalid-date message.

    This check must happen BEFORE the empty
    check because an invalid date input can
    sometimes appear to React as an empty string.
  */
  if (timeEntryDateInvalid) {
    setTimeEntryDateError(
      "Invalid date"
    );

    return;
  }

  /*
    If nothing was entered at all,
    show the required-field message.
  */
  if (timeEntryDate === "") {
    setTimeEntryDateError(
      "Date is required"
    );

    return;
  }

  /*
    A time entry cannot exist
    without a task being viewed.
  */
  if (!viewedTask) {
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
      CREATE:

      POST
      /time-entries

      EDIT:

      PUT
      /time-entries/:timeEntryId
    */
    const url =
      editingTimeEntryId === null
        ? `http://localhost:3000/api/projects/${viewedTask.projectId}/tasks/${viewedTask.id}/time-entries`
        : `http://localhost:3000/api/projects/${viewedTask.projectId}/tasks/${viewedTask.id}/time-entries/${editingTimeEntryId}`;

    const method =
      editingTimeEntryId === null
        ? "POST"
        : "PUT";

    /*
      Sends the time entry to the backend.

      The frontend sends hours.

      The backend converts hours
      into minutes before saving.
    */
    const response = await fetch(
      url,
      {
        method: method,

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify({
          durationHours:
            numericHours,

          date:
            timeEntryDate,

          note:
            timeEntryNote.trim(),
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      /*
        Shows each backend validation message
        beside the field that caused the problem.
      */
      if (
        data.message === "Wrong date format"
      ) {
        setTimeEntryDateError(
          "Invalid date"
        );
      } else if (
        data.message === "Date is required"
      ) {
        setTimeEntryDateError(
          "Date is required"
        );
      } else if (
        data.message === "Duration must be greater than zero" ||
        data.message === "Duration must be at least 1 minute" ||
        data.message === "Number is way too big"
      ) {
        setTimeEntryHoursError(
          data.message
        );
      } else {
        /*
          Displays any other backend/API error
          inside the Time Entry form.

          The modal stays open because this return
          happens before the success/close code.
        */
        setTimeEntrySubmitError(
          data.message ||
          "Unable to save time entry. Please try again."
        );
      }

      console.error(
        "Unable to save time entry:",
        data
      );

      return;
    }

    /*
      After saving, asks the backend
      for the complete updated time-entry data.

      This also gives us the new:
      - total logged time
      - remaining time
      - exceeded time
    */
    const timeEntriesResponse =
      await fetch(
        `http://localhost:3000/api/projects/${viewedTask.projectId}/tasks/${viewedTask.id}/time-entries`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    const timeEntriesData =
      await timeEntriesResponse.json();

    if (!timeEntriesResponse.ok) {
      console.error(
        "Unable to reload time entries:",
        timeEntriesData
      );

      return;
    }

    /*
      React mirrors the updated data
      returned by the backend.
    */
    setTimeEntries(
      timeEntriesData.timeEntries
    );

    setTotalLoggedMinutes(
      timeEntriesData.totalLoggedMinutes
    );

    setRemainingMinutes(
      timeEntriesData.remainingMinutes
    );

    setExceededMinutes(
      timeEntriesData.exceededMinutes
    );

    /*
      Reloads audit history after a successful
      Time Entry create or edit operation.
    */
    setAuditRefreshKey(
      (currentKey) => currentKey + 1
    );

    /*
      Clears and closes the Time Entry modal.
    */
    setEditingTimeEntryId(null);
    setTimeEntryHours("");
    setTimeEntryDate("");
    setTimeEntryNote("");
    setTimeEntryHoursError("");
    setTimeEntryDateError("");
    setTimeEntryDateInvalid(false);
    setTimeEntrySubmitError("");
    setShowTimeEntryModal(false);

    /*
      Returns the browser URL to
      the normal task-details route.
    */
    navigate(
      `/projects/${viewedTask.projectId}/tasks/${viewedTask.id}`
    );
  } catch (error) {
    /*
      Keeps the modal open and gives the user
      a visible message if the request itself fails.
    */
    setTimeEntrySubmitError(
      "Unable to save time entry. Please try again."
    );

    console.error(
      "Error saving time entry:",
      error
    );
  }
};

/*
  Permanently deletes one Time Entry
  through the backend.
*/
const handleDeleteTimeEntry = async (
  timeEntry: TimeEntry
) => {
  if (!viewedTask) {
    return;
  }

  /*
    Asks before permanently deleting it.
  */
  const confirmed =
    window.confirm(
      "Are you sure you want to delete this time entry?"
    );

  if (!confirmed) {
    return;
  }

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
      Calls the REST DELETE endpoint.

      DELETE
      /api/projects/:projectId/tasks/:taskId/time-entries/:timeEntryId
    */
    const response = await fetch(
      `http://localhost:3000/api/projects/${viewedTask.projectId}/tasks/${viewedTask.id}/time-entries/${timeEntry.id}`,
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

    if (!response.ok) {
      console.error(
        "Unable to delete time entry:",
        data
      );

      return;
    }

    /*
      Reloads Time Entries from the backend
      after deletion so the backend-calculated
      totals are also refreshed.
    */
    const timeEntriesResponse =
      await fetch(
        `http://localhost:3000/api/projects/${viewedTask.projectId}/tasks/${viewedTask.id}/time-entries`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    const timeEntriesData =
      await timeEntriesResponse.json();

    if (!timeEntriesResponse.ok) {
      console.error(
        "Unable to reload time entries:",
        timeEntriesData
      );

      return;
    }

    setTimeEntries(
      timeEntriesData.timeEntries
    );

    setTotalLoggedMinutes(
      timeEntriesData.totalLoggedMinutes
    );

    setRemainingMinutes(
      timeEntriesData.remainingMinutes
    );

    setExceededMinutes(
      timeEntriesData.exceededMinutes
    );

    /*
      Reloads audit history after a successful
      Time Entry deletion.
    */
    setAuditRefreshKey(
      (currentKey) => currentKey + 1
    );
  } catch (error) {
    console.error(
      "Error deleting time entry:",
      error
    );
  }
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
  Permanently deletes the task currently being edited.

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
      Tells the backend to permanently delete
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
      Removes the deleted task
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
    Permanently deletes the currently selected project.

    The frontend calls:
    DELETE /api/projects/:projectId
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
        Tells the backend to permanently delete
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
      EDIT PROJECT

      Sends the updated project to the backend
      so the change is persisted in PostgreSQL.
    */
    if (editingProjectId !== null) {
      const token =
        localStorage.getItem("token");

      if (!token) {
        console.error(
          "Authentication token is missing"
        );

        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3000/api/projects/${editingProjectId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              name:
                projectName.trim(),

              description:
                projectDescription.trim(),
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          console.error(
            "Unable to update project:",
            data
          );

          return;
        }

        /*
          React displays the project returned
          by the backend after the DB update.
        */
        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            project.id === editingProjectId
              ? {
                  id:
                    data.project.id,

                  name:
                    data.project.name,

                  description:
                    data.project.description ?? "",
                }
              : project
          )
        );

        closeProjectModal();

        return;
      } catch (error) {
        console.error(
          "Error updating project:",
          error
        );

        return;
      }
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
  Automatically clears Time Entry
  validation messages after 2 seconds.
*/
useEffect(() => {
  if (
    timeEntryHoursError === "" &&
    timeEntryDateError === ""
  ) {
    return;
  }

  const errorTimer =
    window.setTimeout(() => {
      setTimeEntryHoursError("");
      setTimeEntryDateError("");
    }, 2000);

  return () => {
    window.clearTimeout(errorTimer);
  };
}, [
  timeEntryHoursError,
  timeEntryDateError,
]);


  /*
  Loads all time entries for the task
  currently being viewed.

  It also receives:
  - total logged time
  - remaining estimated time
  - exceeded estimated time
*/
useEffect(() => {
  /*
    If no task is currently being viewed,
    clear the old time-entry information.
  */
  if (!viewedTask) {
    setTimeEntries([]);
    setTotalLoggedMinutes(0);
    setRemainingMinutes(null);
    setExceededMinutes(null);

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
    Loads this task's time entries
    from the backend.
  */
  const loadTimeEntries = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/projects/${viewedTask.projectId}/tasks/${viewedTask.id}/time-entries`,
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
          "Unable to load time entries:",
          data
        );

        return;
      }

      /*
        React only mirrors the values
        calculated and returned by the backend.
      */
      setTimeEntries(
        data.timeEntries
      );

      setTotalLoggedMinutes(
        data.totalLoggedMinutes
      );

      setRemainingMinutes(
        data.remainingMinutes
      );

      setExceededMinutes(
        data.exceededMinutes
      );
    } catch (error) {
      console.error(
        "Error loading time entries:",
        error
      );
    }
  };

  loadTimeEntries();
}, [
  viewedTask,
]);


/*
  Loads the read-only audit history for
  the task currently being viewed.

  Audit records are generated by the backend
  and persisted in PostgreSQL.

  Merely viewing the task does NOT create
  a new audit event.
*/
useEffect(() => {
  /*
    Clears old history when no task
    is currently open.
  */
  if (!viewedTask) {
    setAuditHistory([]);

    return;
  }

  const token =
    localStorage.getItem("token");

  if (!token) {
    console.error(
      "Authentication token is missing"
    );

    return;
  }

  const loadAuditHistory = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/projects/${viewedTask.projectId}/tasks/${viewedTask.id}/audit-history`,
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
          "Unable to load audit history:",
          data
        );

        return;
      }

      /*
        The backend already returns the
        history newest first.

        React only displays it.
      */
      setAuditHistory(
        data.auditHistory
      );
    } catch (error) {
      console.error(
        "Error loading audit history:",
        error
      );
    }
  };

  loadAuditHistory();
}, [
  viewedTask,
  auditRefreshKey,
]);


/*
  Keeps the Time Entry modal synchronized
  with the browser URL.

  This also means refreshing a Time Entry
  URL can reopen the correct modal.
*/
useEffect(() => {
  /*
    Add Time Entry route:
    /projects/:projectId/tasks/:taskId/time-entries/new
  */
  if (
    isCreateTimeEntryRoute &&
    viewedTask
  ) {
    setEditingTimeEntryId(null);
    setTimeEntryHours("");
    setTimeEntryDate("");
    setTimeEntryNote("");
    setTimeEntryHoursError("");
    setTimeEntryDateError("");
    setTimeEntryDateInvalid(false);
    setTimeEntrySubmitError("");
    setShowTimeEntryModal(true);

    return;
  }

  /*
    Edit Time Entry route:
    /projects/:projectId/tasks/:taskId/time-entries/:timeEntryId/edit
  */
  if (
    isEditTimeEntryRoute &&
    viewedTask &&
    timeEntryId
  ) {
    const numericTimeEntryId =
      Number(timeEntryId);

    const timeEntryToEdit =
      timeEntries.find(
        (timeEntry) =>
          timeEntry.id === numericTimeEntryId
      );

    /*
      Wait until the Time Entry list has loaded.
    */
    if (!timeEntryToEdit) {
      return;
    }

    setEditingTimeEntryId(
      timeEntryToEdit.id
    );

    setTimeEntryHours(
      String(
        timeEntryToEdit.durationMinutes / 60
      )
    );

    setTimeEntryDate(
      timeEntryToEdit.date
    );

    setTimeEntryNote(
      timeEntryToEdit.note ?? ""
    );

    setTimeEntryHoursError("");
    setTimeEntryDateError("");
    setTimeEntryDateInvalid(false);
    setTimeEntrySubmitError("");
    setShowTimeEntryModal(true);

    return;
  }

  /*
    A normal task URL does not show
    the Time Entry modal.
  */
  if (!isTimeEntryRoute) {
    setShowTimeEntryModal(false);
  }
}, [
  isCreateTimeEntryRoute,
  isEditTimeEntryRoute,
  isTimeEntryRoute,
  viewedTask,
  timeEntryId,
  timeEntries,
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

        /*
          The real project list is now loaded.
        */
        setProjectsLoaded(true);
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

    It also validates manually typed project URLs.
  */
  useEffect(() => {
    if (!projectId) {
      return;
    }

    if (!projectsLoaded) {
      return;
    }

    const numericProjectId =
      Number(projectId);

    const projectExists =
      !Number.isNaN(numericProjectId) &&
      projects.some(
        (project) =>
          project.id === numericProjectId
      );

    if (!projectExists) {
      setSelectedProjectId(null);
      setPageMessage(
        "Project does not exist"
      );

      navigate(
        "/home",
        {
          replace: true,
        }
      );

      return;
    }

    setSelectedProjectId(
      numericProjectId
    );
  }, [
    projectId,
    projects,
    projectsLoaded,
    navigate,
  ]);

  /*
    Hides the message automatically
    after three seconds.
  */
  useEffect(() => {
    if (pageMessage === "") {
      return;
    }

    const messageTimer =
      window.setTimeout(
        () => {
          setPageMessage("");
        },
        3000
      );

    return () => {
      window.clearTimeout(
        messageTimer
      );
    };
  }, [
    pageMessage,
  ]);
      
  /*
    Loads tasks for the currently selected project.

    Search and filtering are NOT performed in React.
    The frontend sends query parameters to the existing
    GET endpoint and the backend/PostgreSQL performs them.
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
      Uses a short delay for search typing so
      the frontend does not send a request
      after every single keystroke immediately.
    */
    const requestTimer = window.setTimeout(
      async () => {
        try {
          /*
            Builds query parameters for the backend.

            "All" values are not sent because
            they mean no filter should be applied.
          */
          const queryParams =
            new URLSearchParams();

          if (searchText.trim() !== "") {
            queryParams.set(
              "search",
              searchText.trim()
            );
          }

          if (statusFilter !== "All") {
            queryParams.set(
              "status",
              statusFilter
            );
          }

          if (priorityFilter !== "All") {
            queryParams.set(
              "priority",
              priorityFilter
            );
          }

          if (showOverdueOnly) {
            queryParams.set(
              "overdue",
              "true"
            );
          }

          /*
            Keeps the same GET endpoint.

            The query string is added only when
            search/filter values exist.
          */
          const queryString =
            queryParams.toString();

          const tasksUrl =
            `http://localhost:3000/api/projects/${selectedProjectId}/tasks${
              queryString
                ? `?${queryString}`
                : ""
            }`;

          const response = await fetch(
            tasksUrl,
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
            The backend has already performed
            search and filtering.

            React only displays the tasks
            returned by the backend.
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
      },
      300
    );

    /*
      Cancels the previous delayed request when
      the user changes search/filter values quickly.
    */
    return () => {
      window.clearTimeout(
        requestTimer
      );
    };
  }, [
    selectedProjectId,
    searchText,
    statusFilter,
    priorityFilter,
    showOverdueOnly,
  ]);

  

  /*
    Opens and prepares the task modal depending
    on the current browser URL.

    Direct task URLs are checked through the backend.
  */
  useEffect(() => {
    /*
      Create Task route:
      /projects/:projectId/tasks/new
    */
    if (isCreateTaskRoute && projectId) {
      const numericProjectId =
        Number(projectId);

      setSelectedProjectId(
        numericProjectId
      );
      setViewingTaskId(null);
      setRouteTask(null);
      setEditingTaskId(null);
      setShowTaskModal(true);

      return;
    }

    /*
      View/Edit Task routes:
      /projects/:projectId/tasks/:taskId
      /projects/:projectId/tasks/:taskId/edit
    */
    if (
      (
        isViewTaskRoute ||
        isEditTaskRoute ||
        isTimeEntryRoute
      ) &&
      projectId &&
      taskId
    ) {
      const numericProjectId =
        Number(projectId);

      const numericTaskId =
        Number(taskId);

      const token =
        localStorage.getItem("token");

      if (!token) {
        console.error(
          "Authentication token is missing"
        );

        return;
      }

      /*
        Loads the exact task from the backend.

        This is important because a valid task may
        currently be hidden by search/filtering.
      */
      const loadTaskFromUrl =
        async () => {
          try {
            const response =
              await fetch(
                `http://localhost:3000/api/projects/${numericProjectId}/tasks/${numericTaskId}`,
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

            /*
              If the task does not exist,
              return to the project board.
            */
            if (response.status === 404) {
              setRouteTask(null);
              setViewingTaskId(null);
              setEditingTaskId(null);
              setShowTaskModal(false);
              setPageMessage(
                "Task does not exist"
              );

              navigate(
                `/projects/${numericProjectId}`,
                {
                  replace: true,
                }
              );

              return;
            }

            if (!response.ok) {
              console.error(
                "Unable to load task:",
                data
              );

              return;
            }

            const loadedTask: Task = {
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

            setRouteTask(
              loadedTask
            );

            setSelectedProjectId(
              loadedTask.projectId
            );

            /*
              Read-only task view.
            */
            if (
              isViewTaskRoute ||
              isTimeEntryRoute
            ) {
              setViewingTaskId(
                loadedTask.id
              );
              setEditingTaskId(null);
              setShowTaskModal(false);

              return;
            }

            /*
              Edit task view.
            */
            setViewingTaskId(null);
            setTaskTitle(
              loadedTask.title
            );
            setTaskDescription(
              loadedTask.description
            );
            setTaskStatus(
              loadedTask.status
            );
            setTaskPriority(
              loadedTask.priority
            );
            setEstimatedMinutes(
              loadedTask.estimatedMinutes === null
                ? ""
                : String(
                    loadedTask.estimatedMinutes
                  )
            );
            setDueDate(
              loadedTask.dueDate
            );
            setTaskTitleError("");
            setEditingTaskId(
              loadedTask.id
            );
            setShowTaskModal(true);
          } catch (error) {
            console.error(
              "Error loading task:",
              error
            );
          }
        };

      loadTaskFromUrl();

      return;
    }

    /*
      Any other route hides task-specific UI.
    */
    setShowTaskModal(false);
    setViewingTaskId(null);
    setRouteTask(null);
  }, [
    isCreateTaskRoute,
    isViewTaskRoute,
    isEditTaskRoute,
    isTimeEntryRoute,
    projectId,
    taskId,
    navigate,
  ]);


  return (
    <>
      <style>
        {`
          /*
            Shows short validation messages
            at the top-center of the page.
          */
          .dashboard-message {
            position: fixed;
            top: 22px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            background: #fff1f2;
            border: 1px solid #fecdd3;
            color: #be123c;
            border-radius: 10px;
            padding: 11px 16px;
            box-shadow:
              0 10px 24px
              rgba(15, 23, 42, 0.12);
            font-weight: 600;
          }

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


          .edit-project-button:disabled,
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
            max-width: 1100px;
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


          .time-entry-section {
            border-top: 1px solid #e2e8f0;
            padding-top: 22px;
            margin-top: 10px;
            margin-bottom: 24px;
          }

          .time-entry-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 18px;
          }

          .time-entry-title {
            margin: 0 0 8px;
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
          }

          .time-entry-total,
          .time-entry-remaining,
          .time-entry-exceeded {
            margin: 4px 0;
            font-size: 14px;
          }

          .time-entry-total {
            color: #0f172a;
            font-weight: 650;
          }

          .time-entry-remaining {
            color: #087f8c;
          }

          .time-entry-exceeded {
            color: #dc3545;
          }

          .add-time-entry-button {
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
          }

          .add-time-entry-button:hover {
            background:
              linear-gradient(
                135deg,
                #0d8b8b,
                #066f7a
              );
          }

          .time-entry-empty {
            border: 2px dashed #d8e1ea;
            border-radius: 13px;
            padding: 28px;
            text-align: center;
            color: #64748b;
          }

          .time-entry-empty-title {
            margin: 0 0 5px;
            color: #334155;
            font-weight: 700;
          }

          .time-entry-empty-text {
            margin: 0;
            font-size: 14px;
          }

          .time-entry-table-wrapper {
            width: 100%;
            overflow-x: auto;
          }

          .time-entry-table {
            width: 100%;
            border-collapse: collapse;

            /*
              Keeps long notes from making the table
              wider and pushing Edit/Delete off-screen.
            */
            table-layout: fixed;
          }

          .time-entry-table th,
          .time-entry-table td {
            padding: 12px 10px;
            border-bottom: 1px solid #e2e8f0;
            text-align: left;
            vertical-align: top;
            font-size: 14px;
          }

          .time-entry-table th {
            color: #475569;
            font-weight: 700;
          }

          /*
            Keeps Date, Duration, and Actions at
            predictable widths while Note uses the
            remaining space.
          */
          .time-entry-table th:nth-child(1),
          .time-entry-table td:nth-child(1) {
            width: 120px;
          }

          .time-entry-table th:nth-child(2),
          .time-entry-table td:nth-child(2) {
            width: 110px;
          }

          .time-entry-table th:nth-child(4),
          .time-entry-table td:nth-child(4) {
            width: 145px;
            white-space: nowrap;
          }

          /*
            Long notes wrap inside their own column
            instead of stretching the complete table.
          */
          .time-entry-note {
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          /*
            Small Read more / Show less control used
            only when a Time Entry note is long.
          */
          .time-entry-read-more {
            border: none;
            background: transparent;
            color: #087f8c;
            padding: 0;
            margin-left: 5px;
            font-size: 12px;
            font-weight: 650;
            cursor: pointer;
            white-space: nowrap;
          }

          .time-entry-read-more:hover {
            text-decoration: underline;
          }

          .time-entry-edit-button,
          .time-entry-delete-button {
            border: none;
            background: transparent;
            padding: 4px 8px;
            font-weight: 600;
          }

          .time-entry-edit-button {
            color: #087f8c;
          }

          .time-entry-delete-button {
            color: #dc3545;
          }

          /*
            Styles the read-only Audit History section
            inside Task Details.
          */
          .audit-history-section {
            border: 1px solid #d8e1ea;
            border-radius: 14px;
            margin-bottom: 24px;
            overflow: hidden;
            background: #ffffff;
          }

          .audit-history-header {
            padding: 18px 18px 14px;
            border-bottom: 1px solid #e2e8f0;
          }

          .audit-history-title {
            margin: 0 0 5px;
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
          }

          .audit-history-subtitle {
            margin: 0;
            color: #64748b;
            font-size: 14px;
          }

          .audit-history-empty {
            padding: 28px;
            text-align: center;
            color: #64748b;
          }

          .audit-history-table-wrapper {
            overflow-x: auto;
          }

          .audit-history-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 900px;
          }

          .audit-history-table th,
          .audit-history-table td {
            padding: 12px 14px;
            border-bottom: 1px solid #e2e8f0;
            text-align: left;
            vertical-align: top;
            font-size: 13px;
          }

          .audit-history-table th {
            background: #f8fafc;
            color: #475569;
            font-weight: 700;
          }

          .audit-history-table tbody tr:last-child td {
            border-bottom: none;
          }

          .audit-action-badge {
            display: inline-flex;
            align-items: center;
            border-radius: 999px;
            padding: 4px 9px;
            font-size: 12px;
            font-weight: 700;
            background: #e0f2fe;
            color: #0369a1;
          }

          .audit-action-badge.created {
            background: #dcfce7;
            color: #15803d;
          }

          .audit-action-badge.time-entry {
            background: #ecfeff;
            color: #087f8c;
          }

          .audit-old-value,
          .audit-new-value {
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          /*
            Styles the Read more / Show less
            button used for long Audit History values.
          */
          .audit-read-more {
            border: none;
            background: transparent;
            color: #087f8c;
            padding: 0;
            margin-left: 6px;
            font-weight: 650;
            cursor: pointer;
          }

          .audit-read-more:hover {
            text-decoration: underline;
          }

          .audit-empty-value {
            color: #94a3b8;
          }

          .audit-history-note {
            margin: 0;
            padding: 10px 18px;
            border-top: 1px solid #e2e8f0;
            background: #f8fafc;
            color: #64748b;
            font-size: 12px;
          }

                    /*
            Styles the Add/Edit Time Entry modal.
          */
          .time-entry-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 120;
            background:
              rgba(15, 23, 42, 0.58);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 22px;
          }

          .time-entry-modal {
            width: 100%;
            max-width: 520px;
            background: white;
            border-radius: 20px;
            box-shadow:
              0 30px 80px
              rgba(15, 23, 42, 0.28);
            padding: 28px;
          }

          .time-entry-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 24px;
          }

          .time-entry-modal-title {
            margin: 0 0 6px;
            font-size: 24px;
            font-weight: 700;
          }

          .time-entry-modal-subtitle {
            margin: 0;
            color: #64748b;
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
            .edit-project-button {
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

      {pageMessage && (
        <div className="dashboard-message">
          {pageMessage}
        </div>
      )}

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
                        The backend has already applied the
                        user's search and filter selections.

                        This only groups the returned tasks
                        into the correct visual board column.
                      */
                      const columnTasks =
                        tasks.filter(
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


            {/*
  Displays the Add/Edit Time Entry modal
  above the task-details popup.
*/}
{showTimeEntryModal && viewedTask && (
  <div className="time-entry-modal-backdrop">
    <div className="time-entry-modal">
      <div className="time-entry-modal-header">
        <div>
          <h3 className="time-entry-modal-title">
            {editingTimeEntryId !== null
              ? "Edit Time Entry"
              : "Add Time Entry"}
          </h3>

          <p className="time-entry-modal-subtitle">
            Log the time spent on this task.
          </p>
        </div>

        <button
          type="button"
          className="task-modal-close"
          onClick={closeTimeEntryModal}
          aria-label="Close time entry modal"
        >
          ×
        </button>
      </div>

      <div className="task-form-group">
        <label className="task-form-label">
          Duration (hours)
        </label>

        <input
          type="number"
          step="0.1"
          min="0"
          className={`task-form-input ${
            timeEntryHoursError
              ? "task-input-error"
              : ""
          }`}
          value={timeEntryHours}
          onChange={(event) => {
            setTimeEntryHours(
              event.target.value
            );

            if (timeEntryHoursError) {
              setTimeEntryHoursError("");
            }

            if (timeEntrySubmitError) {
              setTimeEntrySubmitError("");
            }
          }}
          placeholder="Example: 1.5"
        />

        {timeEntryHoursError && (
          <p className="task-field-error">
            {timeEntryHoursError}
          </p>
        )}
      </div>

      <div className="task-form-group">
        <label className="task-form-label">
          Date
        </label>

        <input
          type="date"
          min="0001-01-01"
          max="9999-12-31"
          className={`task-form-input ${
            timeEntryDateError
              ? "task-input-error"
              : ""
          }`}
          value={timeEntryDate}
          onInput={(event) => {
            /*
              Detects malformed, impossible,
              or out-of-range Date values.
            */
            const dateIsInvalid =
              event.currentTarget.validity.badInput ||
              event.currentTarget.validity.rangeUnderflow ||
              event.currentTarget.validity.rangeOverflow;

            setTimeEntryDateInvalid(
              dateIsInvalid
            );

            /*
              Show the invalid-date message immediately
              when the browser detects an invalid value.
            */
            if (dateIsInvalid) {
              setTimeEntryDateError(
                "Invalid date"
              );
            }
          }}
          onChange={(event) => {
            setTimeEntryDate(
              event.target.value
            );

            const dateIsInvalid =
              event.currentTarget.validity.badInput ||
              event.currentTarget.validity.rangeUnderflow ||
              event.currentTarget.validity.rangeOverflow;

            setTimeEntryDateInvalid(
              dateIsInvalid
            );

            if (!dateIsInvalid) {
              setTimeEntryDateError("");
            }

            if (timeEntrySubmitError) {
              setTimeEntrySubmitError("");
            }
          }}
        />

        {timeEntryDateError && (
          <p className="task-field-error">
            {timeEntryDateError}
          </p>
        )}
      </div>

      <div className="task-form-group">
        <label className="task-form-label">
          Note
        </label>

        <textarea
          className="task-form-textarea"
          value={timeEntryNote}
          onChange={(event) => {
            setTimeEntryNote(
              event.target.value
            );

            if (timeEntrySubmitError) {
              setTimeEntrySubmitError("");
            }
          }}
          placeholder="Optional note"
        />
      </div>

      {/*
        Shows backend/API save errors that are
        not tied to one specific input field.

        The modal stays open so the user can
        correct the problem and retry.
      */}
      {timeEntrySubmitError && (
        <p className="task-field-error">
          {timeEntrySubmitError}
        </p>
      )}

      <div className="task-modal-actions">
        <button
          type="button"
          className="task-cancel-button"
          onClick={closeTimeEntryModal}
        >
          Cancel
        </button>

        <button
          type="button"
          className="task-save-button"
          onClick={handleTimeEntrySubmit}
        >
          {editingTimeEntryId !== null
            ? "Save Changes"
            : "Save Time Entry"}
        </button>
      </div>
    </div>
  </div>
)}


            {/*
  Displays the time entries belonging
  to the currently viewed task.
*/}
<div className="time-entry-section">
  <div className="time-entry-header">
    <div>
      <h4 className="time-entry-title">
        Time Entries
      </h4>

      <p className="time-entry-total">
        Total Logged Time:{" "}
        {totalLoggedMinutes} min
      </p>

      {viewedTask.estimatedMinutes !== null &&
        remainingMinutes !== null &&
        remainingMinutes > 0 && (
          <p className="time-entry-remaining">
            Remaining:{" "}
            {remainingMinutes} min
          </p>
        )}

      {viewedTask.estimatedMinutes !== null &&
        exceededMinutes !== null &&
        exceededMinutes > 0 && (
          <p className="time-entry-exceeded">
            Exceeded by:{" "}
            {exceededMinutes} min
          </p>
        )}
    </div>

    <button
      type="button"
      className="add-time-entry-button"
      onClick={openCreateTimeEntryModal}
    >
      + Add Time Entry
    </button>
  </div>

  {timeEntries.length === 0 ? (
    <div className="time-entry-empty">
      <p className="time-entry-empty-title">
        No time entries yet
      </p>

      <p className="time-entry-empty-text">
        Add a time entry to log time spent
        on this task.
      </p>
    </div>
  ) : (
    <div className="time-entry-table-wrapper">
      <table className="time-entry-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Duration</th>
            <th>Note</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {timeEntries.map((timeEntry) => (
            <tr key={timeEntry.id}>
              <td>
                {timeEntry.date}
              </td>

              <td>
                {timeEntry.durationMinutes} min
              </td>

              <td className="time-entry-note">
                {renderTimeEntryNote(
                  timeEntry
                )}
              </td>

              <td>
                <button
                  type="button"
                  className="time-entry-edit-button"
                  onClick={() =>
                    openEditTimeEntryModal(
                      timeEntry
                    )
                  }
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="time-entry-delete-button"
                  onClick={() =>
                    handleDeleteTimeEntry(
                      timeEntry
                    )
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

            {/*
              Displays the backend-generated,
              read-only audit history for this task.

              Newest events appear first.
              Viewing the task itself does not
              create an audit event.
            */}
            <div className="audit-history-section">
              <div className="audit-history-header">
                <h4 className="audit-history-title">
                  Audit History
                </h4>

                <p className="audit-history-subtitle">
                  Chronological history of meaningful
                  changes made to this task.
                </p>
              </div>

              {auditHistory.length === 0 ? (
                <div className="audit-history-empty">
                  No audit history yet.
                </div>
              ) : (
                <div className="audit-history-table-wrapper">
                  <table className="audit-history-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Actor</th>
                        <th>Action</th>
                        <th>Field / Activity</th>
                        <th>Old Value</th>
                        <th>New Value</th>
                      </tr>
                    </thead>

                    <tbody>
                      {auditHistory.map((audit) => {
                        /*
                          Converts stored Time Entry JSON
                          into readable text for the UI.
                        */
                        const formatAuditValue = (
                          value: string | null
                        ) => {
                          if (value === null) {
                            return "—";
                          }

                          if (
                            audit.actionType.startsWith(
                              "TIME_ENTRY_"
                            )
                          ) {
                            try {
                              const parsedValue =
                                JSON.parse(value);

                              const durationText =
                                parsedValue.durationMinutes !==
                                undefined
                                  ? `${parsedValue.durationMinutes} min`
                                  : "";

                              const dateText =
                                parsedValue.date
                                  ? `Date: ${parsedValue.date}`
                                  : "";

                              const noteText =
                                parsedValue.note
                                  ? `Note: ${parsedValue.note}`
                                  : "Note: No note";

                              return [
                                durationText,
                                dateText,
                                noteText,
                              ]
                                .filter(Boolean)
                                .join("\n");
                            } catch {
                              return value;
                            }
                          }

                          return value;
                        };

                        const actionLabel =
                          audit.actionType ===
                          "TASK_CREATED"
                            ? "Created"
                            : audit.actionType ===
                              "STATUS_CHANGED"
                              ? "Status Changed"
                              : audit.actionType ===
                                "TIME_ENTRY_CREATED"
                                ? "Time Entry Added"
                                : audit.actionType ===
                                  "TIME_ENTRY_UPDATED"
                                  ? "Time Entry Edited"
                                  : audit.actionType ===
                                    "TIME_ENTRY_DELETED"
                                    ? "Time Entry Deleted"
                                    : "Updated";

                        const fieldLabel =
                          audit.fieldName ===
                          "estimatedMinutes"
                            ? "Estimated Time"
                            : audit.fieldName ===
                              "dueDate"
                              ? "Due Date"
                              : audit.fieldName ===
                                "timeEntry"
                                ? "Time Entry"
                                : audit.fieldName
                                  ? audit.fieldName
                                      .charAt(0)
                                      .toUpperCase() +
                                    audit.fieldName.slice(1)
                                  : "Task";

                        const actionClass =
                          audit.actionType ===
                          "TASK_CREATED"
                            ? "created"
                            : audit.actionType.startsWith(
                                "TIME_ENTRY_"
                              )
                              ? "time-entry"
                              : "";

                        /*
                          Converts the old/new database values
                          into the exact text that will be shown.

                          Long text is shortened only visually
                          by renderExpandableAuditValue below.
                        */
                        const formattedOldValue =
                          formatAuditValue(
                            audit.oldValue
                          );

                        const formattedNewValue =
                          audit.actionType ===
                            "TASK_CREATED" &&
                          audit.newValue === null
                            ? "Task created"
                            : formatAuditValue(
                                audit.newValue
                              );

                        return (
                          <tr key={audit.id}>
                            <td>
                              {new Date(
                                audit.createdAt
                              ).toLocaleString()}
                            </td>

                            <td>
                              {currentUserName}
                            </td>

                            <td>
                              <span
                                className={`audit-action-badge ${actionClass}`}
                              >
                                {actionLabel}
                              </span>
                            </td>

                            <td>
                              {fieldLabel}
                            </td>

                            <td
                              className={
                                audit.oldValue === null
                                  ? "audit-empty-value"
                                  : "audit-old-value"
                              }
                            >
                              {renderExpandableAuditValue(
                                audit.id,
                                "old",
                                formattedOldValue
                              )}
                            </td>

                            <td
                              className={
                                audit.newValue === null
                                  ? "audit-empty-value"
                                  : "audit-new-value"
                              }
                            >
                              {renderExpandableAuditValue(
                                audit.id,
                                "new",
                                formattedNewValue
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="audit-history-note">
                Audit history is read only.
              </p>
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