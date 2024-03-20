import React, { useState } from "react";
import App from "../App/AccountManagerApp";
import BusinessAdminApp from "../App/BusinessAdminApp";
import ApproversApp from "../App/ApproversApp";
import ApproversNSM from "../App/ApproversAppNSM_HDSM";
import ValidatorApp from "../App/ValidatorApp";

function Login() {
  const [number, setNumber] = useState(1); // Default to rendering ComponentOne

  // Function to update the component number
  const handleChange = (e) => {
    if (e < 6 && e > 0) setNumber(e);
  };

  return (
    <div>
      {number == 1 && <App changeScreen={handleChange} />}
      {number == 2 && <BusinessAdminApp changeScreen={handleChange} />}
      {number == 3 && <ApproversApp changeScreen={handleChange} />}
      {number == 4 && <ApproversNSM changeScreen={handleChange} />}
      {number == 5 && <ValidatorApp changeScreen={handleChange} />}
    </div>
  );
}

export default Login;
