import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Link is used to move between signup and login without refreshing the page.
// useNavigate is used to move the user to the Home page after successful signup.

interface SignUpList {
  sign_UpButton: string;
  email_label: string;
  password_label: string;
  name_label: string;
}

// SignUpList describes the props received from App.tsx.
// These props control the text displayed inside the signup page.

interface SignUpData {
  email: string;
  password: string;
  name: string;
}

// SignUpData describes the values stored inside the signup form.
// It does not create a user by itself.
// It only tells TypeScript that the form contains a name, email, and password.

const SignUp = ({
  sign_UpButton,
  email_label,
  password_label,
  name_label,
}: SignUpList) => {
  // React receives one props object.
  // We are extracting the four values from that props object.

  const [SignUpData, setSignUpData] = useState<SignUpData>({
    name: "",
    email: "",
    password: "",
  });

  // SignUpData stores what the user currently typed.
  // setSignUpData updates those values.
  // All values start empty because the user has not typed anything yet.

  const [errorMessage, setErrorMessage] = useState("");

  // errorMessage stores a general error.
  // Examples:
  // "Could not connect to the backend"
  // or another backend error that does not belong to one field.

  const [nameError, setNameError] = useState("");

  // nameError stores only errors related to the full-name field.
  // When nameError contains text, only the name input becomes red.

  const [emailError, setEmailError] = useState("");

  // emailError stores only errors related to the email field.
  // When emailError contains text, only the email input becomes red.

  const [passwordError, setPasswordError] = useState("");

  // passwordError stores only errors related to the password field.
  // When passwordError contains text, only the password input becomes red.

  const [showPassword, setShowPassword] = useState(false);

  // showPassword controls whether the password appears as normal text or dots.
  // false means hidden.
  // true means visible.

  const navigate = useNavigate();

  // navigate allows this component to change the current route.
  // After successful signup, it moves the user to /home.

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    // handleSubmit runs when the user submits the signup form.

    event.preventDefault();

    // A normal form submission reloads the browser page.
    // preventDefault stops that so React can complete the request.

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setErrorMessage("");

    // These lines clear old errors before validating the form again.

    let hasValidationError = false;

    // This variable remembers whether any field is invalid.
    // If one or more fields are invalid, we stop before calling the backend.

    if (SignUpData.name.trim() === "") {
      setNameError("Full name is required");
      hasValidationError = true;
    } else if (SignUpData.name.trim().length < 2) {
      setNameError(
        "Full name must contain at least 2 characters"
      );
      hasValidationError = true;
    }

    // This section validates only the full-name field.
    // trim() removes spaces from the beginning and end.
    // If the name is empty or too short, only the name field becomes red.

    if (SignUpData.email.trim() === "") {
      setEmailError("Email is required");
      hasValidationError = true;
    } else if (
      !SignUpData.email.includes("@") ||
      !SignUpData.email.includes(".") ||
      SignUpData.email.includes(" ")
    ) {
      setEmailError("Enter a valid email address");
      hasValidationError = true;
    }

    // This section validates only the email field.
    // It checks that the email:
    // contains @
    // contains .
    // contains no spaces

    if (SignUpData.password === "") {
      setPasswordError("Password is required");
      hasValidationError = true;
    } else if (SignUpData.password.length < 8) {
      setPasswordError(
        "Password must contain at least 8 characters"
      );
      hasValidationError = true;
    }

    // This section validates only the password field.
    // A password must exist and contain at least 8 characters.

    if (hasValidationError) {
      return;
    }

    // If any frontend validation failed, the function stops here.
    // No request is sent to the backend.

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: SignUpData.email,
            password: SignUpData.password,
            name: SignUpData.name,
          }),
        }
      );

      // fetch sends the signup request to the existing backend endpoint.
      // The endpoint has not been changed.
      // JSON.stringify converts the JavaScript object into JSON text.

      const data = await response.json();

      // response.json() reads the JSON returned by the backend.

      if (!response.ok) {
        const backendMessage =
          data.message || "Could not create your account";

        // If the backend returns an error, we store its message.
        // A default message is used if data.message is missing.

        const lowerMessage = backendMessage.toLowerCase();

        // Converts the message to lowercase so checking words is easier.

        if (
          lowerMessage.includes("email") ||
          lowerMessage.includes("already exists") ||
          lowerMessage.includes("already registered")
        ) {
          setEmailError(backendMessage);
        } else if (lowerMessage.includes("password")) {
          setPasswordError(backendMessage);
        } else if (lowerMessage.includes("name")) {
          setNameError(backendMessage);
        } else {
          setErrorMessage(backendMessage);
        }

        // This decides which field should become red.
        // Email-related backend error → email field becomes red.
        // Password-related backend error → password field becomes red.
        // Name-related backend error → name field becomes red.
        // Unknown error → general error box appears.

        return;
      }

      localStorage.setItem("token", data.token);

      // This stores the JWT returned by the backend.
      // The token remains stored even if the frontend is restarted.

      navigate("/home");

      // After successful signup, the user is moved to the Home page.

      setErrorMessage("");

      // Clears any remaining general error.
    } catch (error) {
      setErrorMessage("Could not connect to the backend");
      console.error(error);
    }

    // catch runs if the frontend cannot contact the backend.
    // For example, if the backend server is not running.
  };

  return (
    <>
      <style>
        {`
          .signup-page {
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

          /*
            .signup-page styles the full screen.

            min-height: 100vh
            makes the page at least as tall as the browser window.

            radial-gradient creates the soft blue shapes.

            linear-gradient creates the light-blue background.

            padding adds space around the page.
          */

          .signup-brand {
            position: absolute;
            top: 30px;
            left: 45px;

            display: flex;
            align-items: center;
            gap: 12px;
          }

          /*
            .signup-brand controls the TaskTracker logo area.

            position: absolute allows it to stay in the top-left.

            top and left control its position.

            display: flex places the logo and text beside each other.

            gap creates space between them.
          */

          .signup-brand-icon {
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

          /*
            .signup-brand-icon styles the blue square.

            width and height control its size.

            border-radius rounds the corners.

            background creates the blue gradient.

            flex centers the white checkmark inside it.

            box-shadow adds the soft blue shadow.
          */

          .signup-brand-name {
            font-size: 26px;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
          }

          /*
            .signup-brand-name styles the TaskTracker text.

            font-size controls its size.

            font-weight: 700 makes it bold.

            color sets the dark text color.

            margin: 0 removes the default heading margin.
          */

          .signup-card {
            width: 100%;
            max-width: 520px;

            border: none;
            border-radius: 28px;

            background: rgba(255, 255, 255, 0.96);

            box-shadow:
              0 24px 60px rgba(15, 23, 42, 0.12);

            padding: 44px 48px;
          }

          /*
            .signup-card styles the main white form card.

            width: 100% lets it use the available width.

            max-width prevents it from becoming too wide.

            border-radius creates rounded corners.

            background creates the white card.

            box-shadow adds depth around the card.

            padding creates space inside the card.
          */

          .signup-user-icon {
            width: 78px;
            height: 78px;

            margin: 0 auto 22px;

            border-radius: 50%;

            display: flex;
            align-items: center;
            justify-content: center;

            background: #eef4ff;
            color: #0d6efd;
          }

          /*
            .signup-user-icon styles the circular user-add icon.

            border-radius: 50% makes it circular.

            margin: 0 auto centers it horizontally.

            flex centers the SVG inside the circle.
          */

          .signup-title {
            color: #0f172a;
            font-weight: 700;
            font-size: 35px;
            text-align: center;
            margin-bottom: 8px;
          }

          /*
            .signup-title styles "Create your account".

            text-align centers it.

            font-weight makes it bold.

            margin-bottom creates space below it.
          */

          .signup-subtitle {
            color: #64748b;
            text-align: center;
            font-size: 17px;
            margin-bottom: 30px;
          }

          /*
            .signup-subtitle styles the small text below the title.
          */

          .signup-field-container {
            width: 100%;
            text-align: left;
          }

          /*
            .signup-field-container groups one field.

            It contains:
            label
            input
            error message
          */

          .signup-label {
            display: block;
            width: 100%;

            color: #0f172a;
            font-weight: 600;

            margin-bottom: 8px;
            text-align: left;
          }

          /*
            .signup-label styles the labels.

            display: block makes each label take its own line.

            text-align: left keeps labels on the left.
          */

          .signup-input-group {
            position: relative;
            width: 100%;
          }

          /*
            .signup-input-group lets icons be placed inside the input.

            position: relative becomes the reference point
            for absolutely positioned icons.
          */

          .signup-input-icon {
            position: absolute;

            left: 16px;
            top: 50%;

            transform: translateY(-50%);

            color: #64748b;

            z-index: 2;

            pointer-events: none;
          }

          /*
            .signup-input-icon positions the icon inside the input.

            left controls the distance from the left.

            top: 50% and translateY center it vertically.

            pointer-events: none prevents the icon from blocking clicks.
          */

          .signup-input {
            width: 100%;
            min-height: 56px;

            border-radius: 12px;

            padding-left: 48px;
            padding-right: 48px;

            border: 1px solid #cbd5e1;

            font-size: 16px;
          }

          /*
            .signup-input styles every input.

            padding-left leaves room for the left icon.

            padding-right leaves room for the password eye.

            min-height controls field height.

            border-radius rounds the corners.
          */

          .signup-input:focus {
            border-color: #0d6efd;

            box-shadow:
              0 0 0 4px rgba(13, 110, 253, 0.12);
          }

          /*
            This style appears when the user clicks inside an input.

            It gives the input a blue border and soft glow.
          */

          .signup-input.signup-input-error {
            border-color: #dc3545;
            background-color: #fff8f8;
          }

          /*
            This style is added only to an invalid input.

            border-color turns red.

            background-color adds a very light red background.
          */

          .signup-input.signup-input-error:focus {
            border-color: #dc3545;

            box-shadow:
              0 0 0 4px rgba(220, 53, 69, 0.12);
          }

          /*
            This keeps an invalid field red even while selected.
          */

          .signup-password-toggle {
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

          /*
            .signup-password-toggle positions the eye button
            inside the password field.

            right controls its distance from the right side.

            background: transparent removes the normal button background.
          */

          .signup-password-toggle:hover {
            color: #0d6efd;
          }

          /*
            This turns the eye icon blue when the mouse is over it.
          */

          .signup-field-error {
            color: #dc3545;
            text-align: left;
            font-size: 14px;

            margin-top: 7px;
            margin-bottom: 0;
          }

          /*
            .signup-field-error styles errors belonging to one input.

            Examples:
            Email is required
            Password must contain at least 8 characters
          */

          .signup-general-error {
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

          /*
            .signup-general-error styles errors that do not belong
            to one specific input.

            Example:
            Could not connect to the backend.
          */

          .signup-submit-button {
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

          /*
            .signup-submit-button styles the main Sign Up button.

            background creates the blue gradient.

            box-shadow adds the soft shadow.

            font-weight makes the text bold.
          */

          .signup-submit-button:hover {
            background: linear-gradient(
              135deg,
              #1d4ed8,
              #0b5ed7
            );
          }

          /*
            This makes the button slightly darker when hovered.
          */

          .signup-divider {
            display: flex;
            align-items: center;

            gap: 14px;

            color: #94a3b8;

            margin: 25px 0;
          }

          /*
            .signup-divider creates the row containing:
            line
            or
            line
          */

          .signup-divider::before,
          .signup-divider::after {
            content: "";

            flex: 1;
            height: 1px;

            background: #dbe2ea;
          }

          /*
            These pseudo-elements create the two horizontal lines
            around the word "or".
          */

          .signup-login-text {
            color: #334155;
            text-align: center;
            margin: 0;
          }

          /*
            .signup-login-text styles:
            Already have an account? Sign in
          */

          @media (max-width: 768px) {
            .signup-page {
              padding: 110px 16px 24px;
              justify-content: flex-start !important;
            }

            /*
              On small screens, extra top padding prevents
              the logo from overlapping the card.
            */

            .signup-brand {
              top: 24px;
              left: 24px;
            }

            /*
              Moves the logo closer to the screen edge
              on smaller screens.
            */

            .signup-brand-name {
              font-size: 22px;
            }

            /*
              Makes the brand text smaller on mobile.
            */

            .signup-card {
              padding: 32px 24px;
            }

            /*
              Reduces the card's inside spacing on small screens.
            */

            .signup-title {
              font-size: 29px;
            }

            /*
              Makes the title smaller so it fits better.
            */
          }
        `}
      </style>

      {/* This is the full-page container */}
      <div className="signup-page d-flex justify-content-center align-items-center position-relative">
        {/* This is the TaskTracker brand section */}
        <div className="signup-brand">
          {/* This is the blue logo square */}
          <div className="signup-brand-icon">
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
          <h1 className="signup-brand-name">
            TaskTracker
          </h1>
        </div>

        {/* This is the main signup form */}
        <form
          className="signup-card"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* This is the circular create-user icon */}
          <div className="signup-user-icon">
            <svg
              width="45"
              height="45"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="9"
                cy="7"
                r="4"
                stroke="currentColor"
                strokeWidth="1.8"
              />

              <path
                d="M2.5 19C2.5 15.4 5.3 12.8 9 12.8C11.1 12.8 12.9 13.6 14.1 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              <path
                d="M18 10V18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              <path
                d="M14 14H22"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* This is the main page heading */}
          <h2 className="signup-title">
            Create your account
          </h2>

          {/* This is the subtitle below the heading */}
          <p className="signup-subtitle">
            Sign up to get started with TaskTracker
          </p>

          {/* Full-name field section */}
          <div className="signup-field-container mb-3">
            {/* Full-name label */}
            <label
              htmlFor="signup-name"
              className="form-label signup-label"
            >
              {name_label}
            </label>

            {/* This container allows the icon to appear inside the input */}
            <div className="signup-input-group">
              {/* User icon inside the name field */}
              <span className="signup-input-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M5 20C5 16.1 8.1 13.5 12 13.5C15.9 13.5 19 16.1 19 20"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              {/* This input stores the user's full name */}
              <input
                id="signup-name"
                value={SignUpData.name}
                onChange={(event) => {
                  setSignUpData({
                    ...SignUpData,
                    name: event.target.value,
                  });

                  // Removes only the name error when the name changes
                  if (nameError) {
                    setNameError("");
                  }

                  // Removes a general error when the user edits a field
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                type="text"
                className={`form-control signup-input ${
                  nameError
                    ? "signup-input-error"
                    : ""
                }`}
                placeholder="Enter your full name"
              />
            </div>

            {/* This appears only when the name has an error */}
            {nameError && (
              <p className="signup-field-error">
                {nameError}
              </p>
            )}
          </div>

          {/* Email field section */}
          <div className="signup-field-container mb-3">
            {/* Email label */}
            <label
              htmlFor="signup-email"
              className="form-label signup-label"
            >
              {email_label}
            </label>

            {/* This container allows the email icon inside the input */}
            <div className="signup-input-group">
              {/* Email icon */}
              <span className="signup-input-icon">
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

              {/* This input stores the user's email */}
              <input
                id="signup-email"
                value={SignUpData.email}
                onChange={(event) => {
                  setSignUpData({
                    ...SignUpData,
                    email: event.target.value,
                  });

                  // Removes only the email error when the email changes
                  if (emailError) {
                    setEmailError("");
                  }

                  // Removes a general error when the user edits a field
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                type="email"
                className={`form-control signup-input ${
                  emailError
                    ? "signup-input-error"
                    : ""
                }`}
                placeholder="Enter your email"
              />
            </div>

            {/* This appears only when the email has an error */}
            {emailError && (
              <p className="signup-field-error">
                {emailError}
              </p>
            )}
          </div>

          {/* Password field section */}
          <div className="signup-field-container mb-2">
            {/* Password label */}
            <label
              htmlFor="signup-password"
              className="form-label signup-label"
            >
              {password_label}
            </label>

            {/* This container allows the lock and eye icons inside */}
            <div className="signup-input-group">
              {/* Lock icon */}
              <span className="signup-input-icon">
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

              {/* This input stores the password */}
              <input
                id="signup-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={SignUpData.password}
                onChange={(event) => {
                  setSignUpData({
                    ...SignUpData,
                    password: event.target.value,
                  });

                  // Removes only the password error when it changes
                  if (passwordError) {
                    setPasswordError("");
                  }

                  // Removes a general error when the user edits a field
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                className={`form-control signup-input ${
                  passwordError
                    ? "signup-input-error"
                    : ""
                }`}
                placeholder="Create a password"
              />

              {/* This button shows or hides the password */}
              <button
                type="button"
                className="signup-password-toggle"
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

            {/* This appears only when the password has an error */}
            {passwordError && (
              <p className="signup-field-error">
                {passwordError}
              </p>
            )}
          </div>

          {/* This displays a general backend or connection error */}
          {errorMessage && (
            <p className="signup-general-error">
              {errorMessage}
            </p>
          )}

          {/* This button submits the signup form */}
          <button
            type="submit"
            className="btn btn-primary signup-submit-button w-100 mt-4"
          >
            {sign_UpButton}
          </button>

          {/* This is the divider between signup and login */}
          <div className="signup-divider">
            <span>or</span>
          </div>

          {/* This link sends existing users to the login page */}
          <p className="signup-login-text">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-decoration-none fw-semibold"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default SignUp;