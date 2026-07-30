
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

interface LoginList{
    sign_inButton:string
    email_label:string
    password_label:string
}
interface LoginData {
  email: string;
  password: string;
}// this is where the value of user will be held and validated
const Login = ({sign_inButton,email_label,password_label}:LoginList) => { // react only recieves one props object
  const [loginData, setLoginData] = useState<LoginData>({
  email: '',
  password: '',
  });
  return (<>
  <form>
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
          value={loginData.password}
          onChange={(event) =>
            setLoginData({
              ...loginData,
              password: event.target.value,
            })
          }
          type="password"
          className="form-control"
          placeholder={password_label}
        />
      </div>
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
  )
}
// button from bootstrap this is the login button
// interface loginlist will be string values
// input fields below button password is type because to apear as dots and place holder is used to display data on input fields
// positions have been adjusted by  <div className="d-flex justify-content-center align-items-center min-vh-100"> till <div className="d-flex gap-5">
// the input of user credentials is value={email} and value={password}
// in usestate:
//  usestate start as empty stings as user didnt write anything yet
//  LoginData is the current stored
//  setlogin updates the login when user types email or password
// end usestate:
/* on change: what does it do ---> means when input of user changes run this fn
event.target.value gets what the user typed. ex'ahmed'
...loginData keeps the existing password.
email: event.target.value replaces only the email.
setLoginData saves the updated object. as it calls setlogindaata to update the state*/ 
// form is used so when i make the type button submit all credentials are submitted together
export default Login
// creating a userstate where we could recieve input
// adding the link to sign up in the end
// still have to put alerts if credentials are entered  wrongly