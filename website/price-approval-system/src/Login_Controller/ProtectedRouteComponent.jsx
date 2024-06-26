// ProtectedRoute.js

import { Navigate, useNavigate } from "react-router-dom";
import { useSession } from "./SessionContext";
import App from "../App/App"; // Your component for users with the RM role
import { backend_mvc } from "../util";
import BA from "../BA/App";
const ProtectedRoute = () => {
  const { session, setSession } = useSession();
  const navigate = useNavigate();

  if (session.loading) {
    return <div>Loading...</div>; // Or some loading component
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

      if (!response.ok) {
        throw new Error("Logout request failed");
      }

      const data = await response.json();
      console.log(data);

      if (data.loggedOut) {
        localStorage.removeItem("request_id");
        localStorage.removeItem("request_ids");
        setSession({
          loggedIn: false,
          role: null,
          region: null,
          employee_id: null,
        }); // Update session context
        navigate("/login"); // Redirect to login page
      } else {
        // Handle logout error
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Render the main app component
  return session.role === "BAM" ? <BA /> : <App logout={logout} />;
};

export default ProtectedRoute;
