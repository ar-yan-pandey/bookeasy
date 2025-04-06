import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import ServiceManagement from '../components/admin/ServiceManagement';
import BookingManagement from '../components/admin/BookingManagement';
import '../styles/admin-dashboard.scss';

type DashboardTab = 'services' | 'bookings';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('services');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      
      case 'services':
        return (
          <div className="tab-content">
            <h2>Service Management</h2>
            <ServiceManagement />
          </div>
        );
      case 'bookings':
        return (
          <div className="tab-content">
            <h2>Booking Management</h2>
            <p>Booking management features coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          
          <button
            className={`nav-button ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            🏢 Service Management
          </button>
          <button
            className={`nav-button ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            📅 Booking Management
          </button>
        </nav>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">0</p>
          </div>
          <div className="stat-card">
            <h3>Pending Services</h3>
            <p className="stat-value">0</p>
          </div>
          <div className="stat-card">
            <h3>Active Services</h3>
            <p className="stat-value">0</p>
          </div>
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p className="stat-value">0</p>
          </div>
        </div>

        <div className="dashboard-main">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
