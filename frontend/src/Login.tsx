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

  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false); // the password visibilty icon state

  const navigate = useNavigate(); // used to move the user to another page

  const handleSubmit = async (
    // this fn runs when the form is submitted and event shows the submission of the form
    event: React.FormEvent<HTMLFormElement> // tells type script where is it comming from the form (html)
  ) => {
    event.preventDefault(); // submitting a request makes the page reload, this prevents it
    // and the browser can reload before finishing the request

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
      <form onSubmit={handleSubmit} noValidate>
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="w-50">
            <div className="d-flex gap-4">
              <input
                value={loginData.email}
                onChange={(event) =>
                  setLoginData({
                    ...loginData,
                    email: event.target.value,
                  })
                }
                type="email"
                className="form-control"
                placeholder={email_label}
              />

              <input
                type={showPassword ? "text" : "password"}
                value={loginData.password}
                onChange={(event) =>
                  setLoginData({
                    ...loginData,
                    password: event.target.value,
                  })
                }
                className="form-control"
                placeholder={password_label}
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide password" : "Show password"}
              </button>
            </div>

            {errorMessage && (
              <p className="text-danger text-center mt-2">
                {errorMessage}
              </p>
            )}

            <div className="d-flex flex-column align-items-center mt-4">
              <button
                type="submit"
                className="btn btn-info btn-lg w-50"
              >
                {sign_inButton}
              </button>

              <Link
                to="/signup"
                className="text-decoration-none mt-3"
              >
                Don&apos;t have an account? Sign up
              </Link>
            </div>
          </div>
        </div>
      </form>
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