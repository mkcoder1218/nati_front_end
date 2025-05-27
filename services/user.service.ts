import api from "@/lib/api";

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  phone_number: string;
  role: string;
  office_id?: string; // Links government officials to their assigned office. NULL for citizens and admins.
  office_name?: string; // Office name for display purposes
  created_at: string;
  last_login?: string;
}

export interface UpdateUserData {
  full_name?: string;
  phone_number?: string;
  password?: string;
}

export interface UpdateRoleData {
  role: "citizen" | "official" | "admin";
}

export interface GovernmentOfficial {
  user_id: string;
  email: string;
  full_name: string;
  phone_number: string;
  role: string;
  office_id?: string;
  office_name?: string;
  created_at: string;
}

const UserService = {
  // Get all users (admin only)
  getAllUsers: async (
    limit = 100,
    offset = 0
  ): Promise<{ users: User[]; count: number }> => {
    const response = await api.get(`/users?limit=${limit}&offset=${offset}`);
    return response.data.data;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data.data.user;
  },

  // Update user
  updateUser: async (userId: string, data: UpdateUserData): Promise<User> => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data.data.user;
  },

  // Update user role (admin only)
  updateUserRole: async (
    userId: string,
    data: UpdateRoleData
  ): Promise<User> => {
    const response = await api.patch(`/users/${userId}/role`, data);
    return response.data.data.user;
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },

  // Get available government officials (admin only)
  getAvailableOfficials: async (): Promise<GovernmentOfficial[]> => {
    const response = await api.get("/users/officials/available");
    return response.data.data.officials;
  },

  // Assign user to office (single office assignment)
  assignUserToOffice: async (
    userId: string,
    officeId: string
  ): Promise<User> => {
    const response = await api.post(`/users/${userId}/office`, {
      office_id: officeId,
    });
    return response.data.data.user;
  },

  // Remove user from office (unassign from current office)
  removeUserFromOffice: async (userId: string): Promise<User> => {
    const response = await api.delete(`/users/${userId}/office`);
    return response.data.data.user;
  },
};

export default UserService;
