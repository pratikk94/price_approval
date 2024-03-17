import React from "react";
import ReactDOM from "react-dom/client";
import App from "./AccountManagerApp.jsx";
import "./index.css";
import BusinessAdminApp from "./BusinessAdminApp";
import ApproversApp from "./ApproversApp";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <BusinessAdminApp /> */}
    {/* <App /> */}
    <ApproversApp />
  </React.StrictMode>
);
