import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-forest-950 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-limeAccent-400 border-t-transparent animate-spin"></div>
        <p className="text-slate-400 text-sm animate-pulse">Syncing attention profile...</p>
      </div>
    );
  }

  if (!user) {
    // Force redirect to login page
    return <Navigate to="/login" replace />;
  }

  // Wrap the protected pages inside the desktop/mobile Navigation Layout
  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;
