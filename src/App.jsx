import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Landing from './components/Landing';
import ClientDashboard from './components/ClientDashboard';
import FreelancerDashboard from './components/FreelancerDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleAuth = (role) => {
    setCurrentUser({ role: role, name: `Demo ${role}` });
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing onLogin={handleAuth} />} />
        <Route path="/client" element={<ClientDashboard user={currentUser} />} />
        <Route path="/freelancer" element={<FreelancerDashboard user={currentUser} />} />
        <Route path="/admin" element={<AdminDashboard user={currentUser} />} />
      </Routes>
    </Router>
  );
}

export default App;