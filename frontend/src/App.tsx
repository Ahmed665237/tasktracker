import React from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import Home from "./Home";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; // activates routing

const App = () => {
  /*
    This asks the browser whether a login token
    is already saved in localStorage.

    If a token exists, the user is sent to /home.
    If no token exists, the user is sent to /login.
  */
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirects the empty root URL */}
        <Route
          path="/"
          element={
            token ? (
              /*
                If the token exists, the user is sent
                to the Home dashboard.
              */
              <Navigate to="/home" replace />
            ) : (
              /*
                If the token does not exist, the user
                is sent to the Login page.
              */
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Login page */}
        <Route
          path="/login"
          element={
            <Login
              sign_inButton="Sign in"
              email_label="Email"
              password_label="Password"
            />
          }
        />

        {/* Signup page */}
        <Route
          path="/signup"
          element={
            <SignUp
              sign_UpButton="Sign up"
              name_label="Name"
              email_label="Email"
              password_label="Password"
            />
          }
        />

        {/* Home page shown after successful login */}
        <Route
          path="/home"
          element={<Home />}
        />

        {/*
          This route will be used when the user opens
          the Create Project modal.

          Home still appears behind the modal because
          this route also renders the Home component.
        */}
        <Route
          path="/projects/new"
          element={<Home />}
        />

        {/*
          This route will be used when the user edits
          an existing project.

          :projectId is a route parameter.

          Example:
          /projects/7/edit

          In this example, projectId is 7.
        */}
        <Route
          path="/projects/:projectId/edit"
          element={<Home />}
        />

        {/*
          This route will be used when the user creates
          a new task inside a specific project.

          Example:
          /projects/7/tasks/new

          This means:
          create a new task inside project 7.
        */}
        <Route
          path="/projects/:projectId/tasks/new"
          element={<Home />}
        />

        {/*
          This route will be used to open the details
          of one existing task.

          Example:
          /projects/7/tasks/15

          projectId = 7
          taskId = 15
        */}
        <Route
          path="/projects/:projectId/tasks/:taskId"
          element={<Home />}
        />

        {/*
          This route will be used when the user edits
          an existing task.

          Example:
          /projects/7/tasks/15/edit

          projectId = 7
          taskId = 15
        */}
        <Route
          path="/projects/:projectId"
          element={<Home />}
        />
        <Route
          path="/projects/:projectId/tasks/:taskId/edit"
          element={<Home />}
        />

        {/*
          This catches an unknown URL.

          For now, an unknown route returns the user
          to the Home page when logged in, or Login
          when no token exists.
        */}
        <Route
          path="*"
          element={
            token ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

// sign up and sign in

/*
  "path" is the route React checks against the URL
  in the browser.

  "element" is the component React displays when
  that URL matches.

  The project and task modal routes all display Home,
  because the modal must appear over the dashboard
  instead of replacing the dashboard.
*/

export default App;

// this is the application displayed