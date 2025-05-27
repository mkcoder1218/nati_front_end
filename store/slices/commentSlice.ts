import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Define types
export interface CommentReply {
  reply_id: string;
  comment_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_role?: string;
}

export interface Comment {
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

export interface CommentInput {
  content: string;
}

// Define the state structure
interface CommentState {
  comments: Comment[];
  userComments: Comment[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  submitError: string | null;
}

// Initial state
const initialState: CommentState = {
  comments: [],
  userComments: [],
  loading: false,
  error: null,
  submitting: false,
  submitError: null,
};

// Comment service functions
const CommentService = {
  // Submit a new comment
  submitComment: async (data: CommentInput): Promise<Comment> => {
    const response = await api.post("/comments", data);
    return response.data.data.comment;
  },

  // Get all comments (admin only)
  getAllComments: async (): Promise<Comment[]> => {
    const response = await api.get("/comments");
    return response.data.data.comments;
  },

  // Get comments by user
  getUserComments: async (): Promise<Comment[]> => {
    const response = await api.get("/comments/user");
    return response.data.data.comments;
  },

  // Add admin response to comment
  addAdminResponse: async (
    commentId: string,
    response: string
  ): Promise<Comment> => {
    const apiResponse = await api.post(`/comments/${commentId}/response`, {
      response,
    });
    return apiResponse.data.data.comment;
  },

  // Add user reply to comment
  addCommentReply: async (
    commentId: string,
    content: string
  ): Promise<CommentReply> => {
    const response = await api.post(`/comments/${commentId}/replies`, {
      content,
    });
    return response.data.data.reply;
  },

  // Get replies for a comment
  getCommentReplies: async (commentId: string): Promise<CommentReply[]> => {
    const response = await api.get(`/comments/${commentId}/replies`);
    return response.data.data.replies;
  },
};

// Async thunks
export const submitComment = createAsyncThunk(
  "comment/submitComment",
  async (data: CommentInput, { rejectWithValue }) => {
    try {
      const comment = await CommentService.submitComment(data);
      return comment;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit comment"
      );
    }
  }
);

export const fetchAllComments = createAsyncThunk(
  "comment/fetchAllComments",
  async (_, { rejectWithValue }) => {
    try {
      const comments = await CommentService.getAllComments();
      return comments;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch comments"
      );
    }
  }
);

export const fetchUserComments = createAsyncThunk(
  "comment/fetchUserComments",
  async (_, { rejectWithValue }) => {
    try {
      const comments = await CommentService.getUserComments();
      return comments;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user comments"
      );
    }
  }
);

export const addAdminResponse = createAsyncThunk(
  "comment/addAdminResponse",
  async (
    { commentId, response }: { commentId: string; response: string },
    { rejectWithValue }
  ) => {
    try {
      const comment = await CommentService.addAdminResponse(
        commentId,
        response
      );
      return comment;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add admin response"
      );
    }
  }
);

export const addCommentReply = createAsyncThunk(
  "comment/addCommentReply",
  async (
    { commentId, content }: { commentId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const reply = await CommentService.addCommentReply(commentId, content);
      return { commentId, reply };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add reply"
      );
    }
  }
);

// Create the slice
const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSubmitError: (state) => {
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    // Submit comment
    builder.addCase(submitComment.pending, (state) => {
      state.submitting = true;
      state.submitError = null;
    });
    builder.addCase(
      submitComment.fulfilled,
      (state, action: PayloadAction<Comment>) => {
        state.submitting = false;
        state.userComments.unshift(action.payload);
      }
    );
    builder.addCase(submitComment.rejected, (state, action) => {
      state.submitting = false;
      state.submitError = action.payload as string;
    });

    // Fetch all comments
    builder.addCase(fetchAllComments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchAllComments.fulfilled,
      (state, action: PayloadAction<Comment[]>) => {
        state.loading = false;
        state.comments = action.payload;
      }
    );
    builder.addCase(fetchAllComments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch user comments
    builder.addCase(fetchUserComments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchUserComments.fulfilled,
      (state, action: PayloadAction<Comment[]>) => {
        state.loading = false;
        state.userComments = action.payload;
      }
    );
    builder.addCase(fetchUserComments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add admin response
    builder.addCase(addAdminResponse.pending, (state) => {
      state.submitting = true;
      state.submitError = null;
    });
    builder.addCase(
      addAdminResponse.fulfilled,
      (state, action: PayloadAction<Comment>) => {
        state.submitting = false;
        // Update the comment in both arrays
        const updatedComment = action.payload;
        const updateComment = (comment: Comment) =>
          comment.comment_id === updatedComment.comment_id
            ? updatedComment
            : comment;

        state.comments = state.comments.map(updateComment);
        state.userComments = state.userComments.map(updateComment);
      }
    );
    builder.addCase(addAdminResponse.rejected, (state, action) => {
      state.submitting = false;
      state.submitError = action.payload as string;
    });

    // Add comment reply
    builder.addCase(addCommentReply.pending, (state) => {
      state.submitting = true;
      state.submitError = null;
    });
    builder.addCase(
      addCommentReply.fulfilled,
      (
        state,
        action: PayloadAction<{ commentId: string; reply: CommentReply }>
      ) => {
        state.submitting = false;
        // Add the reply to the comment in both arrays
        const { commentId, reply } = action.payload;

        const addReplyToComment = (comment: Comment) => {
          if (comment.comment_id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), reply],
            };
          }
          return comment;
        };

        state.comments = state.comments.map(addReplyToComment);
        state.userComments = state.userComments.map(addReplyToComment);
      }
    );
    builder.addCase(addCommentReply.rejected, (state, action) => {
      state.submitting = false;
      state.submitError = action.payload as string;
    });
  },
});

export const { clearError, clearSubmitError } = commentSlice.actions;
export default commentSlice.reducer;
