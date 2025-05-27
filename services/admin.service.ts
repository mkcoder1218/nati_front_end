import api from "@/lib/api";

export interface AdminDashboardStats {
  offices: {
    total: number;
    new: number;
  };
  services: {
    total: number;
    new: number;
  };
  users: {
    total: number;
    new: number;
  };
  flagged_comments: number;
}

export interface RecentActivity {
  type: string;
  title: string;
  timestamp: string;
  user: {
    user_id: string;
    full_name: string;
    email: string;
    role: string;
  } | null;
}

export interface SystemHealth {
  database: string;
  api: string;
  uptime: number;
  memory_usage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpu_usage: {
    user: number;
    system: number;
  };
}

// Mock data for development/testing
const mockDashboardStats: AdminDashboardStats = {
  offices: {
    total: 156,
    new: 12,
  },
  services: {
    total: 42,
    new: 3,
  },
  users: {
    total: 2845,
    new: 257,
  },
  flagged_comments: 18,
};

const mockRecentActivity: RecentActivity[] = [
  {
    type: "office_created",
    title: "Nifas Silk-Lafto Subcity Woreda 2 Office",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: null,
  },
  {
    type: "service_updated",
    title: "Business License Application - Updated requirements",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    user: null,
  },
  {
    type: "review_flagged",
    title: "Review flagged",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user: {
      user_id: "123",
      full_name: "Test User",
      email: "test@example.com",
      role: "citizen",
    },
  },
  {
    type: "user_registered",
    title: "New user registered",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user: {
      user_id: "456",
      full_name: "Government Official",
      email: "official@example.com",
      role: "official",
    },
  },
];

const mockSystemHealth: SystemHealth = {
  database: "healthy",
  api: "healthy",
  uptime: 12345,
  memory_usage: {
    rss: 123456789,
    heapTotal: 98765432,
    heapUsed: 45678901,
    external: 1234567,
  },
  cpu_usage: {
    user: 12345,
    system: 6789,
  },
};

// Mock flagged reviews for development/testing
const mockFlaggedReviews = [
  {
    review_id: "1",
    user_id: "123",
    office_id: "456",
    rating: 2,
    comment:
      "This office is terrible. The staff was rude and unhelpful. I had to wait for hours!",
    status: "flagged",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    user_name: "John Doe",
    office_name: "Nifas Silk-Lafto Subcity Woreda 2 Office",
    flag_count: 5,
  },
  {
    review_id: "2",
    user_id: "456",
    office_id: "789",
    rating: 1,
    comment:
      "Worst experience ever! The staff was incompetent and the service was extremely slow.",
    status: "flagged",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    user_name: "Jane Smith",
    office_name: "Addis Ketema Subcity Office",
    flag_count: 3,
  },
];

const AdminService = {
  // Get admin dashboard statistics
  getDashboardStats: async (): Promise<{
    stats: AdminDashboardStats;
    recent_activity: RecentActivity[];
  }> => {
    try {
      const response = await api.get("/admin/dashboard/stats");
      return response.data.data;
    } catch (error) {
      console.warn(
        "Using mock data for admin dashboard stats - API endpoint not available"
      );
      // Return mock data for development/testing
      return {
        stats: mockDashboardStats,
        recent_activity: mockRecentActivity,
      };
    }
  },

  // Get system health status
  getSystemHealth: async (): Promise<SystemHealth> => {
    try {
      const response = await api.get("/admin/system/health");
      return response.data.data.health;
    } catch (error) {
      console.warn(
        "Using mock data for system health - API endpoint not available"
      );
      // Return mock data for development/testing
      return mockSystemHealth;
    }
  },

  // Get flagged reviews
  getFlaggedReviews: async (): Promise<any[]> => {
    try {
      const response = await api.get("/votes/flagged");
      return response.data.data.reviews;
    } catch (error) {
      console.warn(
        "Using mock data for flagged reviews - API endpoint not available"
      );
      // Return mock data for development/testing
      return mockFlaggedReviews;
    }
  },
};

export default AdminService;
