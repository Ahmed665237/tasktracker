import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface LoginList {
  sign_inButton: string;
  email_label: string;
  password_label: string;
}

interface LoginData {
  email: string;
  password: string;
} // this is where the value of user will be held and validated

const Login = ({
  sign_inButton,
  email_label,
  password_label,
}: LoginList) => {
  // react only recieves one props object

  // Stores the email and password entered by the user
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  // Stores a general error returned by the backend
  const [errorMessage, setErrorMessage] = useState("");

  // Stores errors related only to the email field
  const [emailError, setEmailError] = useState("");

  // Stores errors related only to the password field
  const [passwordError, setPasswordError] = useState("");

  // Controls whether the password is visible or hidden
  const [showPassword, setShowPassword] = useState(false); // the password visibilty icon state

  // Used to move the user to another page
  const navigate = useNavigate(); // used to move the user to another page

  const handleSubmit = async (
    // this fn runs when the form is submitted and event shows the submission of the form
    event: React.FormEvent<HTMLFormElement> // tells type script where is it comming from the form (html)
  ) => {
    event.preventDefault(); // submitting a request makes the page reload, this prevents it
    // and the browser can reload before finishing the request

    // Removes old errors before validating the form again
    setEmailError("");
    setPasswordError("");
    setErrorMessage("");

    let hasValidationError = false;

    // Checks whether the email field is empty
    if (loginData.email.trim() === "") {
      setEmailError("Email is required");
      hasValidationError = true;
    } else if (
      !loginData.email.includes("@") ||
      !loginData.email.includes(".")
    ) {
      // Checks whether the entered email has a basic valid format
      setEmailError("Enter a valid email address");
      hasValidationError = true;
    }

    // Checks whether the password field is empty
    if (loginData.password === "") {
      setPasswordError("Password is required");
      hasValidationError = true;
    } else if (loginData.password.length < 8) {
      // Checks whether the password contains at least 8 characters
      setPasswordError(
        "Password must contain at least 8 characters"
      );
      hasValidationError = true;
    }

    // Stops before contacting the backend if frontend validation fails
    if (hasValidationError) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/login", // fetch sends an http request
        // the URL is your backend endpoint
        {
          method: "POST", // type of request
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // converts to json text so it can be sent through the http request
            email: loginData.email,
            password: loginData.password, // gets the current data entered by the user
          }),
        }
      );

      const data = await response.json(); // wait till the backend sends a response

      if (!response.ok) {
        // This is a general backend error because the backend does not reveal
        // whether the email or password was incorrect
        setErrorMessage(data.message);

        setTimeout(() => {
          setErrorMessage("");
        }, 3000); // makes the error message disappear

        return;
      }

      localStorage.setItem("token", data.token); // stores JWT returned by the backend

      navigate("/home"); // moves the user to the homepage after successful login

      setErrorMessage("");
    } catch (error) {
      // runs if the request fails
      setErrorMessage("Could not connect to the backend");
      console.error(error);
    }
  };

  return (
    <>
      <style>
        {`
          /* Styles the full login-page background */
          .login-page {
            min-height: 100vh;
            background:
              radial-gradient(
                circle at top right,
                rgba(37, 99, 235, 0.12),
                transparent 28%
              ),
              radial-gradient(
                circle at bottom left,
                rgba(59, 130, 246, 0.1),
                transparent 26%
              ),
              linear-gradient(
                135deg,
                #f8fbff 0%,
                #eef4ff 100%
              );
            padding: 32px;
          }

          /* Places the TaskTracker logo in the top-left corner */
          .login-brand {
            position: absolute;
            top: 30px;
            left: 45px;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          /* Styles the blue square that contains the checkmark */
          .login-brand-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: linear-gradient(
              135deg,
              #2563eb,
              #0d6efd
            );
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow:
              0 8px 20px rgba(37, 99, 235, 0.25);
          }

          /* Styles the TaskTracker application name */
          .login-brand-name {
            font-size: 26px;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
          }

          /* Styles the main white login card */
          .login-card {
            width: 100%;
            max-width: 520px;
            border: none;
            border-radius: 28px;
            background: rgba(255, 255, 255, 0.96);
            box-shadow:
              0 24px 60px rgba(15, 23, 42, 0.12);
            padding: 48px;
          }

          /* Styles the circular user icon */
          .login-user-icon {
            width: 78px;
            height: 78px;
            margin: 0 auto 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #eef4ff;
            color: #0d6efd;
          }

          /* Styles the Welcome back heading */
          .login-title {
            color: #0f172a;
            font-weight: 700;
            font-size: 36px;
            text-align: center;
            margin-bottom: 8px;
          }

          /* Styles the text below the main heading */
          .login-subtitle {
            color: #64748b;
            text-align: center;
            font-size: 17px;
            margin-bottom: 34px;
          }

          /* Contains one label, input and field error */
          .login-field-container {
            width: 100%;
            text-align: left;
          }

          /* Aligns the Email and Password labels to the left */
          .login-label {
            display: block;
            width: 100%;
            color: #0f172a;
            font-weight: 600;
            margin-bottom: 8px;
            text-align: left;
          }

          /* Allows icons and buttons to appear inside an input */
          .login-input-group {
            position: relative;
            width: 100%;
          }

          /* Positions the email and lock icons inside the inputs */
          .login-input-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: #64748b;
            z-index: 2;
            pointer-events: none;
          }

          /* Styles the email and password input fields */
          .login-input {
            width: 100%;
            min-height: 56px;
            border-radius: 12px;
            padding-left: 48px;
            padding-right: 48px;
            border: 1px solid #cbd5e1;
            font-size: 16px;
          }

          /* Adds a blue border when the user clicks inside an input */
          .login-input:focus {
            border-color: #0d6efd;
            box-shadow:
              0 0 0 4px rgba(13, 110, 253, 0.12);
          }

          /* Turns only the incorrect input red */
          .login-input.login-input-error {
            border-color: #dc3545;
            background-color: #fff8f8;
          }

          /* Keeps the incorrect input red when it is selected */
          .login-input.login-input-error:focus {
            border-color: #dc3545;
            box-shadow:
              0 0 0 4px rgba(220, 53, 69, 0.12);
          }

          /* Positions the password eye button inside the field */
          .password-toggle {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            border: none;
            background: transparent;
            color: #64748b;
            padding: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* Changes the eye icon color when the mouse is over it */
          .password-toggle:hover {
            color: #0d6efd;
          }

          /* Styles errors that belong to one specific input */
          .login-field-error {
            color: #dc3545;
            text-align: left;
            font-size: 14px;
            margin-top: 7px;
            margin-bottom: 0;
          }

          /* Styles a general error returned by the backend */
          .login-general-error {
            color: #dc3545;
            background-color: #fff5f5;
            border: 1px solid #f5c2c7;
            border-radius: 10px;
            text-align: center;
            font-size: 14px;
            padding: 10px 12px;
            margin-top: 16px;
            margin-bottom: 0;
          }

          /* Styles the large blue Sign In button */
          .login-submit-button {
            min-height: 54px;
            border: none;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 600;
            background: linear-gradient(
              135deg,
              #2563eb,
              #0d6efd
            );
            box-shadow:
              0 10px 22px rgba(37, 99, 235, 0.22);
          }

          /* Darkens the button when the mouse is over it */
          .login-submit-button:hover {
            background: linear-gradient(
              135deg,
              #1d4ed8,
              #0b5ed7
            );
          }

          /* Creates the horizontal divider containing the word or */
          .login-divider {
            display: flex;
            align-items: center;
            gap: 14px;
            color: #94a3b8;
            margin: 28px 0;
          }

          /* Creates the two divider lines */
          .login-divider::before,
          .login-divider::after {
            content: "";
            flex: 1;
            height: 1px;
            background: #dbe2ea;
          }

          /* Styles the text linking to the signup page */
          .login-signup-text {
            color: #334155;
            text-align: center;
            margin: 0;
          }

          /* Adjusts the design for smaller screens */
          @media (max-width: 768px) {
            .login-page {
              padding: 110px 16px 24px;
              justify-content: flex-start !important;
            }

            .login-brand {
              top: 24px;
              left: 24px;
            }

            .login-brand-name {
              font-size: 22px;
            }

            .login-card {
              padding: 32px 24px;
            }

            .login-title {
              font-size: 30px;
            }
          }
        `}
      </style>

      {/* This is the full-page container */}
      <div className="login-page d-flex justify-content-center align-items-center position-relative">
        {/* This is the TaskTracker logo and application name */}
        <div className="login-brand">
          {/* This is the blue logo square */}
          <div className="login-brand-icon">
            {/* This SVG draws the white checkmark */}
            <svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12.5L9.2 16.5L19 7"
                stroke="white"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* This displays the application name */}
          <h1 className="login-brand-name">
            TaskTracker
          </h1>
        </div>

        {/* This is the main login form card */}
        <form
          className="login-card"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* This displays the circular user icon */}
          <div className="login-user-icon">
            <svg
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="8"
                r="4"
                stroke="currentColor"
                strokeWidth="1.8"
              />

              <path
                d="M4.5 20C4.5 15.9 7.8 13 12 13C16.2 13 19.5 15.9 19.5 20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* This is the main heading */}
          <h2 className="login-title">
            Welcome back
          </h2>

          {/* This is the subtitle */}
          <p className="login-subtitle">
            Sign in to continue to your account
          </p>

          {/* This section contains the Email label, input and error */}
          <div className="login-field-container mb-4">
            {/* This is the Email label aligned to the left */}
            <label
              htmlFor="login-email"
              className="form-label login-label"
            >
              {email_label}
            </label>

            {/* This container allows the icon to appear inside the input */}
            <div className="login-input-group">
              {/* This displays the email icon */}
              <span className="login-input-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M4 7L12 13L20 7"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              {/* This is the email input */}
              <input
                id="login-email"
                value={loginData.email}
                onChange={(event) => {
                  setLoginData({
                    ...loginData,
                    email: event.target.value,
                  });

                  // Removes only the email error when the user edits the email
                  if (emailError) {
                    setEmailError("");
                  }

                  // Removes a general backend error when the user starts editing
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                type="email"
                className={`form-control login-input ${
                  emailError
                    ? "login-input-error"
                    : ""
                }`}
                placeholder="Enter your email"
              />
            </div>

            {/* This error appears only when the email is incorrect */}
            {emailError && (
              <p className="login-field-error">
                {emailError}
              </p>
            )}
          </div>

          {/* This section contains the Password label, input and error */}
          <div className="login-field-container mb-3">
            {/* This is the Password label aligned to the left */}
            <label
              htmlFor="login-password"
              className="form-label login-label"
            >
              {password_label}
            </label>

            {/* This container allows the lock and eye icons inside the input */}
            <div className="login-input-group">
              {/* This displays the lock icon */}
              <span className="login-input-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M8 10V7.5C8 5.3 9.8 3.5 12 3.5C14.2 3.5 16 5.3 16 7.5V10"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              {/* This is the password input */}
              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={loginData.password}
                onChange={(event) => {
                  setLoginData({
                    ...loginData,
                    password: event.target.value,
                  });

                  // Removes only the password error when the user edits the password
                  if (passwordError) {
                    setPasswordError("");
                  }

                  // Removes a general backend error when the user starts editing
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                className={`form-control login-input ${
                  passwordError
                    ? "login-input-error"
                    : ""
                }`}
                placeholder="Enter your password"
              />

              {/* This button shows or hides the password */}
              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  /* This icon appears when the password is visible */
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 3L21 21"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                    <path
                      d="M10.6 10.7C10.2 11 10 11.5 10 12C10 13.1 10.9 14 12 14C12.5 14 13 13.8 13.3 13.4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                    <path
                      d="M6.5 6.8C4.8 8 3.6 9.8 3 12C4.2 16.2 7.6 19 12 19C13.8 19 15.4 18.5 16.8 17.6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                    <path
                      d="M9.5 5.3C10.3 5.1 11.1 5 12 5C16.4 5 19.8 7.8 21 12C20.6 13.3 20 14.4 19.2 15.4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  /* This icon appears when the password is hidden */
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 12C4.2 7.8 7.6 5 12 5C16.4 5 19.8 7.8 21 12C19.8 16.2 16.4 19 12 19C7.6 19 4.2 16.2 3 12Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* This error appears only when the password is incorrect */}
            {passwordError && (
              <p className="login-field-error">
                {passwordError}
              </p>
            )}
          </div>

          {/* This appears for backend errors such as invalid credentials */}
          {errorMessage && (
            <p className="login-general-error">
              {errorMessage}
            </p>
          )}

          {/* This button submits the login form */}
          <button
            type="submit"
            className="btn btn-primary login-submit-button w-100 mt-4"
          >
            {sign_inButton}
          </button>

          {/* This is the divider between login and signup */}
          <div className="login-divider">
            <span>or</span>
          </div>

          {/* This sends a new user to the signup page */}
          <p className="login-signup-text">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-decoration-none fw-semibold"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </>
  );

  // button from bootstrap this is the login button
  // interface LoginList will be string values
  // input fields below button password is type because to appear as dots and placeholder is used to display data on input fields
  // positions have been adjusted by <div className="d-flex justify-content-center align-items-center min-vh-100"> till <div className="d-flex gap-4">
  // the input of user credentials is value={loginData.email} and value={loginData.password}

  // in useState:
  // useState starts as empty strings because the user did not write anything yet
  // loginData is the currently stored data
  // setLoginData updates loginData when the user types an email or password
  // end useState:

  /*
  onChange: what does it do ---> when the input of the user changes, run this function
  event.target.value gets what the user typed. example: "ahmed"
  ...loginData keeps the existing password.
  email: event.target.value replaces only the email.
  setLoginData saves the updated object because it calls setLoginData to update the state
  */

  // form is used so when I make the button type="submit", all credentials are submitted together
  // creating a useState where we can receive input
  // adding the link to sign up in the end
  // alerts for wrong credentials are now handled using errorMessage
};

export default Login;