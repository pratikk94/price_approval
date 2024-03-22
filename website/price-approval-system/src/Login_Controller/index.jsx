// LoginPage.js
import React, { useState } from 'react';
import { useSession } from './SessionContext';
import { useNavigate } from 'react-router-dom';
import { backend_url } from '../util';
const LoginPage = () => {
    const [employeeId, setEmployeeId] = useState('');
    const { setSession } = useSession();
    const navigate = useNavigate();
    const handleLogin = async () => {
        // Implement your login logic here, typically involving a fetch request
        const response = await fetch(`${backend_url}api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employee_id: employeeId }),
            credentials: 'include',
        });
        const data = await response.json();
        if (data.loggedIn) {
            setSession({ loading: false, loggedIn: true });
            navigate('/'); // Redirect to the home page after login
        } else {
            alert('Login failed');
        }
    };

    return (
        <div>
            <input type="text" placeholder="Employee ID" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default LoginPage;
