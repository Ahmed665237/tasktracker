import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectDashboard from "./ProjectDashboard";
// home page is mainly responsible for chercking if user logged in before showing the dashboard or not

/*
  This interface describes the logged-in user returned by:

  GET /api/auth/me
*/
interface CurrentUser {
  id: number;
  name: string;
  email: string;
} // this is the logged user

function Home() {
  /*
    Stores the logged-in user returned by the backend.

    It starts as null because the frontend must first
    check the token and request the current user.
  */
  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  /*
    Allows the component to navigate between routes.
  */
  const navigate = useNavigate();

  /*
    Removes the JWT from the browser and returns
    the user to the login page after the user logs out
  */
  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };

  /*
    This effect checks the JWT and loads the current user.
  */
  useEffect(() => {
    const getCurrentUser = async () => {
      /*
        Reads the stored JWT.
      */
      const token =
        localStorage.getItem("token");

      /*
        No token means the user must log in.
      */
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        /*
          Sends the JWT to the protected endpoint.
        */
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

        /*
          Invalid or expired token.
        */
        if (!response.ok) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        /*
          Saves the logged-in user.
        */
        setCurrentUser(data.user);
      } catch (error) {
        console.error(
          "Could not get current user",
          error
        );
      }
    };

    getCurrentUser();
  }, [navigate]);

  /*
    Shows a temporary screen while the user is loading.
  */
  if (!currentUser) {
    return (
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{
          background:
            "linear-gradient(135deg, #f8fbff, #f1f7f8)",
          color: "#475569",
        }}
      >
        Checking login...
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          /*
            Styles the complete dashboard page.
          */
          .home-page {
            min-height: 100vh;
            background:
              radial-gradient(
                circle at top right,
                rgba(13, 148, 136, 0.09),
                transparent 28%
              ),
              linear-gradient(
                135deg,
                #f8fbff 0%,
                #f1f7f8 100%
              );
            color: #0f172a;
          }

          /*
            Styles the fixed top header.
          */
          .home-header {
            min-height: 78px;
            padding: 0 32px;
            background:
              rgba(255, 255, 255, 0.94);
            border-bottom:
              1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 20;
          }

          /*
            Places the logo and TaskTracker title together.
          */
          .home-brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          /*
            Styles the teal logo square.
          */
          .home-brand-icon {
            width: 42px;
            height: 42px;
            border-radius: 11px;
            background:
              linear-gradient(
                135deg,
                #0f9b9b,
                #087f8c
              );
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow:
              0 8px 20px
              rgba(8, 127, 140, 0.2);
          }

          /*
            Styles the TaskTracker text.
          */
          .home-brand-name {
            margin: 0;
            font-size: 25px;
            font-weight: 750;
            color: #0f172a;
          }

          /*
            Places the notification and Logout buttons together.
          */
          .home-header-actions {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          /*
            Styles the notification bell.
          */
          .notification-button {
            width: 44px;
            height: 44px;
            border:
              1px solid #d9e2ec;
            border-radius: 12px;
            background: white;
            color: #475569;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .notification-button:hover {
            border-color: #0f9b9b;
            color: #0f9b9b;
          }

          /*
            Styles the Logout button.
          */
          .logout-button {
            min-height: 44px;
            border:
              1px solid #0f9b9b;
            border-radius: 12px;
            background: white;
            color: #087f8c;
            padding: 0 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .logout-button:hover {
            background: #ecfeff;
          }

          @media (max-width: 700px) {
            .home-header {
              padding: 0 16px;
            }

            .home-brand-name {
              font-size: 21px;
            }

            .logout-button span {
              display: none;
            }

            .logout-button {
              width: 44px;
              padding: 0;
              justify-content: center;
            }
          }
        `}
      </style>

      <div className="home-page">
        {/* Top application header */}
        <header className="home-header">
          {/* Application logo and name */}
          <div className="home-brand">
            <div className="home-brand-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="3.5"
                  y="3.5"
                  width="17"
                  height="17"
                  rx="3"
                  stroke="white"
                  strokeWidth="2"
                />

                <path
                  d="M7.5 12L10.5 15L17 8.5"
                  stroke="white"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 className="home-brand-name">
              TaskTracker
            </h1>
          </div>

          {/* Header actions */}
          <div className="home-header-actions">
            {/* Notification design only for now */}
            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
            >
              🔔
            </button>

            {/* Removes the JWT and returns to Login */}
            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/*
          ProjectDashboard now owns the project area,
          project state, project modal, filters, and board.

          Home only sends the logged-in user's name so
          ProjectDashboard can display the welcome message.
        */}
        <ProjectDashboard
          currentUserName={currentUser.name}
        />
      </div>
    </>
  );
}

export default Home;