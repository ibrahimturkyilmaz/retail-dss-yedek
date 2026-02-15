import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Stores from './pages/Stores';
import Transfers from './pages/Transfers';
import Simulations from './pages/Simulations';

// Placeholder Pages
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import SqlPlayground from './components/SqlPlayground';

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            {/* Ana sayfa dashboard'a yönlensin (veya direkt dashboard component render edilsin) */}
            <Route index element={<Dashboard />} />

            <Route path="simulations" element={<Simulations />} />
            <Route path="stores" element={<Stores />} />
            <Route path="transfers" element={<Transfers />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="playground" element={<SqlPlayground />} />
            <Route path="settings" element={<Settings />} />

            {/* 404 - Redirect to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </UIProvider>
    </AuthProvider>
  );
}

export default App;
