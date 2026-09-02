# TaskTracker

TaskTracker is a personal project and task management application.

It allows users to create projects, manage tasks through a three-column board, search and filter tasks, track estimates and due dates, and manually log time spent on tasks.

The application is split into:

- A React frontend
- A Node.js/Express backend
- A PostgreSQL database

Each user can only access their own projects, tasks, and related data.

---

# Prerequisites

Before running the project locally, make sure you have:

- Node.js
- npm
- PostgreSQL

You will also need to create the PostgreSQL database before running the migrations.

## Running With Docker

Docker Compose runs the PostgreSQL database, backend, and frontend together:

```bash
docker compose up --build
```

The backend automatically runs the database migrations before starting. No database
backup is restored and no seeders are executed. Open the frontend at
`http://localhost:5173` and the API documentation at `http://localhost:3000/api-docs`.

To stop the containers:

```bash
docker compose down
```

The database uses a Docker volume so its data persists between container restarts.
To remove that data and create a completely fresh database, run:

```bash
docker compose down -v
```

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

---

# Database Setup

The backend uses PostgreSQL.

Before running the backend for the first time, create the database.

Open PostgreSQL and create the TaskTracker database:

```sql
CREATE DATABASE tasktracker;
```

After creating the database, make sure the backend environment variables contain the correct PostgreSQL connection information and JWT secret.

Then run the database migrations from the backend folder:

```bash
cd backend
npx sequelize-cli db:migrate
```

The migrations create the required database tables.

To undo the latest migration:

```bash
npx sequelize-cli db:migrate:undo
```

---

# Backend

## Installing and Running the Backend

Open a terminal and go to the backend folder:

```bash
cd backend
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

---

# Frontend Setup

## Installing and Running the Frontend

Open another terminal and go to the frontend folder:

```bash
cd frontend
npm install
npm run dev
```

Vite will show the frontend URL in the terminal after it starts.

---

# API

The frontend communicates with the backend through a REST API.

The API includes endpoints for:

- Authentication
- Projects
- Tasks
- Time Entries

Protected endpoints require the JWT token returned after login.

The token is sent using Bearer authentication.

Example:

```text
Authorization: Bearer <token>
```

---

# API Documentation

The API documentation can be accessed through the `/api-docs` endpoint.

After starting the backend, open:

```text
http://localhost:3000/api-docs
```

The API documentation shows the available endpoints, request data, authentication requirements, and response information.

---

# Running the Project From the Start

If the project is cloned on a new machine, the basic order is:

```bash
git clone <repository-url>
cd tasktracker
```

Create the PostgreSQL database first:

```sql
CREATE DATABASE tasktracker;
```

Then install the backend dependencies and run the migrations:

```bash
cd backend
npm install
npx sequelize-cli db:migrate
npm run dev
```

Open another terminal and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

After both applications are running, open the frontend URL shown by Vite.

The backend API documentation is available at:

```text
http://localhost:3000/api-docs
```