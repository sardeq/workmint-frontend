import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/index.css';

import { AuthProvider, UserContext } from './data/AuthContext';
import { WorkspaceProvider } from './data/WorkspaceContext';

import Landing from './components/Landing';
import AuthPage from './pages/auth/AuthPage';
import ClientDashboard from './pages/client/ClientDashboard';
import FreelancerDashboard from './pages/Freelancer/FreelancerDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';


export { UserContext };

const HOME_FOR = { client: '/client', freelancer: '/freelancer', admin: '/admin' };

const ProtectedRoute = ({ role, children }) => {
  const { currentUser } = useContext(UserContext);
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== role) return <Navigate to={HOME_FOR[currentUser.role] || '/'} replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />

            <Route
              path="/client"
              element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>}
            />
            <Route
              path="/freelancer"
              element={<ProtectedRoute role="freelancer"><FreelancerDashboard /></ProtectedRoute>}
            />
            <Route
              path="/admin"
              element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;