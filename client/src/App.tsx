import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Pipelines from './pages/Pipelines/Pipelines';
import Analytics from './pages/Analytics/Analytics';
import Cleanup from './pages/Cleanup/Cleanup';
import Settings from './pages/Settings/Settings';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pipelines" element={<Pipelines />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/cleanup" element={<Cleanup />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export default App; 