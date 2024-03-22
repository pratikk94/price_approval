// ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from './SessionContext';
import AppAM from '../App/AccountManagerApp'; // Your component for users with the AM role
import AppBM from '../App/BusinessAdminApp'; // Your component for users with the BM role
import AppRM from '../App/ApproversApp'; // Your component for users with the RM role
import AppNSM from '../App/ApproversAppNSM_HDSM'
import AppValidator from '../App/ValidatorApp';
import LoginScreen from './LoginScreen';
const ProtectedRoute = () => {
    const { session } = useSession();

    if (session.loading) {
        return <div>Loading...</div>; // Or some loading component
    }

    if (!session.loggedIn) {
        return <Navigate to="/login" replace />;
    }

    console.log(session.role);

    // Render different apps based on the role
    switch (session.role) {
        case 'AM':
            return <AppAM />;
        case 'RM':
            return <AppRM />;
        case 'NSM':
        case 'NSMT':
            return <AppNSM type="NSM"/>;
        case 'HDSM':
            return <AppNSM type="HDSM"/>;
        case 'VP':
        case 'Validator':
            return <AppValidator />;            
        case 'BAM':
            return <AppBM />;            
        default:
            return <Outlet />; // Or render some default page or component
    }
};

export default ProtectedRoute;
