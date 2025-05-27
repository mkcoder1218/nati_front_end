import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import ReviewReplyService, {
  ReviewReply,
  CreateReplyData,
  UpdateReplyData,
} from "@/services/reviewReply.service";

interface ReviewReplyState {
  replies: ReviewReply[];
  reviewReplies: { [reviewId: string]: ReviewReply[] };
  userReplies: { [userId: string]: ReviewReply[] };
  selectedReply: ReviewReply | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReviewReplyState = {
  replies: [],
  reviewReplies: {},
  userReplies: {},
  selectedReply: null,
  loading: false,
  error: null,
};

// Async thunks
export const createReply = createAsyncThunk(
  "reviewReply/createReply",
  async (
    { reviewId, data }: { reviewId: string; data: CreateReplyData },
    { rejectWithValue }
  ) => {
    try {
      const reply = await ReviewReplyService.createReply(reviewId, data);
      return { reviewId, reply };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create reply"
      );
    }
  }
);

export const fetchRepliesByReview = createAsyncThunk(
  "reviewReply/fetchRepliesByReview",
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const replies = await ReviewReplyService.getRepliesByReview(reviewId);
      return { reviewId, replies };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch replies"
      );
    }
  }
);

export const fetchRepliesByUser = createAsyncThunk(
  "reviewReply/fetchRepliesByUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const replies = await ReviewReplyService.getRepliesByUser(userId);
      return { userId, replies };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user replies"
      );
    }
  }
);

export const fetchReplyById = createAsyncThunk(
  "reviewReply/fetchReplyById",
  async (replyId: string, { rejectWithValue }) => {
    try {
      const reply = await ReviewReplyService.getReplyById(replyId);
      return reply;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch reply"
      );
    }
  }
);

export const updateReply = createAsyncThunk(
  "reviewReply/updateReply",
  async (
    { replyId, data }: { replyId: string; data: UpdateReplyData },
    { rejectWithValue }
  ) => {
    try {
      const reply = await ReviewReplyService.updateReply(replyId, data);
      return reply;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update reply"
      );
    }
  }
);

export const deleteReply = createAsyncThunk(
  "reviewReply/deleteReply",
  async (replyId: string, { rejectWithValue }) => {
    try {
      await ReviewReplyService.deleteReply(replyId);
      return replyId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete reply"
      );
    }
  }
);

export const fetchAllReplies = createAsyncThunk(
  "reviewReply/fetchAllReplies",
  async (_, { rejectWithValue }) => {
    try {
      const replies = await ReviewReplyService.getAllReplies();
      return replies;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch all replies"
      );
    }
  }
);

const reviewReplySlice = createSlice({
  name: "reviewReply",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedReply: (state) => {
      state.selectedReply = null;
    },
  },
  extraReducers: (builder) => {
    // Create Reply
    builder.addCase(createReply.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      createReply.fulfilled,
      (state, action: PayloadAction<{ reviewId: string; reply: ReviewReply }>) => {
        const { reviewId, reply } = action.payload;
        
        // Add to all replies
        state.replies.push(reply);
        
        // Add to review-specific replies
        if (!state.reviewReplies[reviewId]) {
          state.reviewReplies[reviewId] = [];
        }
        state.reviewReplies[reviewId].push(reply);
        
        // Add to user-specific replies
        if (!state.userReplies[reply.user_id]) {
          state.userReplies[reply.user_id] = [];
        }
        state.userReplies[reply.user_id].push(reply);
        
        state.loading = false;
      }
    );
    builder.addCase(createReply.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Replies By Review
    builder.addCase(fetchRepliesByReview.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchRepliesByReview.fulfilled,
      (state, action: PayloadAction<{ reviewId: string; replies: ReviewReply[] }>) => {
        const { reviewId, replies } = action.payload;
        state.reviewReplies[reviewId] = replies;
        state.loading = false;
      }
    );
    builder.addCase(fetchRepliesByReview.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Replies By User
    builder.addCase(fetchRepliesByUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchRepliesByUser.fulfilled,
      (state, action: PayloadAction<{ userId: string; replies: ReviewReply[] }>) => {
        const { userId, replies } = action.payload;
        state.userReplies[userId] = replies;
        state.loading = false;
      }
    );
    builder.addCase(fetchRepliesByUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Reply By ID
    builder.addCase(fetchReplyById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchReplyById.fulfilled,
      (state, action: PayloadAction<ReviewReply>) => {
        state.selectedReply = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchReplyById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Reply
    builder.addCase(updateReply.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateReply.fulfilled,
      (state, action: PayloadAction<ReviewReply>) => {
        const updatedReply = action.payload;
        
        // Update in all replies
        state.replies = state.replies.map((reply) =>
          reply.reply_id === updatedReply.reply_id ? updatedReply : reply
        );
        
        // Update in review-specific replies
        if (state.reviewReplies[updatedReply.review_id]) {
          state.reviewReplies[updatedReply.review_id] = state.reviewReplies[
            updatedReply.review_id
          ].map((reply) =>
            reply.reply_id === updatedReply.reply_id ? updatedReply : reply
          );
        }
        
        // Update in user-specific replies
        if (state.userReplies[updatedReply.user_id]) {
          state.userReplies[updatedReply.user_id] = state.userReplies[
            updatedReply.user_id
          ].map((reply) =>
            reply.reply_id === updatedReply.reply_id ? updatedReply : reply
          );
        }
        
        if (state.selectedReply?.reply_id === updatedReply.reply_id) {
          state.selectedReply = updatedReply;
        }
        
        state.loading = false;
      }
    );
    builder.addCase(updateReply.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Reply
    builder.addCase(deleteReply.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      deleteReply.fulfilled,
      (state, action: PayloadAction<string>) => {
        const replyId = action.payload;
        
        // Remove from all replies
        state.replies = state.replies.filter(
          (reply) => reply.reply_id !== replyId
        );
        
        // Remove from review-specific replies
        Object.keys(state.reviewReplies).forEach((reviewId) => {
          state.reviewReplies[reviewId] = state.reviewReplies[reviewId].filter(
            (reply) => reply.reply_id !== replyId
          );
        });
        
        // Remove from user-specific replies
        Object.keys(state.userReplies).forEach((userId) => {
          state.userReplies[userId] = state.userReplies[userId].filter(
            (reply) => reply.reply_id !== replyId
          );
        });
        
        if (state.selectedReply?.reply_id === replyId) {
          state.selectedReply = null;
        }
        
        state.loading = false;
      }
    );
    builder.addCase(deleteReply.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch All Replies
    builder.addCase(fetchAllReplies.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchAllReplies.fulfilled,
      (state, action: PayloadAction<ReviewReply[]>) => {
        state.replies = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchAllReplies.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, clearSelectedReply } = reviewReplySlice.actions;
export default reviewReplySlice.reducer;
