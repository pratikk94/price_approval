import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSession } from "./SessionContext";
import App from "../App/App"; // Adjust the path if needed
import { backend_mvc } from "../util";

const ProtectedRoute = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  if (session.loading) {
    return <div>Loading...</div>;
  }

  if (!session.loggedIn) {
    return <Navigate to="/login" replace />;
  }

  const logout = async () => {
    console.log("Logging out");
    try {
      const response = await fetch(`${backend_mvc}api/logout`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout request failed");

      const data = await response.json();
      if (data.loggedOut) {
        localStorage.removeItem("session"); // Clear session from local storage

        setSession({
          loggedIn: false,
          role: null,
          region: null,
          employee_id: null,
        });
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return <App logout={logout} />;
};

export default ProtectedRoute;
