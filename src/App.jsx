import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/index.css';

import Landing from './components/Landing';
import AuthPage from './pages/auth/AuthPage';
import ClientDashboard from './pages/client/ClientDashboard';
import FreelancerDashboard from './pages/Freelancer/FreelancerDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';

const HOME_FOR = {
  client: '/client',
  freelancer: '/freelancer',
  admin: '/admin',
};

const savedUser = () => {
  const saved = localStorage.getItem('user');
  return saved ? JSON.parse(saved) : null;
};

function App() {
  const [user, setUser] = useState(savedUser);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (changes) => {
    const next = { ...user, ...changes };
    setUser(next);
    localStorage.setItem('user', JSON.stringify(next));
  };

  const protectedPage = (role, page) => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== role) return <Navigate to={HOME_FOR[user.role] || '/'} replace />;
    return page;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthPage mode="login" user={user} onLogin={handleLogin} />} />
        <Route path="/register" element={<AuthPage mode="register" user={user} onLogin={handleLogin} />} />

        <Route
          path="/client"
          element={protectedPage('client', <ClientDashboard user={user} onLogout={handleLogout} />)}
        />
        <Route
          path="/freelancer"
          element={protectedPage(
            'freelancer',
            <FreelancerDashboard user={user} onLogout={handleLogout} onUpdateUser={updateUser} />
          )}
        />
        <Route
          path="/admin"
          element={protectedPage('admin', <AdminDashboard user={user} onLogout={handleLogout} />)}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
