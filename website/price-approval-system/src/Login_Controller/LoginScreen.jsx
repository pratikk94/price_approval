import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "./SessionContext";
import { backend_mvc } from "../util";

const LoginScreen = () => {
  const [employeeId, setEmployeeId] = useState("");
  const { setSession } = useSession();
  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log(employeeId);
    console.log(JSON.stringify({ employee_id: employeeId }));

    try {
      const response = await fetch(`${backend_mvc}api/login/${employeeId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log(data);

      if (data.loggedIn) {
        setSession({
          loggedIn: true,
          role: data.role,
          region: data.region,
          employee_id: employeeId,
        });
        navigate("/"); // Navigate to the home page
      } else {
        alert("Issue in Login. Contact business admin");
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      alert(
        "There was an issue with the login process. Please try again later."
      );
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Employee ID"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginScreen;
