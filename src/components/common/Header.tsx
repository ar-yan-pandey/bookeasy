import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import '../../styles/header.scss';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
    <header className="main-header">
      <div className="header-left">
        <Link to="/services" className="logo">
          BookEasy
        </Link>
        <nav className="main-nav">
          <Link to="/services">Services</Link>
          <Link to="/my-bookings" className="bookings-link">
            <BookmarksIcon />
            <span>My Bookings</span>
          </Link>
        </nav>
      </div>
      <div className="header-right">
        <div className="user-info">
          <p className="user-email">{user?.email}</p>
          <p className="user-since">Member since {formatDate(user?.created_at || '')}</p>
        </div>
        <button className="logout-button" onClick={handleLogout} title="Logout">
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
