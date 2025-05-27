import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AuthService, { LoginData, RegisterData } from "@/services/auth.service";

interface User {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  phone_number: string;
  office_id?: string; // Links government officials to their assigned office. NULL for citizens and admins.
  office_name?: string; // Office name for display purposes
  created_at: string;
  last_login?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Initialize state safely for SSR
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginData, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get profile"
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    // Call the auth service logout method to clear localStorage
    AuthService.logout();

    try {
      // Import the resetState action dynamically to avoid circular dependency
      const storeModule = await import("@/store");
      if (storeModule && typeof storeModule.resetState === "function") {
        // Dispatch the reset state action to clear the entire Redux store
        dispatch(storeModule.resetState());
      } else {
        console.warn("resetState action not found or not a function");
      }
    } catch (error) {
      console.error("Error importing resetState:", error);
    }

    return { success: true };
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    hydrateAuth: (state) => {
      // Only run on client side
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            state.isAuthenticated = true;
            state.user = user;
          } catch (error) {
            // If parsing fails, clear invalid data
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            state.isAuthenticated = false;
            state.user = null;
          }
        } else {
          state.isAuthenticated = false;
          state.user = null;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      login.fulfilled,
      (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.loading = false;
      }
    );
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      register.fulfilled,
      (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.loading = false;
      }
    );
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Get Profile
    builder.addCase(getProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      getProfile.fulfilled,
      (state, action: PayloadAction<{ user: User }>) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
      }
    );
    builder.addCase(getProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.isAuthenticated = false;
      state.user = null;
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
    });
  },
});

export const { clearError, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
