import { createContext, useContext, useState, useEffect } from "react";

const SessionContext = createContext({
  session: { loading: true, loggedIn: false },
  setSession: () => {},
});

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({ loading: true, loggedIn: false });

  useEffect(() => {
    const savedSession = localStorage.getItem("session");
    console.log("Saved session:", savedSession);
    if (savedSession) {
      setSession({ ...JSON.parse(savedSession), loading: false });
    } else {
      setSession((s) => ({ ...s, loading: false }));
    }
  }, []);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
