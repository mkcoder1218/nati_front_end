import api from "@/lib/api";

export interface Office {
  office_id: string;
  name: string;
  type?: string;
  description?: string;
  address: string;
  contact_info?: string;
  operating_hours?: string;
  phone_number?: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  parent_office_id?: string;
  average_rating?: number;
  review_count?: number;
  assigned_official_id?: string;
  assigned_official_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOfficeData {
  name: string;
  type: string;
  description?: string;
  address: string;
  contact_info: string;
  operating_hours: string;
  phone_number?: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  parent_office_id?: string;
  assigned_official_id?: string;
}

export interface UpdateOfficeData {
  name?: string;
  type?: string;
  description?: string;
  address?: string;
  contact_info?: string;
  operating_hours?: string;
  phone_number?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  parent_office_id?: string;
  assigned_official_id?: string;
}

const OfficeService = {
  // Get all offices
  getAllOffices: async (): Promise<Office[]> => {
    const response = await api.get("/offices");
    return response.data.data.offices;
  },

  // Get office by ID
  getOfficeById: async (officeId: string): Promise<Office> => {
    const response = await api.get(`/offices/${officeId}`);
    return response.data.data.office;
  },

  // Create a new office (admin/official only)
  createOffice: async (data: CreateOfficeData): Promise<Office> => {
    const response = await api.post("/offices", data);
    return response.data.data.office;
  },

  // Update office (admin/official only)
  updateOffice: async (
    officeId: string,
    data: UpdateOfficeData
  ): Promise<Office> => {
    const response = await api.put(`/offices/${officeId}`, data);
    return response.data.data.office;
  },

  // Delete office (admin only)
  deleteOffice: async (officeId: string): Promise<void> => {
    await api.delete(`/offices/${officeId}`);
  },
};

export default OfficeService;
