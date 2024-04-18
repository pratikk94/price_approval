// ProtectedRoute.js
import React from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useSession } from "./SessionContext";
import AppAM from "../App/AccountManagerApp"; // Your component for users with the AM role
import AppBM from "../App/BusinessAdminApp"; // Your component for users with the BM role
import AppRM from "../App/ApproversApp"; // Your component for users with the RM role
import AppNSM from "../App/ApproversAppNSM_HDSM";
import AppValidator from "../App/ValidatorApp";
import { backend_url } from "../util";

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
    const response = await fetch(`${backend_url}api/logout`, {
      credentials: "include",
    });
    const data = await response.json();
    console.log(data);
    if (data.loggedOut) {
      localStorage.removeItem("request_id");
      localStorage.removeItem("request_ids");
      setSession({ loggedIn: false, role: null }); // Update session context
      navigate("/login"); // Redirect to login page
    } else {
      // Handle logout error
      console.error("Logout failed");
    }
  };
  // Render different apps based on the role
  switch (session.role) {
    case "AM":
      return <AppAM logout={logout} />;
    case "RM":
      return <AppRM logout={logout} />;
    case "NSM":
    case "NSMT":
      return <AppNSM type="NSM" logout={logout} />;
    case "HDSM":
      return <AppNSM type="HDSM" logout={logout} />;
    case "VP":
    case "Validator":
      return <AppValidator logout={logout} />;
    case "BAM":
      return <AppBM logout={logout} />;
    default:
      return <Outlet />; // Or render some default page or component
  }
};

export default ProtectedRoute;
