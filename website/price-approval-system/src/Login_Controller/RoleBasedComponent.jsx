// RoleBasedComponent.js
import React from "react";
import { useSession } from "./SessionContext";
import AppAM from "../App/AccountManagerApp"; // Your component for users with the AM role
import AppBM from "../App/BusinessAdminApp"; // Your component for users with the BM role
import AppRM from "../App/App"; // Your component for users with the RM role
import AppNSM from "../App/ApproversAppNSM_HDSM";
import AppValidator from "../App/ValidatorApp";
import { backend_url } from "../util";

const RoleBasedComponent = () => {
  const { session } = useSession();

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

export default RoleBasedComponent;
