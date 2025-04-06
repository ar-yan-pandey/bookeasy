import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { Service, ServiceType, ServiceStatus } from '../../types/service';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import '../../styles/service-management.scss';

interface ServiceWithProvider extends Service {
  providerEmail?: string;
}

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingService, setEditingService] = useState<ServiceWithProvider | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      // Disable RLS for admin to view all services
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get all services
      const { data: services, error: servicesError } = await supabase
        .rpc('get_services_with_provider_emails');

      if (servicesError) throw servicesError;

      // Get unique provider IDs
      const providerIds = Array.from(new Set((services || []).map((s: Service) => s.provider_id)));

      // Get provider emails
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', providerIds);

      // Map provider emails to services
      const servicesWithProviders = (services || []).map((service: Service) => ({
        ...service,
        providerEmail: profiles?.find(p => p.id === service.provider_id)?.email
      }));

      setServices(servicesWithProviders);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (serviceId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ status: newStatus })
        .eq('id', serviceId);

      if (error) throw error;
      
      // Update local state
      setServices(services.map(service => 
        service.id === serviceId ? { ...service, status: newStatus } : service
      ));
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      
      // Update local state
      setServices(services.filter(service => service.id !== serviceId));
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEdit = async (service: Service) => {
    if (!editingService) {
      setEditingService(service);
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .update({
          name: service.name,
          description: service.description,
          type: service.type,
          location: service.location,
          price_per_hour: service.price_per_hour,
          opening_time: service.opening_time,
          closing_time: service.closing_time,
          max_capacity: service.max_capacity,
          available_days: service.available_days,
          amenities: service.amenities,
          rules: service.rules
        })
        .eq('id', service.id);

      if (error) throw error;
      
      // Update local state
      setServices(services.map(s => 
        s.id === service.id ? service : s
      ));
      setEditingService(null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) return <div className="loading">Loading services...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="service-management">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Provider</th>
              <th>Type</th>
              <th>Location</th>
              <th>Price/Hour</th>
              <th>Hours</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id} className={`status-${service.status}`}>
                <td>
                  {editingService?.id === service.id ? (
                    <input
                      type="text"
                      value={editingService.name}
                      onChange={e => setEditingService({
                        ...editingService,
                        name: e.target.value
                      })}
                    />
                  ) : service.name}
                </td>
                <td>{service.providerEmail || service.provider_id}</td>
                <td>
                  {editingService?.id === service.id ? (
                    <select
                      value={editingService.type}
                      onChange={e => setEditingService({
                        ...editingService,
                        type: e.target.value as ServiceType
                      })}
                    >
                      <option value="gym">Gym</option>
                      <option value="co-working">Co-working Space</option>
                      <option value="banquet">Banquet Hall</option>
                      <option value="cafe">Cafe</option>
                      <option value="other">Other</option>
                    </select>
                  ) : service.type}
                </td>
                <td>
                  {editingService?.id === service.id ? (
                    <input
                      type="text"
                      value={editingService.location}
                      onChange={e => setEditingService({
                        ...editingService,
                        location: e.target.value
                      })}
                    />
                  ) : service.location}
                </td>
                <td>
                  {editingService?.id === service.id ? (
                    <input
                      type="number"
                      value={editingService.price_per_hour}
                      onChange={e => setEditingService({
                        ...editingService,
                        price_per_hour: parseFloat(e.target.value)
                      })}
                      min="0"
                      step="0.01"
                    />
                  ) : `$${service.price_per_hour.toFixed(2)}/hr`}
                </td>
                <td>
                  {editingService?.id === service.id ? (
                    <div className="time-inputs">
                      <input
                        type="time"
                        value={editingService.opening_time}
                        onChange={e => setEditingService({
                          ...editingService,
                          opening_time: e.target.value
                        })}
                      />
                      <input
                        type="time"
                        value={editingService.closing_time}
                        onChange={e => setEditingService({
                          ...editingService,
                          closing_time: e.target.value
                        })}
                      />
                    </div>
                  ) : (
                    `${service.opening_time?.substring(0, 5)} - ${service.closing_time?.substring(0, 5)}`
                  )}
                </td>
                <td className="text-center">
                  {editingService?.id === service.id ? (
                    <input
                      type="number"
                      value={editingService.max_capacity}
                      onChange={e => setEditingService({
                        ...editingService,
                        max_capacity: parseInt(e.target.value)
                      })}
                      min="1"
                    />
                  ) : service.max_capacity}
                </td>
                <td>
                  <select
                    value={service.status}
                    onChange={e => handleStatusChange(service.id, e.target.value as 'pending' | 'approved' | 'rejected')}
                    className={`status-badge ${service.status}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="actions">
                  {editingService?.id === service.id ? (
                    <>
                      <button 
                        onClick={() => handleEdit(editingService)} 
                        className="btn-save"
                        title="Save"
                      >
                        <CheckIcon sx={{ fontSize: '1.2em' }} />
                      </button>
                      <button 
                        onClick={() => setEditingService(null)} 
                        className="btn-cancel"
                        title="Cancel"
                      >
                        <CloseIcon sx={{ fontSize: '1.2em' }} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleEdit(service)} 
                        className="btn-edit"
                        title="Edit"
                      >
                        <EditIcon sx={{ fontSize: '1.2em' }} />
                      </button>
                      <button 
                        onClick={() => handleDelete(service.id)} 
                        className="btn-delete"
                        title="Delete"
                      >
                        <DeleteIcon sx={{ fontSize: '1.2em' }} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceManagement;
