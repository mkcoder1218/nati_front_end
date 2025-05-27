import api from "@/lib/api";

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
}

export interface LoginData {
  email?: string;
  phone_number?: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  data: {
    user: {
      user_id: string;
      email: string;
      full_name: string;
      role: string;
      phone_number: string;
      created_at: string;
      last_login?: string;
    };
    token: string;
  };
}

// Flags to prevent duplicate requests
let isLoggingIn = false;
let isFetchingProfile = false;

const AuthService = {
  // Register a new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    // Prevent duplicate login requests
    if (isLoggingIn) {
      console.log("Login already in progress, ignoring duplicate request");
      throw new Error("Login already in progress");
    }

    isLoggingIn = true;

    try {
      // Log which credential is being used (email or phone)
      if (data.email) {
        console.log("Attempting login with email:", { email: data.email });
      } else if (data.phone_number) {
        console.log("Attempting login with phone:", {
          phone_number: data.phone_number,
        });
      }

      const response = await api.post<AuthResponse>("/auth/login", data);
      console.log("Login response:", response.data);

      // Store token and user data in localStorage
      if (response.data.data?.token) {
        console.log("Storing token and user data");
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      } else {
        console.error("No token received in login response");
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      // Reset the flag regardless of success or failure
      isLoggingIn = false;
    }
  },

  // Logout user
  logout: (): void => {
    console.log("Logging out and clearing all localStorage data");

    // Clear specific auth-related items
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear any other application data that might be in localStorage
    // This ensures a complete logout with no lingering data
    const keysToPreserve = ["language"]; // Keep language preference

    // Get all keys in localStorage
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }

    // Remove all keys except those we want to preserve
    keys.forEach((key) => {
      if (!keysToPreserve.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Clear any session storage data as well
    sessionStorage.clear();
  },

  // Get current user profile
  getProfile: async (): Promise<AuthResponse> => {
    // Prevent duplicate profile requests
    if (isFetchingProfile) {
      console.log(
        "Profile fetch already in progress, ignoring duplicate request"
      );
      throw new Error("Profile fetch already in progress");
    }

    isFetchingProfile = true;

    try {
      console.log("Fetching user profile");
      const response = await api.get<AuthResponse>("/auth/profile");
      console.log("Profile response:", response.data);

      // Update user data in localStorage with the latest from the server
      if (response.data.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    } finally {
      // Reset the flag regardless of success or failure
      isFetchingProfile = false;
    }
  },

  // Get current authenticated user from localStorage
  getCurrentUser: (): any => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },
};

export default AuthService;
