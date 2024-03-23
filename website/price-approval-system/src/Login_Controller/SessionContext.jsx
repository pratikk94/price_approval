import React, { createContext, useContext, useState, useEffect } from "react";
import { backend_url } from "../util";

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({
    loading: true,
    loggedIn: false,
    employee_id: null,
    role: null,
  });

  useEffect(() => {
    // Function to check session status
    const checkSession = async () => {
      try {
        const response = await fetch(`${backend_url}api/session`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.loggedIn) {
          // Assuming 'employeeId' is part of the response when the session is valid
          setSession({
            loading: false,
            loggedIn: true,
            employee_id: data.employee_id, // Set employeeId from session data
            role: data.role,
          });
          // Set a timeout to automatically set loggedIn to false after 30 minutes
          setTimeout(() => {
            setSession((prevState) => ({
              ...prevState,
              loading: false,
              loggedIn: false,
            }));
            alert("Your session has expired. Please log in again.");
          }, 30 * 60 * 1000); // 1800000 milliseconds = 30 minutes
        } else {
          setSession({
            loading: false,
            loggedIn: false,
            employee_id: null,
            role: null,
          });
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setSession({
          loading: false,
          loggedIn: false,
          employee_id: null,
          role: null,
        });
      }
    };

    checkSession();

    // Set up for clear timeout
    const timeoutId = setTimeout(() => {
      setSession((prevState) => ({
        ...prevState,
        loading: false,
        loggedIn: false,
      }));
    }, 30 * 60 * 1000); // Set session timeout

    // Clear the timeout if the component unmounts
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};
