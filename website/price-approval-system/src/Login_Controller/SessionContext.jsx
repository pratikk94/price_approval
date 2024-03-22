// SessionContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { backend_url } from '../util';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
    const [session, setSession] = useState({ loading: true, loggedIn: false });

    useEffect(() => {
        // Function to check session status
        const checkSession = async () => {
            try {
                const response = await fetch(`${backend_url}api/session`, { credentials: 'include' });
                const data = await response.json();
                if (data.loggedIn) {
                    setSession({ loading: false, loggedIn: true , role: data.role });
                    // Set a timeout to automatically set loggedIn to false after 1 minute
                    setTimeout(() => {
                        setSession({ loading: false, loggedIn: false });
                        alert('Your session has expired. Please log in again.');
                    }, 10000); // 60000 milliseconds = 1 minute
                } else {
                    setSession({ loading: false, loggedIn: false });
                }
            } catch (error) {
                console.error('Error checking session:', error);
                setSession({ loading: false, loggedIn: false });
            }
        };

        checkSession();

        // Clear the timeout if the component unmounts
        return () => clearTimeout();
    }, []);

    return <SessionContext.Provider value={{ session, setSession }}>{children}</SessionContext.Provider>;
};
