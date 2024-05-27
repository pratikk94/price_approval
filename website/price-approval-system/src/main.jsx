import React from "react";
import ReactDOM from "react-dom/client";
import "./App/index.css";
import App from "./Login_Controller/LoginApp";
import { SessionProvider } from "./Login_Controller/SessionContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <BusinessAdminApp /> */}
    {/* <App /> */}
    {/* <ApproversApp /> */}
    <SessionProvider>
      <App />
    </SessionProvider>
  </React.StrictMode>
);
