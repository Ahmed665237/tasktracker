
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
  const [SignUpData, setSignUpData] = useState<SignUpData>({
  name:'',
  email: '',
  password: '',
  });
  return (<>
  <form>
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
        value={SignUpData.password}
        onChange={(event)=>setSignUpData({...SignUpData,password:event.target.value})}
          type="password"
          className="form-control"
          placeholder={password_label}
        />
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