// RoleBasedComponent.js
import React from 'react';
import { useSession } from './SessionContext';
import AppAM from '../App/AccountManagerApp'; // Your component for users with the AM role
import AppBM from '../App/BusinessAdminApp'; // Your component for users with the BM role
import AppRM from '../App/ApproversApp'; // Your component for users with the RM role
import AppNSM from '../App/ApproversAppNSM_HDSM'
import AppValidator from '../App/ValidatorApp';

const RoleBasedComponent = () => {
    const { session } = useSession();

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

export default RoleBasedComponent;
