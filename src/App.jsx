import React, { useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/index.css';

import { WorkspaceProvider } from './data/WorkspaceContext';
import Landing from './components/Landing';
import ClientDashboard from './pages/client/ClientDashboard';
import FreelancerDashboard from './pages/Freelancer/FreelancerDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';

export const UserContext = createContext();

const DEMO_USERS = {
  client: { name: 'Rana Haddad', company: 'TechCorp' },
  freelancer: { name: 'Sadeq Odeh', company: null },
  admin: { name: 'Workmint Ops', company: null },
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleAuth = (role) => {
    setCurrentUser({ id: `USR-${role}`, role, ...DEMO_USERS[role] });
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      <WorkspaceProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing onLogin={handleAuth} />} />
            <Route path="/client" element={<ClientDashboard />} />
            <Route path="/freelancer" element={<FreelancerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </WorkspaceProvider>
    </UserContext.Provider>
  );
}

export default App;