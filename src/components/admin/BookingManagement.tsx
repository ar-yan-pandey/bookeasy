import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'react-hot-toast';
import '../../styles/booking-management.scss';

interface Booking {
  id: string;
  created_at: string;
  service_id: string;
  user_id: string;
  customer_name: string;
  phone_number: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_price: number;
  special_requests?: string;
  service?: {
    name: string;
    type: string;
  };
  user?: {
    email: string;
  };
}

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:service_id (
            name,
            type
          ),
          user:user_id (
            email
          )
        `)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, status } : booking
      ));
      toast.success(`Booking ${status} successfully`);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  };

  const deleteBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBookings(bookings.filter(booking => booking.id !== id));
      toast.success('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  const filteredBookings = bookings.filter(booking => 
    filter === 'all' ? true : booking.status === filter
  );

  return (
    <div className="booking-management">
      <div className="header">
        <h1>Booking Management</h1>
        <div className="filters">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading bookings...</div>
      ) : (
        <div className="bookings-grid">
          {filteredBookings.map(booking => (
            <div key={booking.id} className={`booking-card ${booking.status}`}>
              <div className="booking-header">
                <h3>{booking.service?.name}</h3>
                <span className={`status-badge ${booking.status}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-details">
                <div className="detail-item">
                  <span className="label">Customer:</span>
                  <span>{booking.customer_name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Phone:</span>
                  <span>{booking.phone_number}</span>
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
                  <span className="label">Price:</span>
                  <span>${booking.total_price}</span>
                </div>
                {booking.special_requests && (
                  <div className="detail-item">
                    <span className="label">Special Requests:</span>
                    <span>{booking.special_requests}</span>
                  </div>
                )}
              </div>

              <div className="booking-actions">
                {booking.status === 'pending' && (
                  <button
                    className="confirm-btn"
                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                  >
                    Confirm
                  </button>
                )}
                {booking.status === 'confirmed' && (
                  <button
                    className="complete-btn"
                    onClick={() => updateBookingStatus(booking.id, 'completed')}
                  >
                    Complete
                  </button>
                )}
                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                  <button
                    className="cancel-btn"
                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                  >
                    Cancel
                  </button>
                )}
                <button
                  className="delete-btn"
                  onClick={() => deleteBooking(booking.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
