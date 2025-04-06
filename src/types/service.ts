export type ServiceType = 'gym' | 'co-working' | 'banquet' | 'cafe' | 'other';
export type ServiceStatus = 'pending' | 'approved' | 'rejected';

export interface Service {
  id: string;
  created_at: string;
  updated_at: string;
  provider_id: string;
  name: string;
  description: string;
  type: ServiceType;
  image_url?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  price_per_hour: number;
  opening_time: string;
  closing_time: string;
  available_days: string[];
  max_capacity: number;
  status: ServiceStatus;
  amenities: string[] | null;
  rules: string[] | null;
  rating?: number;
  review_count?: number;
}

export interface ServiceFormData extends Omit<Service, 'id' | 'created_at' | 'updated_at' | 'provider_id' | 'status'> {}
