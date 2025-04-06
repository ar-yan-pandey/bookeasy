import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import LogoutIcon from '@mui/icons-material/Logout';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import '../../styles/services-header.scss';

const ServicesHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <header className="services-header">
      <div className="greeting-section">
        <h1>{getGreeting()}</h1>
        <p className="welcome-text">Welcome back to BookEasy</p>
      </div>
      <div className="user-section">
        <div className="user-info">
          <p className="user-email">{user?.email}</p>
          <p className="user-since">Member since {formatDate(user?.created_at || '')}</p>
        </div>
        
        {userType === 'provider' && (
          <Link to="/provider/bookings" className="nav-link">
            <BookmarksIcon />
            <span>Manage Bookings</span>
          </Link>
        )}
        <button className="logout-button" onClick={handleLogout} title="Logout">
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default ServicesHeader;
