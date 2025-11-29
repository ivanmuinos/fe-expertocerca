export interface ServiceRequest {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string;
  contact_phone?: string;
  contact_email?: string;
  location_city: string;
  location_province: string;
  photos: string[];
  status: 'open' | 'closed' | 'resolved';
  created_at: string;
  updated_at: string;
  // Profile data from join
  profile_full_name?: string;
  profile_avatar_url?: string;
}

export interface ServiceRequestFormData {
  category: string;
  title: string;
  description: string;
  contact_phone?: string;
  contact_email?: string;
  location_city: string;
  location_province: string;
  photos?: string[]; // URLs after upload
}

export interface ServiceRequestFilters {
  category?: string;
  location_city?: string;
  location_province?: string;
  status?: 'open' | 'closed' | 'resolved';
}
