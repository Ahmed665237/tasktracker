
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

interface SignUpList{
    sign_UpButton:string
    email_label:string
    password_label:string
    name_label:string
}
interface SignUpData {
  email: string;
  password: string;
  name:string
}// this is where the value of user will be held and validated
const SignUp = ({sign_UpButton,email_label,password_label,name_label}:SignUpList) => { // react only recieves one props object
   const handleSubmit = async ( // this fn runs when the form is submitted and event shows the submission of the form
    event: React.FormEvent<HTMLFormElement> // tells ype script where is  it comming from the form (html)
  ) => {
    event.preventDefault(); //submitting a request make the page reload this prevents it
    // and the browser can reload before finishing the request
  
    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/signup", // fetch sends an http request
        // the URL is your backend end point
        {
          method: "POST", // type of request
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ // converts to json text so it can be sent to the http
            email: SignUpData.email,
            password: SignUpData.password, // gets the current data validated by the user
            name : SignUpData.name
          }),
        }
      );
  
      const data = await response.json(); // wait till the backend sends a response
      if (!response.ok) {
        setErrorMessage(data.message);
         setTimeout(() => setErrorMessage(""), 3000); // makes a the error message disapear
        return;
    }
    setErrorMessage("");
    } catch (error) { // runs if the request fails
      alert("Could not connect to the backend");
      console.error(error);
    }
  };
  ///////////////////////////////////////////////////////////////////////////
  const [SignUpData, setSignUpData] = useState<SignUpData>({
  name:'',
  email: '',
  password: '',
  });
   const [errorMessage, setErrorMessage] = useState("");
   const [showPassword, setShowPassword] = useState(false);
  return (<>
  <form onSubmit={handleSubmit} noValidate>
  <div className="d-flex justify-content-center align-items-center min-vh-100">
    <div className="w-25"> 
      <div className="d-flex flex-column gap-3">
             <input
          value={SignUpData.name}
          onChange={(event)=>setSignUpData({...SignUpData,name:event.target.value})}
          type="email"
          className="form-control"
          placeholder={name_label}
        />
        <input
          value={SignUpData.email}
          onChange={(event)=>setSignUpData({...SignUpData,email:event.target.value})}
          type="email"
          className="form-control"
          placeholder={email_label}
        />

      <input
    type={showPassword ? "text" : "password"}
    value={SignUpData.password}
    onChange={(event) =>
      setSignUpData({
        ...SignUpData,
        password: event.target.value,
      })
    }
    className="form-control"
    placeholder="Password"
  />
  <button
    type="button"
    className="btn btn-outline-secondary"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? "Hide password" : "Show password"}
  </button>
  
    {errorMessage && (
    <p className="text-danger text-center mt-2">
      {errorMessage}
    </p>
)}
      </div>
      <button
        type="submit"
        className="btn btn-info btn-lg w-100 mt-4"
      >
        {sign_UpButton}
      </button>
    <Link to="/login" className="text-decoration-none">
  Already have an account? Sign in
</Link>
    </div>
  </div>
</form>
</>
  )
}
// button from bootstrap this is the signup button
// interface signuplist will be string values
// input fields below button password is type because to apear as dots and place holder is used to display data on input fields
// positions have been adjusted by  <div className="d-flex justify-content-center align-items-center min-vh-100"> till <div className="d-flex gap-5">
// the input of user credentials is value={email} and value={password}
// in usestate:
//  usestate start as empty stings as user didnt write anything yet
//  SignaUpData is the current stored
//  setSignUp updates the SignUp when user types email or password
// end usestate:
// link when clicked switches to the URL
export default SignUp
// adding the link to login in the end
// still have to put alerts if credentials are entered  wrongly