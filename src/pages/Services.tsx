import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Service, ServiceType } from '../types/service';
import ServicesHeader from '../components/services/ServicesHeader';
import ServiceFilters from '../components/services/ServiceFilters';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import '../styles/services.scss';

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ServiceType | 'all'>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    return services.filter(service => {
      // Search filter
      const matchesSearch = 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType = selectedType === 'all' || service.type === selectedType;

      // Price filter
      let matchesPrice = true;
      if (selectedPriceRange !== 'all') {
        const price = service.price_per_hour;
        const [min, max] = selectedPriceRange.split('-').map(p => p === '+' ? Infinity : Number(p));
        matchesPrice = price >= min && (max === Infinity ? true : price <= max);
      }

      return matchesSearch && matchesType && matchesPrice;
    });
  };

  if (loading) return <div className="loading">Loading services...</div>;
  if (error) return <div className="error">{error}</div>;

  const filteredServices = filterServices();

  return (
    <div className="services-page">
      <ServicesHeader />
      
      <div className="services-container">
        <div className="services-header-actions">
          <ServiceFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedPriceRange={selectedPriceRange}
            setSelectedPriceRange={setSelectedPriceRange}
          />
          <button 
            className="my-bookings-button" 
            onClick={() => navigate('/my-bookings')}
          >
            <BookmarksIcon />
            <span>My Bookings</span>
          </button>
        </div>

        <div className="services-grid">
          {loading ? (
            <div className="loading">Loading services...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : filteredServices.length === 0 ? (
            <div className="no-results">
              <h3>No services found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          ) : (
            filteredServices.map(service => (
              <div key={service.id} className="service-card" onClick={() => window.location.href = `/service/${service.id}`}>
                <div className="service-image">
                  <img src={service.image_url || '/placeholder-service.jpg'} alt={service.name} />
                  <div className="service-type-badge">{service.type}</div>
                </div>
                <div className="service-info">
                  <div className="service-header">
                    <h3>{service.name}</h3>
                    <span className="service-price">${service.price_per_hour}<span className="price-unit">/hr</span></span>
                  </div>
                  <div className="service-details">
                    <div className="detail-item">
                      <i className="fas fa-map-marker-alt" />
                      <span>{service.location}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-clock" />
                      <span>{service.opening_time} - {service.closing_time}</span>
                    </div>
                  </div>
                  <div className="service-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`fas fa-star ${i < Math.floor(service.rating || 0) ? 'filled' : ''}`} />
                      ))}
                    </div>
                    <span className="rating-count">{service.review_count || 0} reviews</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;
