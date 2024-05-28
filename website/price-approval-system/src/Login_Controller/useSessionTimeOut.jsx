import { useEffect } from "react";
import { useSession } from "./SessionContext";

const useSessionTimeout = (timeoutDuration = 900000) => {
  // 15 minutes
  const { session, setSession } = useSession();

  useEffect(() => {
    let timeoutId;

    const handleActivity = () => {
      clearTimeout(timeoutId);
      if (session.loggedIn) {
        timeoutId = setTimeout(() => {
          setSession({ loading: false, loggedIn: false });
          alert("Session expired. Please log in again.");
        }, timeoutDuration);
      }
    };

    // Events to reset the timer
    document.addEventListener("mousemove", handleActivity);
    document.addEventListener("keydown", handleActivity);
    document.addEventListener("scroll", handleActivity);

    // Set the initial timeout
    handleActivity();

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousemove", handleActivity);
      document.removeEventListener("keydown", handleActivity);
      document.removeEventListener("scroll", handleActivity);
    };
  }, [session.loggedIn, setSession, timeoutDuration]);

  return null;
};
export default useSessionTimeout;
