import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import VoteService, {
  Vote,
  VoteData,
  VoteCounts,
  UserVoteStats,
  VoteStatistics,
} from "@/services/vote.service";

interface VoteState {
  // Store votes by review ID
  votesByReview: { [reviewId: string]: VoteCounts };
  // Store user votes by review ID
  userVotes: { [reviewId: string]: Vote };
  // User vote statistics
  userVoteStats: UserVoteStats | null;
  // Overall vote statistics (admin/official only)
  voteStatistics: VoteStatistics | null;
  loading: boolean;
  error: string | null;
}

const initialState: VoteState = {
  votesByReview: {},
  userVotes: {},
  userVoteStats: null,
  voteStatistics: null,
  loading: false,
  error: null,
};

// Async thunks
export const voteOnReview = createAsyncThunk(
  "vote/voteOnReview",
  async (
    {
      reviewId,
      voteType,
    }: { reviewId: string; voteType: "upvote" | "downvote" | "flag" },
    { rejectWithValue }
  ) => {
    try {
      // Map frontend vote types to backend vote types
      let backendVoteType = "helpful";

      if (voteType === "upvote") {
        backendVoteType = "helpful";
      } else if (voteType === "downvote") {
        backendVoteType = "not_helpful";
      } else if (voteType === "flag") {
        backendVoteType = "flag";
      }

      const vote = await VoteService.voteOnReview(reviewId, {
        vote_type: backendVoteType,
      });

      // Fetch updated vote counts
      const voteCounts = await VoteService.getVotesByReview(reviewId);

      return { vote, voteCounts, reviewId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to vote on review"
      );
    }
  }
);

export const removeVoteFromReview = createAsyncThunk(
  "vote/removeVoteFromReview",
  async (reviewId: string, { rejectWithValue }) => {
    try {
      await VoteService.removeVote(reviewId);

      // Fetch updated vote counts
      const voteCounts = await VoteService.getVotesByReview(reviewId);

      return { reviewId, voteCounts };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove vote"
      );
    }
  }
);

// Keep track of in-progress vote requests to prevent duplicates
const pendingVoteRequests: Record<string, Promise<any>> = {};
// Keep track of completed vote requests
const completedVoteRequests = new Set<string>();

export const fetchVotesByReview = createAsyncThunk(
  "vote/fetchVotesByReview",
  async (reviewId: string, { rejectWithValue, getState }) => {
    try {
      // Check if we already have the data for this review
      const state = getState() as { vote: VoteState };
      if (state.vote.votesByReview[reviewId]) {
        console.log("Already have votes for this review, skipping fetch");
        return { reviewId, voteCounts: state.vote.votesByReview[reviewId] };
      }

      // If we've already completed a request for this review in this session
      if (completedVoteRequests.has(reviewId)) {
        console.log("Already checked for votes for this review");
        return {
          reviewId,
          voteCounts: state.vote.votesByReview[reviewId] || {
            helpful: 0,
            not_helpful: 0,
            flag: 0,
          },
        };
      }

      // If there's already a pending request for this review, return its promise
      if (pendingVoteRequests[reviewId]) {
        console.log("Vote request already in progress for review:", reviewId);
        try {
          const voteCounts = await pendingVoteRequests[reviewId];
          return { reviewId, voteCounts };
        } catch (error) {
          // If the pending request fails, we should try again
          console.error("Pending vote request failed, retrying:", error);
          delete pendingVoteRequests[reviewId];
          // Continue to the fetch below
        }
      }

      // Create a new request and store its promise
      console.log("Fetching votes from API for review ID:", reviewId);
      pendingVoteRequests[reviewId] = VoteService.getVotesByReview(reviewId);

      try {
        // Await the result
        const voteCounts = await pendingVoteRequests[reviewId];
        console.log("Votes fetched successfully for review:", reviewId);

        // Mark this request as completed
        completedVoteRequests.add(reviewId);

        // Clear the pending request
        delete pendingVoteRequests[reviewId];

        return { reviewId, voteCounts };
      } catch (error: any) {
        console.error("Error fetching votes:", error);
        // Clear the pending request on error
        delete pendingVoteRequests[reviewId];
        throw error; // Re-throw to be caught by the outer catch
      }
    } catch (error: any) {
      console.error("Error in fetchVotesByReview:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch votes"
      );
    }
  }
);

// Fetch user vote statistics
export const fetchUserVoteStats = createAsyncThunk(
  "vote/fetchUserVoteStats",
  async (_, { rejectWithValue }) => {
    try {
      const stats = await VoteService.getUserVoteStats();
      return stats;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user vote statistics"
      );
    }
  }
);

// Fetch overall vote statistics (admin/official only)
export const fetchVoteStatistics = createAsyncThunk(
  "vote/fetchVoteStatistics",
  async (_, { rejectWithValue }) => {
    try {
      const statistics = await VoteService.getVoteStatistics();
      return statistics;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vote statistics"
      );
    }
  }
);

const voteSlice = createSlice({
  name: "vote",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Vote on Review
    builder.addCase(voteOnReview.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      voteOnReview.fulfilled,
      (
        state,
        action: PayloadAction<{
          vote: Vote;
          voteCounts: VoteCounts;
          reviewId: string;
        }>
      ) => {
        const { vote, voteCounts, reviewId } = action.payload;
        state.votesByReview[reviewId] = voteCounts;
        state.userVotes[reviewId] = vote;
        state.loading = false;
      }
    );
    builder.addCase(voteOnReview.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Remove Vote
    builder.addCase(removeVoteFromReview.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      removeVoteFromReview.fulfilled,
      (
        state,
        action: PayloadAction<{ reviewId: string; voteCounts: VoteCounts }>
      ) => {
        const { reviewId, voteCounts } = action.payload;
        state.votesByReview[reviewId] = voteCounts;
        delete state.userVotes[reviewId];
        state.loading = false;
      }
    );
    builder.addCase(removeVoteFromReview.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Votes by Review
    builder.addCase(fetchVotesByReview.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchVotesByReview.fulfilled,
      (
        state,
        action: PayloadAction<{ reviewId: string; voteCounts: VoteCounts }>
      ) => {
        const { reviewId, voteCounts } = action.payload;
        state.votesByReview[reviewId] = voteCounts;
        state.loading = false;
      }
    );
    builder.addCase(fetchVotesByReview.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch User Vote Stats
    builder.addCase(fetchUserVoteStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchUserVoteStats.fulfilled,
      (state, action: PayloadAction<UserVoteStats>) => {
        state.userVoteStats = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchUserVoteStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Vote Statistics
    builder.addCase(fetchVoteStatistics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchVoteStatistics.fulfilled,
      (state, action: PayloadAction<VoteStatistics>) => {
        state.voteStatistics = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchVoteStatistics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = voteSlice.actions;
export default voteSlice.reducer;
