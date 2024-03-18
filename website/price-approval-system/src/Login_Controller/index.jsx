import React, { useState } from "react";
import App from "../AccountManagerApp";
import BusinessAdminApp from "../BusinessAdminApp";
import ApproversApp from "../ApproversApp";

function Login() {
  const [number, setNumber] = useState(1); // Default to rendering ComponentOne

  // Function to update the component number
  const handleChange = (e) => {
    setNumber(e);
  };

  return (
    <div>
      {number == 1 && <App changeScreen={handleChange} />}
      {number == 2 && <BusinessAdminApp changeScreen={handleChange} />}
      {number == 3 && <ApproversApp changeScreen={handleChange} />}
    </div>
  );
}

export default Login;
