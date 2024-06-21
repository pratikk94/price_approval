import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "./SessionContext";
import { backend_mvc } from "../util";
import image from "/2869279.jpg";
const LoginScreen = () => {
  const [employeeId, setEmployeeId] = useState("");
  const { session, setSession } = useSession();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch(`${backend_mvc}api/login/${employeeId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      if (data.loggedIn) {
        const newSession = {
          loggedIn: true,
          role: data.role,
          region: data.region,
          employee_id: employeeId,
        };
        localStorage.setItem("session", JSON.stringify(newSession)); // Save session to local storage

        setSession({
          ...session,
          loggedIn: true,
          role: data.role,
          region: data.region,
          employee_id: employeeId,
        });
        navigate("/");
      } else {
        alert("Issue in Login. Contact business admin");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(
        "There was an issue with the login process. Please try again later."
      );
    }
  };

  return (
    <div style={{ backgroundImage: `url(${image})` }}>
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
