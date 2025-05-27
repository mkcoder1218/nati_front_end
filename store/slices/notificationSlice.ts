import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import NotificationService, {
  Notification,
} from "@/services/notification.service";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if user is authenticated
      const state = getState() as any;
      if (!state.auth.isAuthenticated || !state.auth.user) {
        console.log("User not authenticated, skipping notifications fetch");
        return [];
      }

      const notifications = await NotificationService.getNotifications();
      return notifications;
    } catch (error: any) {
      console.warn("Error in fetchNotifications thunk:", error);
      // Return empty array instead of rejecting to prevent UI errors
      return [];
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notification/fetchUnreadCount",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if user is authenticated
      const state = getState() as any;
      if (!state.auth.isAuthenticated || !state.auth.user) {
        console.log("User not authenticated, skipping unread count fetch");
        return 0;
      }

      const count = await NotificationService.getUnreadCount();
      return count;
    } catch (error: any) {
      console.warn("Error in fetchUnreadCount thunk:", error);
      // Return 0 instead of rejecting to prevent UI errors
      return 0;
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await NotificationService.markAsRead(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark notification as read"
      );
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await NotificationService.markAllAsRead();
      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to mark all notifications as read"
      );
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notification/deleteNotification",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete notification"
      );
    }
  }
);

export const deleteAllNotifications = createAsyncThunk(
  "notification/deleteAllNotifications",
  async (_, { rejectWithValue }) => {
    try {
      await NotificationService.deleteAllNotifications();
      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete all notifications"
      );
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder.addCase(fetchNotifications.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchNotifications.fulfilled,
      (state, action: PayloadAction<Notification[]>) => {
        state.notifications = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Unread Count
    builder.addCase(fetchUnreadCount.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchUnreadCount.fulfilled,
      (state, action: PayloadAction<number>) => {
        state.unreadCount = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchUnreadCount.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Mark Notification as Read
    builder.addCase(markNotificationAsRead.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      markNotificationAsRead.fulfilled,
      (state, action: PayloadAction<string>) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(
          (n) => n.notification_id === notificationId
        );
        if (notification) {
          notification.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.loading = false;
      }
    );
    builder.addCase(markNotificationAsRead.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Mark All Notifications as Read
    builder.addCase(markAllNotificationsAsRead.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(markAllNotificationsAsRead.fulfilled, (state) => {
      state.notifications.forEach((notification) => {
        notification.is_read = true;
      });
      state.unreadCount = 0;
      state.loading = false;
    });
    builder.addCase(markAllNotificationsAsRead.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Notification
    builder.addCase(deleteNotification.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      deleteNotification.fulfilled,
      (state, action: PayloadAction<string>) => {
        const notificationId = action.payload;
        const index = state.notifications.findIndex(
          (n) => n.notification_id === notificationId
        );
        if (index !== -1) {
          const wasUnread = !state.notifications[index].is_read;
          state.notifications.splice(index, 1);
          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
        state.loading = false;
      }
    );
    builder.addCase(deleteNotification.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete All Notifications
    builder.addCase(deleteAllNotifications.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteAllNotifications.fulfilled, (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.loading = false;
    });
    builder.addCase(deleteAllNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = notificationSlice.actions;
export default notificationSlice.reducer;
