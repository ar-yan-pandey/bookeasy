import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './components/auth/AuthForm';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import MyBookings from './pages/MyBookings';
import ProviderBookings from './pages/ProviderBookings';
import BusinessDashboard from './pages/BusinessDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/global.scss';

const getDefaultRoute = (userType: string | null) => {
  if (!userType) return '/auth';
  switch (userType) {
    case 'admin': return '/admin';
    case 'provider': return '/business';
    default: return '/services';
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user, userType, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={
          user ? <Navigate to={getDefaultRoute(userType)} /> : <AuthForm />
        } />
        <Route path="/services" element={
          !user ? <Navigate to="/" /> :
          userType === 'user' ? <Services /> : 
          <Navigate to={getDefaultRoute(userType)} />
        } />
        <Route path="/service/:id" element={
          !user ? <Navigate to="/" /> :
          userType === 'user' ? <ServiceDetail /> : 
          <Navigate to={getDefaultRoute(userType)} />
        } />
        <Route path="/my-bookings" element={
          !user ? <Navigate to="/" /> :
          userType === 'user' ? <MyBookings /> : 
          <Navigate to={getDefaultRoute(userType)} />
        } />
        <Route path="/provider/bookings" element={
          !user ? <Navigate to="/" /> :
          userType === 'provider' ? <ProviderBookings /> : 
          <Navigate to={getDefaultRoute(userType)} />
        } />
        <Route path="/business" element={
          !user ? <Navigate to="/" /> :
          userType === 'provider' ? <BusinessDashboard /> : 
          <Navigate to={getDefaultRoute(userType)} />
        } />
        <Route path="/admin" element={
          !user ? <Navigate to="/" /> :
          userType === 'admin' ? <AdminDashboard /> : 
          <Navigate to={getDefaultRoute(userType)} />
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
