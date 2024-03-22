// App.js or wherever your routing is defined
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './SessionContext';
import ProtectedRoute from './ProtectedRouteComponent';
import LoginScreen from './LoginScreen';
import AppAM from '../App/AccountManagerApp'; // Your protected home page component

const App = () => {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes> {/* Use Routes instead of Switch */}
          <Route path="/login" element={<LoginScreen />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute> {/* ProtectedRoute must return a Route element */}
                <AppAM />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
};

export default App;
