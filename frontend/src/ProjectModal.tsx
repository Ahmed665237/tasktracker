/*
  These props are values and functions that
  ProjectDashboard sends to ProjectModal.
*/
interface ProjectModalProps {
  /*
    Decides whether the modal is creating
    a new project or editing an existing one.
  */
  mode: "create" | "edit";

  /*
    Stores the project name currently written
    inside the form.
  */
  projectName: string;

  /*
    Stores the project description currently written
    inside the form.
  */
  projectDescription: string;

  /*
    Stores the validation error for the project name.
  */
  projectNameError: string;

  /*
    Runs whenever the user changes the project name.
  */
  onProjectNameChange: (value: string) => void;

  /*
    Runs whenever the user changes the description.
  */
  onProjectDescriptionChange: (value: string) => void;

  /*
    Runs when the user clicks Cancel or the close button.
  */
  onClose: () => void;

  /*
    Runs when the user submits the form.
  */
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>
  ) => void;

  /*
    Runs when the user clicks Delete Project.

    ProjectDashboard still owns the actual
    project deletion logic.
  */
  onDelete: () => void;
}

function ProjectModal({
  mode,
  projectName,
  projectDescription,
  projectNameError,
  onProjectNameChange,
  onProjectDescriptionChange,
  onClose,
  onSubmit,
  onDelete,
}: ProjectModalProps) {
  return (
    /*
      This dark background covers the Home page
      while the modal is open.
    */
    <div className="project-modal-backdrop">
      {/*
        This form contains the Create/Edit Project fields.
      */}
      <form
        className="project-modal"
        onSubmit={onSubmit}
      >
        {/* Modal heading */}
        <div className="project-modal-header">
          <div>
            <h3 className="project-modal-title">
              {mode === "edit"
                ? "Edit Project"
                : "Create Project"}
            </h3>

            <p className="project-modal-subtitle">
              {mode === "edit"
                ? "Update your project information."
                : "Create a project to organize related tasks."}
            </p>
          </div>

          {/* Closes the modal */}
          <button
            type="button"
            className="project-modal-close"
            onClick={onClose}
            aria-label="Close project form"
          >
            ×
          </button>
        </div>

        {/* Project name field */}
        <div className="mb-4">
          <label
            htmlFor="project-name"
            className="project-form-label"
          >
            Project name{" "}
            <span className="text-danger">*</span>
          </label>

          <input
            id="project-name"
            type="text"
            className={`project-form-input ${
              projectNameError
                ? "project-input-error"
                : ""
            }`}
            value={projectName}

            /*
              Limits project names to 60 characters
              so very long names cannot be entered.
            */
            maxLength={60}

            onChange={(event) =>
              onProjectNameChange(event.target.value)
            }
            placeholder="Enter project name"
          />

          {/*
            Shows how many project-name characters
            the user has used out of the maximum.
          */}
          <small className="text-muted">
            {projectName.length}/60 characters
          </small>

          {/* Shows only when validation fails */}
          {projectNameError && (
            <p className="project-field-error">
              {projectNameError}
            </p>
          )}
        </div>

        {/* Project description field */}
        <div>
          <label
            htmlFor="project-description"
            className="project-form-label"
          >
            Description
          </label>

          <textarea
            id="project-description"
            className="project-form-textarea"
            value={projectDescription}
            onChange={(event) =>
              onProjectDescriptionChange(
                event.target.value
              )
            }
            placeholder="Enter project description (optional)"
          />
        </div>

        {/* Form buttons */}
        <div className="project-modal-actions">
          {/*
            Delete is shown only while editing.

            Clicking it sends the action back to
            ProjectDashboard through onDelete.
          */}
          {mode === "edit" && (
            <button
              type="button"
              className="delete-project-button"
              onClick={onDelete}
            >
              Delete Project
            </button>
          )}

          <button
            type="button"
            className="project-cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="project-save-button"
          >
            {mode === "edit"
              ? "Save Changes"
              : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProjectModal;

// contains the project form