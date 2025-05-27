import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import UserService, { User, UpdateUserData, UpdateRoleData } from '@/services/user.service';

interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllUsers = createAsyncThunk(
  'user/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserService.getAllUsers();
      return response.users;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (userId: string, { rejectWithValue }) => {
    try {
      const user = await UserService.getUserById(userId);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userId, data }: { userId: string; data: UpdateUserData }, { rejectWithValue }) => {
    try {
      const user = await UserService.updateUser(userId, data);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'user/updateUserRole',
  async ({ userId, data }: { userId: string; data: UpdateRoleData }, { rejectWithValue }) => {
    try {
      const user = await UserService.updateUserRole(userId, data);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user role');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await UserService.deleteUser(userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Users
    builder.addCase(fetchAllUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchAllUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch User By ID
    builder.addCase(fetchUserById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchUserById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update User
    builder.addCase(updateUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;
      state.users = state.users.map(user => 
        user.user_id === action.payload.user_id ? action.payload : user
      );
      state.loading = false;
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update User Role
    builder.addCase(updateUserRole.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateUserRole.fulfilled, (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;
      state.users = state.users.map(user => 
        user.user_id === action.payload.user_id ? action.payload : user
      );
      state.loading = false;
    });
    builder.addCase(updateUserRole.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete User
    builder.addCase(deleteUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.user_id !== action.payload);
      if (state.selectedUser?.user_id === action.payload) {
        state.selectedUser = null;
      }
      state.loading = false;
    });
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;
