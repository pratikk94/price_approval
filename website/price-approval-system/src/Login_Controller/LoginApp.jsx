// App.js or wherever your routing is defined
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './SessionContext';
import ProtectedRoute from './ProtectedRouteComponent';
import LoginScreen from './LoginScreen';
import RoleBasedComponent from './RoleBasedComponent';
const App = () => {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes> {/* Use Routes instead of Switch */}
          <Route path="/login" element={<LoginScreen />} />
          <Route element={<ProtectedRoute />}>
            {/* Nested route for role-based component */}
            <Route path="/" element={<RoleBasedComponent />} />
            {/* You can add more protected routes here */}
          </Route>
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
};

export default App;
