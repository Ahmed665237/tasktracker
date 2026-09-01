// the task data that gets sent in the htttp request

/*
  These are the only allowed task statuses
  to contain one of these '|'
*/
type TaskStatus =
  | "To Do"
  | "In Progress"
  | "Done";

/*
  These are the only allowed task priorities
  from the project requirements.
*/
type TaskPriority =
  | "Low"
  | "Medium"
  | "High";

/*
  These props are the values and functions
  ProjectDashboard will send to TaskModal.
*/
interface TaskModalProps {
  /*
    Decides whether the modal is creating
    a new task or editing an existing task.
  */
  mode: "create" | "edit";

  /*
    Stores the title currently written
    inside the task form.
  */
  taskTitle: string;

  /*
    Stores the optional task description.
  */
  taskDescription: string;

  /*
    Stores the selected task status.
  */
  taskStatus: TaskStatus;

  /*
    Stores the selected task priority.
  */
  taskPriority: TaskPriority;

  /*
    Stores estimated time as text while
    the user is typing.

    Later, ProjectDashboard will convert it
    into minutes before storing the task.
  */
  estimatedMinutes: string;

  /*
    Stores the optional due date.
  */
  dueDate: string;

  /*
    Stores the validation error
    for the required task title.
  */
  taskTitleError: string;

  /*
    Runs when the task title changes.
  */
  onTaskTitleChange: (value: string) => void;

  /*
    Runs when the task description changes.
  */
  onTaskDescriptionChange: (
    value: string
  ) => void;

  /*
    Runs when the task status changes.
  */
  onTaskStatusChange: (
    value: TaskStatus
  ) => void;

  /*
    Runs when the task priority changes.
  */
  onTaskPriorityChange: (
    value: TaskPriority
  ) => void;

  /*
    Runs when estimated minutes changes.
  */
  onEstimatedMinutesChange: (
    value: string
  ) => void;

  /*
    Runs when the due date changes.
  */
  onDueDateChange: (value: string) => void;

  /*
    Runs when the user clicks Cancel
    or the X button.
  */
  onClose: () => void;

  /*
    Runs when the user submits the form.
  */
  onSubmit: () => void;

  /*
    Runs when the user clicks Delete Task.

    ProjectDashboard still owns the actual
    task deletion logic.
  */
  onDelete: () => void;
}

function TaskModal({
  mode,
  taskTitle,
  taskDescription,
  taskStatus,
  taskPriority,
  estimatedMinutes,
  dueDate,
  taskTitleError,
  onTaskTitleChange,
  onTaskDescriptionChange,
  onTaskStatusChange,
  onTaskPriorityChange,
  onEstimatedMinutesChange,
  onDueDateChange,
  onClose,
  onSubmit,
  onDelete,
}: TaskModalProps) {
  return (
    /*
      This dark background covers the dashboard
      while the task modal is open.
    */
    <div className="task-modal-backdrop">
      {/*
        This form is reused for both
        Create Task and Edit Task.
      */}
      <form
        className="task-modal"
        onSubmit={(event) => {
          /*
            Prevents the browser from performing
            a normal HTML form submission.
          */
          event.preventDefault();
        }}
      >
        {/* Modal heading */}
        <div className="task-modal-header">
          <div>
            <h3 className="task-modal-title">
              {mode === "edit"
                ? "Edit Task"
                : "Create Task"}
            </h3>

            <p className="task-modal-subtitle">
              {mode === "edit"
                ? "Update the task information."
                : "Add a task to the selected project."}
            </p>
          </div>

          {/* Closes the modal */}
          <button
            type="button"
            className="task-modal-close"
            onClick={onClose}
            aria-label="Close task form"
          >
            ×
          </button>
        </div>

        {/* Required task-title field */}
        <div className="task-form-group">
          <label
            htmlFor="task-title"
            className="task-form-label"
          >
            Title{" "}
            <span className="text-danger">
              *
            </span>
          </label>

          <input
            id="task-title"
            type="text"
            className={`task-form-input ${
              taskTitleError
                ? "task-input-error"
                : ""
            }`}
            value={taskTitle}

            /*
              Limits task titles to 100 characters
              so very long titles cannot be entered.
            */
            maxLength={100}

            onChange={(event) =>
              onTaskTitleChange(
                event.target.value
              )
            }
            placeholder="Enter task title"
          />

          {/*
            Shows how many title characters
            the user has used out of the maximum.
          */}
          <small className="text-muted">
            {taskTitle.length}/100 characters
          </small>

          {/* Shows only when title validation fails */}
          {taskTitleError && (
            <p className="task-field-error">
              {taskTitleError}
            </p>
          )}
        </div>

        {/* Optional task-description field */}
        <div className="task-form-group">
          <label
            htmlFor="task-description"
            className="task-form-label"
          >
            Description
          </label>

          <textarea
            id="task-description"
            className="task-form-textarea"
            value={taskDescription}
            onChange={(event) =>
              onTaskDescriptionChange(
                event.target.value
              )
            }
            placeholder="Enter task description (optional)"
          />
        </div>

        {/*
          Status and Priority are displayed
          next to each other on wider screens.
        */}
        <div className="task-form-row">
          {/* Task status */}
          <div className="task-form-group">
            <label
              htmlFor="task-status"
              className="task-form-label"
            >
              Status
            </label>

            <select
              id="task-status"
              className="task-form-select"
              value={taskStatus}
              onChange={(event) =>
                onTaskStatusChange(
                  event.target.value as TaskStatus
                )
              }
            >
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
          </div>

          {/* Task priority */}
          <div className="task-form-group">
            <label
              htmlFor="task-priority"
              className="task-form-label"
            >
              Priority
            </label>

            <select
              id="task-priority"
              className="task-form-select"
              value={taskPriority}
              onChange={(event) =>
                onTaskPriorityChange(
                  event.target.value as TaskPriority
                )
              }
            >
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
          </div>
        </div>

        {/*
          Estimated time and due date are also
          displayed next to each other.
        */}
        <div className="task-form-row">
          {/* Optional estimate stored in minutes */}
          <div className="task-form-group">
            <label
              htmlFor="estimated-minutes"
              className="task-form-label"
            >
              Estimated time in minutes
            </label>

            <input
              id="estimated-minutes"
              type="number"
              min="1"
              max="10080"
              className="task-form-input"
              value={estimatedMinutes}

              /*
                Keeps the frontend estimate consistent
                with the backend validation.

                10080 minutes = 7 days.
              */
              onChange={(event) => {
                const value =
                  event.target.value;

                /*
                  Empty is allowed because
                  estimated time is optional.
                */
                if (value === "") {
                  onEstimatedMinutesChange("");

                  return;
                }

                /*
                  Prevents values above the
                  allowed maximum from being entered.
                */
                if (Number(value) > 10080) {
                  return;
                }

                onEstimatedMinutesChange(
                  value
                );
              }}
              placeholder="Example: 90"
            />

            <small className="text-muted">
              Maximum: 10080 minutes (7 days)
            </small>
          </div>

          {/* Optional due date */}
          <div className="task-form-group">
            <label
              htmlFor="task-due-date"
              className="task-form-label"
            >
              Due date
            </label>

            <input
              id="task-due-date"
              type="date"
              className="task-form-input"
              value={dueDate}
              onChange={(event) =>
                onDueDateChange(
                  event.target.value
                )
              }
            />
          </div>
        </div>

        {/* Form buttons */}
        <div className="task-modal-actions">
          {/*
            Delete Task is shown only while editing.

            Clicking it sends the action back to
            ProjectDashboard through onDelete.
          */}
          {mode === "edit" && (
            <button
              type="button"
              className="task-delete-button"
              onClick={onDelete}
            >
              Delete Task
            </button>
          )}

          <button
            type="button"
            className="task-cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="task-save-button"
            onClick={onSubmit}
          >
            {mode === "edit"
              ? "Save Changes"
              : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskModal;