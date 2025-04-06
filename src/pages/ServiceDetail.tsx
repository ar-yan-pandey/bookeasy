import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import Calendar from 'react-calendar';

import 'react-calendar/dist/Calendar.css';
import '../styles/service-detail.scss';
import { Service } from '../types/service';
import { toast } from 'react-hot-toast';

interface BookingForm {
  customerName: string;
  phoneNumber: string;
  date: Date;
  startTime: string;
  duration: number;
  totalPrice: number;
  specialRequests?: string;
}

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: BookingForm) => void;
  selectedDate: Date;
  service: Service | null;
}

const BookingFormModal: React.FC<BookingFormModalProps> = ({ isOpen, onClose, onSubmit, selectedDate, service }) => {
  const [form, setForm] = useState<BookingForm>({
    customerName: '',
    phoneNumber: '',
    date: selectedDate,
    startTime: '',
    duration: 1,
    totalPrice: service?.price_per_hour || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Complete Your Booking</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Start Time</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Duration (hours)</label>
            <input
              type="number"
              min="1"
              max="8"
              value={form.duration}
              onChange={(e) => setForm({
                ...form,
                duration: parseInt(e.target.value),
                totalPrice: (service?.price_per_hour || 0) * parseInt(e.target.value)
              })}
              required
            />
          </div>
          <div className="price-display">
            Total Price: ${form.totalPrice}
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Confirm Booking</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    customerName: '',
    phoneNumber: '',
    date: new Date(),
    startTime: '',
    duration: 1,
    totalPrice: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setBookingForm(prev => ({
      ...prev,
      date
    }));
  };

  const handleNext = () => {
    if (bookingForm.date) {
      setIsModalOpen(true);
    } else {
      toast.error('Please select a date first');
    }
  };

  const calculateEndTime = (startTime: string, durationHours: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    date.setHours(date.getHours() + durationHours);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const handleModalSubmit = async (form: BookingForm) => {
    try {
      if (!service) {
        toast.error('Service not found');
        return;
      }

      // Get current auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user?.id) {
        toast.error('Please login to make a booking');
        return;
      }

      const endTime = calculateEndTime(form.startTime, form.duration);
      const formattedDate = form.date.toISOString().split('T')[0];

      // Validate time format
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(form.startTime)) {
        toast.error('Invalid time format');
        return;
      }

      // Create the booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          service_id: service.id,
          user_id: session.user.id,
          customer_name: form.customerName,
          phone_number: form.phoneNumber,
          booking_date: formattedDate,
          start_time: form.startTime,
          end_time: endTime,
          total_price: form.totalPrice,
          status: 'pending',
          special_requests: form.specialRequests || null
        });

      if (bookingError) {
        console.error('Booking error:', bookingError);
        toast.error('Failed to create booking. Please try again.');
        return;
      }

      toast.success('Booking created successfully!');
      navigate('/bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!service) return <div className="error">Service not found</div>;

  return (
    <div className="service-detail-container">
      {service ? (
        <div className="service-detail-layout">
          <div className="service-info-section">
            <div className="service-image">
              <img src={service.image_url || '/placeholder-service.jpg'} alt={service.name} />
              <div className="service-type">{service.type}</div>
            </div>
            <div className="service-details">
              <h1>{service.name}</h1>
              <p className="description">{service.description}</p>
              
              <div className="price-tag">
                <span className="amount">${service.price_per_hour}</span>
                <span className="unit">/hour</span>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <h4>Location</h4>
                    <p>{service.location}</p>
                  </div>
                </div>

                <div className="info-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <h4>Hours</h4>
                    <p>{service.opening_time} - {service.closing_time}</p>
                  </div>
                </div>

                <div className="info-item">
                  <i className="fas fa-users"></i>
                  <div>
                    <h4>Capacity</h4>
                    <p>Up to {service.max_capacity} people</p>
                  </div>
                </div>

                <div className="info-item">
                  <i className="fas fa-calendar-alt"></i>
                  <div>
                    <h4>Available Days</h4>
                    <p>{service.available_days.join(', ')}</p>
                  </div>
                </div>
              </div>

              {service.amenities && service.amenities.length > 0 && (
                <div className="amenities-section">
                  <h3>Amenities</h3>
                  <div className="amenities-list">
                    {service.amenities.map((amenity, index) => (
                      <div key={index} className="amenity-item">
                        <i className="fas fa-check-circle"></i>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {service.rules && service.rules.length > 0 && (
                <div className="rules-section">
                  <h3>Rules</h3>
                  <ul className="rules-list">
                    {service.rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="booking-section">
            <div className="calendar-container">
              <h2>Select Your Date</h2>
              <Calendar
                onChange={(value) => {
                  if (value instanceof Date) {
                    handleDateChange(value);
                  }
                }}
                value={bookingForm.date}
                minDate={new Date()}
                className="custom-calendar"
              />
              <button 
                className="btn-primary next-button"
                onClick={handleNext}
                disabled={!bookingForm.date}
              >
                Next
              </button>
            </div>
          </div>

          <BookingFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleModalSubmit}
            selectedDate={bookingForm.date}
            service={service}
          />
        </div>
      ) : (
        <div className="loading">Loading...</div>
      )}
    </div>
  );
};

export default ServiceDetail;
