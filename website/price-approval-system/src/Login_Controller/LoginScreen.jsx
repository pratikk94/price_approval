import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from './SessionContext';
import { backend_url } from '../util';

const LoginScreen = () => {
  const [employeeId, setEmployeeId] = useState('');
  const { setSession } = useSession();
  const navigate = useNavigate();

  const handleLogin = async () => {
    const response = await fetch(`${backend_url}api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_id: employeeId }),
      credentials: 'include',
    });
    const data = await response.json();
    if (data.loggedIn) {
      setSession({ loggedIn: true, role: data.role });
      navigate('/'); // Navigate to the home page
    } else {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Employee ID"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginScreen;
