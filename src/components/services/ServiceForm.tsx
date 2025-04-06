import React, { useState } from 'react';
import { ServiceFormData, ServiceType } from '../../types/service';
import '../../styles/service-form.scss';

interface ServiceFormProps {
  onSubmit: (data: ServiceFormData) => Promise<void>;
  initialData?: Partial<ServiceFormData>;
  onCancel: () => void;
}

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const SERVICE_TYPES: ServiceType[] = ['gym', 'co-working', 'banquet', 'cafe', 'other'];

const ServiceForm: React.FC<ServiceFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ServiceFormData>>({
    name: '',
    description: '',
    type: 'gym',
    image_url: undefined,
    location: '',
    price_per_hour: 0,
    opening_time: '09:00',
    closing_time: '17:00',
    available_days: [],
    max_capacity: 1,
    amenities: [],
    rules: [],
    ...(initialData || {})
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.name || !formData.description || !formData.location || !formData.price_per_hour) {
        throw new Error('Please fill in all required fields');
      }

      await onSubmit(formData as ServiceFormData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      available_days: prev.available_days?.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...(prev.available_days || []), day]
    }));
  };

  const handleArrayInput = (e: React.KeyboardEvent<HTMLInputElement>, field: 'amenities' | 'rules') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value) {
        setFormData(prev => ({
          ...prev,
          [field]: [...(prev[field] || []), value]
        }));
        e.currentTarget.value = '';
      }
    }
  };

  const removeArrayItem = (index: number, field: 'amenities' | 'rules') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="service-form-container">
      <form className="service-form" onSubmit={handleSubmit}>
      <h2>{initialData ? 'Edit Service' : 'Add New Service'}</h2>

      <div className="form-group">
        <label>Service Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
        />
      </div>

      <div className="form-group">
        <label>Service Type *</label>
        <select name="type" value={formData.type} onChange={handleChange}>
          {SERVICE_TYPES.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Image URL</label>
        <input
          type="url"
          name="image_url"
          value={formData.image_url || ''}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Location *</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Price per Hour (USD) *</label>
        <input
          type="number"
          name="price_per_hour"
          value={formData.price_per_hour}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Opening Time *</label>
          <input
            type="time"
            name="opening_time"
            value={formData.opening_time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Closing Time *</label>
          <input
            type="time"
            name="closing_time"
            value={formData.closing_time}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Available Days *</label>
        <div className="days-grid">
          {DAYS_OF_WEEK.map(day => (
            <label key={day} className="day-checkbox">
              <input
                type="checkbox"
                checked={formData.available_days?.includes(day)}
                onChange={() => handleDayToggle(day)}
              />
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Maximum Capacity *</label>
        <input
          type="number"
          name="max_capacity"
          value={formData.max_capacity}
          onChange={handleChange}
          min="1"
          required
        />
      </div>

      <div className="form-group">
        <label>Amenities (Press Enter to add)</label>
        <input
          type="text"
          placeholder="Add amenity..."
          onKeyDown={(e) => handleArrayInput(e, 'amenities')}
        />
        <div className="tags">
          {formData.amenities?.map((amenity, index) => (
            <span key={index} className="tag">
              {amenity}
              <button type="button" onClick={() => removeArrayItem(index, 'amenities')}>×</button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Rules (Press Enter to add)</label>
        <input
          type="text"
          placeholder="Add rule..."
          onKeyDown={(e) => handleArrayInput(e, 'rules')}
        />
        <div className="tags">
          {formData.rules?.map((rule, index) => (
            <span key={index} className="tag">
              {rule}
              <button type="button" onClick={() => removeArrayItem(index, 'rules')}>×</button>
            </span>
          ))}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Service' : 'Add Service'}
        </button>
      </div>
      </form>
    </div>
  );
};

export default ServiceForm;
