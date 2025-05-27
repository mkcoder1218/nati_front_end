import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import OfficeVoteService, {
  OfficeVote,
  OfficeVoteData,
  OfficeVoteCounts,
  UserOfficeVoteStats,
  OfficeVoteStats,
  VoteTrend,
} from "@/services/officeVote.service";

interface OfficeVoteState {
  // Store votes by office ID
  votesByOffice: { [officeId: string]: OfficeVoteCounts };
  // Store user votes by office ID
  userVotes: { [officeId: string]: OfficeVote };
  // User vote statistics
  userVoteStats: UserOfficeVoteStats | null;
  // Top voted offices
  topVotedOffices: OfficeVoteStats[];
  // Vote trends
  voteTrends: VoteTrend[];
  // Loading states
  loading: boolean;
  trendsLoading: boolean;
  statsLoading: boolean;
  // Error states
  error: string | null;
  trendsError: string | null;
  statsError: string | null;
}

const initialState: OfficeVoteState = {
  votesByOffice: {},
  userVotes: {},
  userVoteStats: null,
  topVotedOffices: [],
  voteTrends: [],
  loading: false,
  trendsLoading: false,
  statsLoading: false,
  error: null,
  trendsError: null,
  statsError: null,
};

// Async thunks
export const voteOnOffice = createAsyncThunk(
  "officeVote/voteOnOffice",
  async (
    {
      officeId,
      voteType,
    }: { officeId: string; voteType: "upvote" | "downvote" },
    { rejectWithValue, getState }
  ) => {
    try {
      console.log(
        `voteOnOffice thunk called with ID: ${officeId}, type: ${voteType}`
      );

      // Check if user is authenticated
      const authState = (getState() as any).auth;
      if (!authState.isAuthenticated || !authState.user) {
        console.error("User not authenticated, cannot vote");
        return rejectWithValue("User not authenticated");
      }

      // Create a unique key for this vote action
      const requestKey = `${officeId}-${voteType}`;

      // If there's already a pending request for this action, return its promise
      if (pendingVoteActionRequests[requestKey]) {
        console.log(
          "Vote action already in progress for this office/type:",
          requestKey
        );
        try {
          const result = await pendingVoteActionRequests[requestKey];
          return { ...result, officeId };
        } catch (error) {
          throw error; // Re-throw to be caught by the outer catch
        }
      }

      // Create a new request and store its promise
      console.log("Calling OfficeVoteService.voteOnOffice");
      pendingVoteActionRequests[requestKey] = OfficeVoteService.voteOnOffice(
        officeId,
        {
          vote_type: voteType,
        }
      );

      try {
        // Await the result
        const result = await pendingVoteActionRequests[requestKey];
        console.log("Vote result:", result);

        // Clear the pending request
        delete pendingVoteActionRequests[requestKey];

        return { ...result, officeId };
      } catch (error) {
        // Clear the pending request on error
        delete pendingVoteActionRequests[requestKey];
        throw error; // Re-throw to be caught by the outer catch
      }
    } catch (error: any) {
      console.error("Error in voteOnOffice thunk:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to vote on office"
      );
    }
  }
);

export const removeVoteFromOffice = createAsyncThunk(
  "officeVote/removeVoteFromOffice",
  async (officeId: string, { rejectWithValue, getState }) => {
    try {
      console.log(`removeVoteFromOffice thunk called with ID: ${officeId}`);

      // Check if user is authenticated
      const authState = (getState() as any).auth;
      if (!authState.isAuthenticated || !authState.user) {
        console.error("User not authenticated, cannot remove vote");
        return rejectWithValue("User not authenticated");
      }

      // If there's already a pending request for this office, return its promise
      if (pendingRemoveRequests[officeId]) {
        console.log("Vote removal already in progress for office:", officeId);
        try {
          const result = await pendingRemoveRequests[officeId];
          return { ...result, officeId };
        } catch (error) {
          throw error; // Re-throw to be caught by the outer catch
        }
      }

      // Create a new request and store its promise
      console.log("Calling OfficeVoteService.removeVote");
      pendingRemoveRequests[officeId] = OfficeVoteService.removeVote(officeId);

      try {
        // Await the result
        const result = await pendingRemoveRequests[officeId];
        console.log("Vote removal result:", result);

        // Clear the pending request
        delete pendingRemoveRequests[officeId];

        return { ...result, officeId };
      } catch (error) {
        // Clear the pending request on error
        delete pendingRemoveRequests[officeId];
        throw error; // Re-throw to be caught by the outer catch
      }
    } catch (error: any) {
      console.error("Error in removeVoteFromOffice thunk:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove vote"
      );
    }
  }
);

// Keep track of in-progress requests to prevent duplicates
const pendingVoteActionRequests: Record<string, Promise<any>> = {};
const pendingVoteRequests: Record<string, Promise<any>> = {};
const pendingRemoveRequests: Record<string, Promise<any>> = {};

export const fetchVotesByOffice = createAsyncThunk(
  "officeVote/fetchVotesByOffice",
  async (officeId: string, { rejectWithValue, getState }) => {
    try {
      console.log("fetchVotesByOffice thunk called with ID:", officeId);

      // Check if we're already loading or if we already have the data
      const state = getState() as { officeVote: OfficeVoteState };

      // Check if we already have the data for this office
      if (state.officeVote.votesByOffice[officeId]) {
        console.log("Already have vote data for this office, skipping fetch");
        return {
          counts: state.officeVote.votesByOffice[officeId],
          user_vote: state.officeVote.userVotes[officeId] || null,
          officeId,
        };
      }

      // If there's already a pending request for this office, return its promise
      if (pendingVoteRequests[officeId]) {
        console.log("Vote request already in progress for office:", officeId);
        const result = await pendingVoteRequests[officeId];
        return { ...result, officeId };
      }

      // Create a new request and store its promise
      console.log("Fetching votes from API for office ID:", officeId);
      pendingVoteRequests[officeId] =
        OfficeVoteService.getVotesByOffice(officeId);

      // Await the result
      const result = await pendingVoteRequests[officeId];
      console.log("Votes fetched successfully for office:", officeId);

      // Clear the pending request
      delete pendingVoteRequests[officeId];

      return { ...result, officeId };
    } catch (error: any) {
      console.error("Error fetching votes:", error);
      // Clear the pending request on error
      delete pendingVoteRequests[officeId];
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch votes"
      );
    }
  }
);

export const fetchUserVoteStats = createAsyncThunk(
  "officeVote/fetchUserVoteStats",
  async (_, { rejectWithValue }) => {
    try {
      const stats = await OfficeVoteService.getUserVoteStats();
      return stats;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user vote statistics"
      );
    }
  }
);

export const fetchTopVotedOffices = createAsyncThunk(
  "officeVote/fetchTopVotedOffices",
  async (
    {
      limit = 10,
      voteType = "total",
    }: { limit?: number; voteType?: "upvote" | "downvote" | "total" },
    { rejectWithValue }
  ) => {
    try {
      const offices = await OfficeVoteService.getTopVotedOffices(
        limit,
        voteType
      );
      return offices;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch top voted offices"
      );
    }
  }
);

export const fetchVoteTrends = createAsyncThunk(
  "officeVote/fetchVoteTrends",
  async (
    {
      officeId = null,
      period = "daily",
      limit = 30,
    }: {
      officeId?: string | null;
      period?: "daily" | "weekly" | "monthly";
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const trends = await OfficeVoteService.getVoteTrends(
        officeId,
        period,
        limit
      );
      return trends;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vote trends"
      );
    }
  }
);

const officeVoteSlice = createSlice({
  name: "officeVote",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTrendsError: (state) => {
      state.trendsError = null;
    },
    clearStatsError: (state) => {
      state.statsError = null;
    },
  },
  extraReducers: (builder) => {
    // Vote on Office
    builder.addCase(voteOnOffice.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      voteOnOffice.fulfilled,
      (
        state,
        action: PayloadAction<{
          vote: OfficeVote;
          counts: OfficeVoteCounts;
          officeId: string;
        }>
      ) => {
        const { vote, counts, officeId } = action.payload;
        state.votesByOffice[officeId] = counts;
        state.userVotes[officeId] = vote;
        state.loading = false;
      }
    );
    builder.addCase(voteOnOffice.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Remove Vote
    builder.addCase(removeVoteFromOffice.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      removeVoteFromOffice.fulfilled,
      (
        state,
        action: PayloadAction<{ counts: OfficeVoteCounts; officeId: string }>
      ) => {
        const { counts, officeId } = action.payload;
        state.votesByOffice[officeId] = counts;
        delete state.userVotes[officeId];
        state.loading = false;
      }
    );
    builder.addCase(removeVoteFromOffice.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Votes by Office
    builder.addCase(fetchVotesByOffice.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchVotesByOffice.fulfilled,
      (
        state,
        action: PayloadAction<{
          counts: OfficeVoteCounts;
          user_vote: OfficeVote | null;
          officeId: string;
        }>
      ) => {
        const { counts, user_vote, officeId } = action.payload;
        state.votesByOffice[officeId] = counts;
        if (user_vote) {
          state.userVotes[officeId] = user_vote;
        }
        state.loading = false;
      }
    );
    builder.addCase(fetchVotesByOffice.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch User Vote Stats
    builder.addCase(fetchUserVoteStats.pending, (state) => {
      state.statsLoading = true;
      state.statsError = null;
    });
    builder.addCase(
      fetchUserVoteStats.fulfilled,
      (state, action: PayloadAction<UserOfficeVoteStats>) => {
        state.userVoteStats = action.payload;
        state.statsLoading = false;
      }
    );
    builder.addCase(fetchUserVoteStats.rejected, (state, action) => {
      state.statsLoading = false;
      state.statsError = action.payload as string;
    });

    // Fetch Top Voted Offices
    builder.addCase(fetchTopVotedOffices.pending, (state) => {
      state.statsLoading = true;
      state.statsError = null;
    });
    builder.addCase(
      fetchTopVotedOffices.fulfilled,
      (state, action: PayloadAction<OfficeVoteStats[]>) => {
        state.topVotedOffices = action.payload;
        state.statsLoading = false;
      }
    );
    builder.addCase(fetchTopVotedOffices.rejected, (state, action) => {
      state.statsLoading = false;
      state.statsError = action.payload as string;
    });

    // Fetch Vote Trends
    builder.addCase(fetchVoteTrends.pending, (state) => {
      state.trendsLoading = true;
      state.trendsError = null;
    });
    builder.addCase(
      fetchVoteTrends.fulfilled,
      (state, action: PayloadAction<VoteTrend[]>) => {
        state.voteTrends = action.payload;
        state.trendsLoading = false;
      }
    );
    builder.addCase(fetchVoteTrends.rejected, (state, action) => {
      state.trendsLoading = false;
      state.trendsError = action.payload as string;
    });
  },
});

export const { clearError, clearTrendsError, clearStatsError } =
  officeVoteSlice.actions;
export default officeVoteSlice.reducer;
