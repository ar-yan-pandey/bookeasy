import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { CircularProgress, Chip, Select, MenuItem, FormControl } from '@mui/material';
import '../styles/provider-bookings.scss';

interface Booking {
  id: string;
  service_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  service: {
    name: string;
    price_per_hour: number;
  };
  user: {
    email: string;
  };
}

const ProviderBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(name, price_per_hour),
          user:profiles(email)
        `)
        .eq('service.provider_id', user?.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus as Booking['status'] }
          : booking
      ));
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="provider-bookings loading">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="provider-bookings">
      <h1>Manage Bookings</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="bookings-list">
        {bookings.length === 0 ? (
          <div className="no-bookings">
            <h3>No bookings found</h3>
            <p>When customers book your services, they will appear here.</p>
          </div>
        ) : (
          bookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <h3>{booking.service.name}</h3>
                <Chip 
                  label={booking.status} 
                  color={getStatusColor(booking.status) as any}
                  variant="outlined"
                />
              </div>
              
              <div className="booking-details">
                <div className="detail-item">
                  <span className="label">Customer:</span>
                  <span>{booking.user.email}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Date:</span>
                  <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Time:</span>
                  <span>{booking.start_time} - {booking.end_time}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Amount:</span>
                  <span>${booking.service.price_per_hour}/hr</span>
                </div>
              </div>
              
              <div className="booking-actions">
                <FormControl size="small">
                  <Select
                    value={booking.status}
                    onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                    variant="outlined"
                    disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirm</MenuItem>
                    <MenuItem value="cancelled">Cancel</MenuItem>
                    <MenuItem value="completed">Complete</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProviderBookings;
