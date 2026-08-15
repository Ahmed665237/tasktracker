# TaskTracker

TaskTracker is a personal project and task management application.

It allows users to create projects, manage tasks through a three-column board, search and filter tasks, track estimates and due dates, and manually log time spent on tasks.

The application is split into:

- A React frontend
- A Node.js/Express backend
- A PostgreSQL database

Each user can only access their own projects, tasks, and related data.

---

# Frontend

The frontend provides the user interface for TaskTracker.

It is responsible for displaying projects, tasks, filters, task details, and time entries.

The frontend communicates with the backend REST API to create, read, update, and delete data.

## Frontend Technologies

- React
- TypeScript
- Vite
- React Router
- Bootstrap

## Frontend Features

The frontend currently supports:

- User registration
- User login
- User logout
- Current-user authentication
- Project creation
- Project editing
- Project deletion
- Project selection
- Three-column task board:
  - To Do
  - In Progress
  - Done
- Task creation
- Task editing
- Task deletion
- Task priority
- Task estimates
- Task due dates
- Overdue task filtering
- Task search
- Combined task filtering
- Task details popup
- Direct project URLs
- Direct task URLs
- Manual time entries
- Time entry creation
- Time entry editing
- Time entry deletion
- Total logged time
- Remaining estimated time
- Exceeded estimated time
- URL-based Add Time Entry modal
- URL-based Edit Time Entry modal
- Form validation messages

## Insalling the Frontend
## Running the Frontend

Open a terminal and go to the frontend folder:

```bash
cd frontend
npm install
npm run dev
```

## Installing the Backend
## Running the Backend

Open another terminal and go to the backend folder:

```bash
cd backend
npm install
npm run dev