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
  const token = localStorage.getItem("token"); // this asks the browser do you have the login saved and it stores it here
  return (
    <BrowserRouter>
      <Routes>
        {/* redirects the empty root URL to the login page */}
        <Route
          path="/"
              element={
            token ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace /> // if the first is true goes to home page
            )
          }
        />

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

        {/* home page shown after successful login */}
        <Route
          path="/home"
          element={<Home />}
        />
      </Routes>
    </BrowserRouter>
  );
};

// sign up and sign in

// 'path' is in the route where it checks the url in the browser to decide which component to show
// each route connects the URL to one component

export default App;

// this is the application displayed