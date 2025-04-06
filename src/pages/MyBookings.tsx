import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import '../styles/my-bookings.scss';

interface Booking {
  id: string;
  service_id: string;
  customer_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
  service: {
    name: string;
    image_url: string;
  };
}

interface QRModalProps {
  bookingId: string;
  onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ bookingId, onClose }) => {
  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <h3>Booking QR Code</h3>
        <div className="qr-code">
          <QRCodeSVG
            value={bookingId}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
        <p className="booking-id">Booking ID: {bookingId}</p>
      </div>
    </div>
  );
};

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      if (!user) return;

      const { data, error }: { data: Booking[] | null; error: any } = await supabase
        .from('bookings')
        .select('*, service:service_id (name, image_url)')
        .eq('user_id', user.id)
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading your bookings...</div>;
  }

  return (
    <div className="my-bookings-container">
      <h1>My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You haven't made any bookings yet.</p>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="service-image">
                <img src={booking.service.image_url || '/placeholder-service.jpg'} alt={booking.service.name} />
              </div>
              <div className="booking-details">
                <h3>{booking.service.name}</h3>
                <p className="date">{formatDate(booking.booking_date)}</p>
                <p className="time">{booking.start_time} - {booking.end_time}</p>
                <p className="price">${booking.total_price}</p>
                <div className={`status ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </div>
                <button 
                  className="qr-button"
                  onClick={() => setSelectedBooking(booking.id)}
                >
                  Display QR
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBooking && (
        <QRModal 
          bookingId={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
        />
      )}
    </div>
  );
};

export default MyBookings;
