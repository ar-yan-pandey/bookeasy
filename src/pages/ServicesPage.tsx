import React from 'react';
import { supabase } from '../config/supabase';
import '../styles/services.scss';

const ServicesPage: React.FC = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="services-page">
      <header className="services-header">
        <h1>Available Services</h1>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </header>
      
      <div className="services-grid">
        <div className="service-card">
          <div className="service-icon">🏋️</div>
          <h3>Gyms</h3>
          <p>Book fitness centers and training spaces</p>
        </div>
        
        <div className="service-card">
          <div className="service-icon">💼</div>
          <h3>Co-working Spaces</h3>
          <p>Find your perfect workspace</p>
        </div>
        
        <div className="service-card">
          <div className="service-icon">🎉</div>
          <h3>Banquet Halls</h3>
          <p>Perfect venues for your events</p>
        </div>
        
        <div className="service-card">
          <div className="service-icon">☕</div>
          <h3>Cafes</h3>
          <p>Book cafe spaces for meetings</p>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
