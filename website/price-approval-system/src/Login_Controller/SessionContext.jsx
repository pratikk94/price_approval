// SessionContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({ loading: true, loggedIn: false });

  // Assume you fetch session data here and update the session state accordingly
  // This is just an example
  useEffect(() => {
    // Simulate a session fetch
    setTimeout(() => {
      setSession({ loading: false, loggedIn: false }); // Update with actual session data
    }, 1000);
  }, []);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
