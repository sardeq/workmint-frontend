import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/index.css';

import Landing from './components/Landing';
import ClientDashboard from './components/ClientDashboard';
import FreelancerDashboard from './components/FreelancerDashboard';
import AdminDashboard from './components/AdminDashboard';

export const UserContext = createContext();

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleAuth = (role) => {
    const user = { role, name: `Demo ${role}` };
    setCurrentUser(user);
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      <Router>
        <Routes>
          <Route path="/" element={<Landing onLogin={handleAuth} />} />
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/freelancer" element={<FreelancerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;