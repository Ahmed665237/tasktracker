import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(null);

  const navigate = useNavigate(); // used to move the user to login if the token is invalid
  const handleLogout = () => {
  localStorage.removeItem("token"); // removes the saved JWT

  navigate("/login"); // sends the user back to the login page
};
// this is the log out component

  useEffect(() => {
    const getCurrentUser = async () => {
      // gets the stored JWT from the browser
      const token = localStorage.getItem("token");

      // if there is no token, the user must log in
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // sends the stored token to the protected backend endpoint
        const response = await fetch(
          "http://localhost:3000/api/auth/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        // this happens when the token is expired or invalid
        if (!response.ok) {
          localStorage.removeItem("token"); // removes the unusable token
          navigate("/login"); // sends the user to the login page
          return;
        }

        // stores the logged-in user returned by the backend
        setCurrentUser(data.user);
      } catch (error) {
        console.error("Could not get current user", error);
      }
    };

    getCurrentUser();
  }, [navigate]);

return (
  <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
    {currentUser ? (
      <>
        <h1>Welcome, {currentUser.name}</h1>

        <button
          type="button"
          className="btn btn-danger mt-3"
          onClick={handleLogout} // when clicked this activates navigate("/login") that removes the token from the brouser;
        >
          Logout
        </button>
      </>
    ) : (
      <p>Checking login...</p>
    )}
  </div>
);
}

export default Home;