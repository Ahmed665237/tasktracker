import React from 'react'
import Login from './Login'
import SignUp from './SignUp';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // activates routing
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
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
      </Routes>
    </BrowserRouter>
  );
};
//sign up and sign in


// 'path' is in the route where it checks the url in the browser to decide which component to show
// each route connects the URL to one component


export default App
// this is the application displayed