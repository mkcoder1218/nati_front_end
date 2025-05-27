import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AdminService, {
  AdminDashboardStats,
  RecentActivity,
  SystemHealth,
} from "@/services/admin.service";
import ReviewService from "@/services/review.service";
import api from "@/lib/api";

interface CommentReply {
  reply_id: string;
  comment_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_role?: string;
}

interface Comment {
  comment_id: string;
  user_id: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  admin_response?: string;
  admin_response_by?: string;
  admin_response_at?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_role?: string;
  admin_name?: string;
  replies?: CommentReply[];
}

interface AdminState {
  dashboardStats: AdminDashboardStats | null;
  recentActivity: RecentActivity[];
  systemHealth: SystemHealth | null;
  flaggedReviews: any[];
  pendingComments: Comment[];
  reviewedComments: Comment[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  dashboardStats: null,
  recentActivity: [],
  systemHealth: null,
  flaggedReviews: [],
  pendingComments: [],
  reviewedComments: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAdminDashboardStats = createAsyncThunk(
  "admin/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const data = await AdminService.getDashboardStats();
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin dashboard stats"
      );
    }
  }
);

export const fetchSystemHealth = createAsyncThunk(
  "admin/fetchSystemHealth",
  async (_, { rejectWithValue }) => {
    try {
      const health = await AdminService.getSystemHealth();
      return health;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch system health"
      );
    }
  }
);

export const fetchFlaggedReviews = createAsyncThunk(
  "admin/fetchFlaggedReviews",
  async (_, { rejectWithValue }) => {
    try {
      const reviews = await AdminService.getFlaggedReviews();
      return reviews;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch flagged reviews"
      );
    }
  }
);

export const updateReviewStatus = createAsyncThunk(
  "admin/updateReviewStatus",
  async (
    { reviewId, status }: { reviewId: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const review = await ReviewService.updateReviewStatus(reviewId, status);
      return { review, reviewId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update review status"
      );
    }
  }
);

export const fetchPendingComments = createAsyncThunk(
  "admin/fetchPendingComments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/comments?status=pending");
      return response.data.data.comments;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pending comments"
      );
    }
  }
);

export const fetchReviewedComments = createAsyncThunk(
  "admin/fetchReviewedComments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/comments?status=approved,rejected");
      return response.data.data.comments;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch reviewed comments"
      );
    }
  }
);

export const updateCommentStatus = createAsyncThunk(
  "admin/updateCommentStatus",
  async (
    {
      commentId,
      status,
    }: { commentId: string; status: "approved" | "rejected" },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/comments/${commentId}/status`, {
        status,
      });
      return { comment: response.data.data.comment, commentId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update comment status"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch dashboard stats
    builder.addCase(fetchAdminDashboardStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchAdminDashboardStats.fulfilled,
      (
        state,
        action: PayloadAction<{
          stats: AdminDashboardStats;
          recent_activity: RecentActivity[];
        }>
      ) => {
        state.dashboardStats = action.payload.stats;
        state.recentActivity = action.payload.recent_activity;
        state.loading = false;
      }
    );
    builder.addCase(fetchAdminDashboardStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch system health
    builder.addCase(fetchSystemHealth.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchSystemHealth.fulfilled,
      (state, action: PayloadAction<SystemHealth>) => {
        state.systemHealth = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchSystemHealth.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch flagged reviews
    builder.addCase(fetchFlaggedReviews.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchFlaggedReviews.fulfilled,
      (state, action: PayloadAction<any[]>) => {
        state.flaggedReviews = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchFlaggedReviews.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update review status
    builder.addCase(updateReviewStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateReviewStatus.fulfilled,
      (state, action: PayloadAction<{ review: any; reviewId: string }>) => {
        // Remove the review from the flagged reviews list
        state.flaggedReviews = state.flaggedReviews.filter(
          (review) => review.review_id !== action.payload.reviewId
        );
        state.loading = false;
      }
    );
    builder.addCase(updateReviewStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch pending comments
    builder.addCase(fetchPendingComments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchPendingComments.fulfilled,
      (state, action: PayloadAction<Comment[]>) => {
        state.pendingComments = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchPendingComments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch reviewed comments
    builder.addCase(fetchReviewedComments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchReviewedComments.fulfilled,
      (state, action: PayloadAction<Comment[]>) => {
        state.reviewedComments = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchReviewedComments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update comment status
    builder.addCase(updateCommentStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateCommentStatus.fulfilled,
      (
        state,
        action: PayloadAction<{ comment: Comment; commentId: string }>
      ) => {
        // Remove the comment from pending and add to reviewed
        state.pendingComments = state.pendingComments.filter(
          (comment) => comment.comment_id !== action.payload.commentId
        );
        state.reviewedComments = [
          ...state.reviewedComments,
          action.payload.comment,
        ];
        state.loading = false;
      }
    );
    builder.addCase(updateCommentStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
