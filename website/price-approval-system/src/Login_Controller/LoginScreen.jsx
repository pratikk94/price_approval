// LoginScreen.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "./SessionContext";
import { backend_mvc } from "../util";
import "./LoginPage.css";
import { Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import LoginPopup from "./LoginPopup";

const LoginScreen = () => {
  const [employeeId, setEmployeeId] = useState("");
  const { session, setSession } = useSession();
  const navigate = useNavigate();
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const handleLogin = async () => {
    if (employeeId === "") {
      setPopupMessage("Please enter your Employee ID to login to the system.");
      setPopupOpen(true);
      return;
    }

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
        setPopupMessage("Issue in Login. Contact business admin");
        setPopupOpen(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      setPopupMessage(
        "Please enter correct Employee ID to login to the system."
      );
      setPopupOpen(true);
    }
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
  };

  return (
    <div className="landing-container">
      <div style={{ height: "16%" }}></div>
      <Typography variant="h4" className="title">
        Price Approval System
      </Typography>
      <div className="content">
        <input
          type="text"
          placeholder="Employee ID"
          onChange={(e) => setEmployeeId(e.target.value)}
          value={employeeId}
          className="input-field"
        />
        <button className="submit-button" onClick={handleLogin}>
          Login
        </button>
      </div>
      <Card>
        <CardMedia
          component="video"
          src="background.mp4" // Use the correct protocol (http:// or https://)
          autoPlay
          muted
          loop
          disablePictureInPicture
          style={{ height: "84vh", width: "100vw" }} // Adjust the size as needed
        />
      </Card>
      <LoginPopup
        open={popupOpen}
        message={popupMessage}
        onClose={handleClosePopup}
      />
    </div>
  );
};

export default LoginScreen;
