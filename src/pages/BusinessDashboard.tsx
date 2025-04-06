import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Service, ServiceFormData } from '../types/service';
import ServiceForm from '../components/services/ServiceForm';
import '../styles/business-dashboard.scss';

interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const BusinessDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchServices = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setServices(data || []);
      
      // Calculate stats
      const stats = (data || []).reduce((acc, service) => ({
        ...acc,
        total: acc.total + 1,
        [service.status]: acc[service.status] + 1
      }), { total: 0, pending: 0, approved: 0, rejected: 0 });
      
      setStats(stats);
    } catch (error: any) {
      console.error('Error fetching services:', error.message);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async (data: ServiceFormData) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error } = await supabase
        .from('services')
        .insert([{
          ...data,
          provider_id: userData.user.id,
          status: 'pending'
        }]);

      if (error) throw error;

      setShowForm(false);
      fetchServices();
    } catch (error: any) {
      console.error('Error adding service:', error.message);
      throw new Error('Failed to add service');
    }
  };

  const handleUpdateService = async (data: ServiceFormData) => {
    if (!editingService) return;

    try {
      const { error } = await supabase
        .from('services')
        .update(data)
        .eq('id', editingService.id);

      if (error) throw error;

      setShowForm(false);
      setEditingService(null);
      fetchServices();
    } catch (error: any) {
      console.error('Error updating service:', error.message);
      throw new Error('Failed to update service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchServices();
    } catch (error: any) {
      console.error('Error deleting service:', error.message);
      setError('Failed to delete service');
    }
  };

  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  if (showForm) {
    return (
      <div className="business-dashboard">
        <ServiceForm
          onSubmit={editingService ? handleUpdateService : handleAddService}
          initialData={editingService || undefined}
          onCancel={() => {
            setShowForm(false);
            setEditingService(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="business-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Business Dashboard</h1>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Services</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
          <div className="stat-card">
            <h3>Approved</h3>
            <p className="stat-value">{stats.approved}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-value">{stats.pending}</p>
          </div>
          <div className="stat-card">
            <h3>Rejected</h3>
            <p className="stat-value">{stats.rejected}</p>
          </div>
        </div>

        <div className="services-section">
          <header className="dashboard-header">
            <div className="header-content">
              <h1>Business Dashboard</h1>
              <div className="header-buttons">
                <button 
                  className="header-btn primary" 
                  onClick={() => navigate('/provider/bookings')}
                >
                  <BookmarksIcon />
                  <span>View Bookings</span>
                </button>
                <button 
                  className="header-btn secondary" 
                  onClick={() => setShowForm(true)}
                >
                  <AddCircleIcon />
                  <span>Add New Service</span>
                </button>
              </div>
            </div>
          </header>

          {error && <div className="error-message">{error}</div>}

          <div className="services-table">
            {loading ? (
              <div className="loading">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="no-services">No services added yet</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Price/Hour</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(service => (
                    <tr key={service.id}>
                      <td>{service.name}</td>
                      <td>{service.type}</td>
                      <td>{service.location}</td>
                      <td>${service.price_per_hour}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-icon" 
                          onClick={() => {
                            setEditingService(service);
                            setShowForm(true);
                          }}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleDeleteService(service.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
