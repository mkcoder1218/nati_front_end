import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import ReviewService, {
  Review,
  CreateReviewData,
  UpdateReviewData,
  UpdateReviewStatusData,
} from "@/services/review.service";
import { fetchAllOffices, fetchOfficeById } from "./officeSlice";

interface ReviewState {
  reviews: Review[];
  officeReviews: { [officeId: string]: Review[] };
  userReviews: { [userId: string]: Review[] };
  selectedReview: Review | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  officeReviews: {},
  userReviews: {},
  selectedReview: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllReviews = createAsyncThunk(
  "review/fetchAllReviews",
  async (includeReplies: boolean = true, { rejectWithValue }) => {
    try {
      const reviews = await ReviewService.getAllReviews(includeReplies);
      return reviews;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch reviews"
      );
    }
  }
);

// Keep track of in-progress review requests to prevent duplicates
const pendingReviewRequests: Record<string, Promise<any>> = {};
// Keep track of completed requests to avoid unnecessary API calls
const completedRequests = new Set<string>();

export const fetchReviewsByOffice = createAsyncThunk(
  "review/fetchReviewsByOffice",
  async (officeId: string, { rejectWithValue, getState }) => {
    try {
      console.log("fetchReviewsByOffice thunk called with ID:", officeId);

      // Check if we already have the data for this office
      const state = getState() as { review: ReviewState };
      if (
        state.review.officeReviews[officeId] &&
        state.review.officeReviews[officeId].length > 0
      ) {
        console.log("Already have reviews for this office, skipping fetch");
        return { officeId, reviews: state.review.officeReviews[officeId] };
      }

      // If we've already completed a request for this office in this session
      // and there are no reviews, we can assume there are no reviews for this office
      if (
        completedRequests.has(officeId) &&
        (!state.review.officeReviews[officeId] ||
          state.review.officeReviews[officeId].length === 0)
      ) {
        console.log(
          "Already checked for reviews for this office, no reviews found"
        );
        return { officeId, reviews: [] };
      }

      // If there's already a pending request for this office, return its promise
      if (pendingReviewRequests[officeId]) {
        console.log("Review request already in progress for office:", officeId);
        try {
          const reviews = await pendingReviewRequests[officeId];
          return { officeId, reviews };
        } catch (error) {
          // If the pending request fails, we should try again
          console.error("Pending request failed, retrying:", error);
          delete pendingReviewRequests[officeId];
          // Continue to the fetch below
        }
      }

      // Create a new request and store its promise
      console.log("Fetching reviews from API for office ID:", officeId);
      pendingReviewRequests[officeId] =
        ReviewService.getReviewsByOffice(officeId);

      try {
        // Await the result
        const reviews = await pendingReviewRequests[officeId];
        console.log("Reviews fetched successfully for office:", officeId);

        // Mark this request as completed
        completedRequests.add(officeId);

        // Clear the pending request
        delete pendingReviewRequests[officeId];

        return { officeId, reviews };
      } catch (error: any) {
        console.error("Error fetching reviews:", error);
        // Clear the pending request on error
        delete pendingReviewRequests[officeId];
        throw error; // Re-throw to be caught by the outer catch
      }
    } catch (error: any) {
      console.error("Error in fetchReviewsByOffice:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch office reviews"
      );
    }
  }
);

export const fetchReviewsByUser = createAsyncThunk(
  "review/fetchReviewsByUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const reviews = await ReviewService.getReviewsByUser(userId);
      return { userId, reviews };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user reviews"
      );
    }
  }
);

export const fetchReviewById = createAsyncThunk(
  "review/fetchReviewById",
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const review = await ReviewService.getReviewById(reviewId);
      return review;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch review"
      );
    }
  }
);

export const createReview = createAsyncThunk(
  "review/createReview",
  async (data: CreateReviewData, { rejectWithValue, dispatch }) => {
    try {
      const review = await ReviewService.createReview(data);

      // After creating a review, fetch the updated office data
      // This will ensure the office rating is updated in the UI
      dispatch(fetchOfficeById(data.office_id));
      dispatch(fetchAllOffices());

      return review;
    } catch (error: any) {
      // Pass through the entire error object for better error handling
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to create review",
        code: error.response?.data?.code,
        response: error.response,
      });
    }
  }
);

export const updateReview = createAsyncThunk(
  "review/updateReview",
  async (
    { reviewId, data }: { reviewId: string; data: UpdateReviewData },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const review = await ReviewService.updateReview(reviewId, data);

      // Get the office_id from the updated review
      const officeId = review.office_id;

      // After updating a review, fetch the updated office data
      dispatch(fetchOfficeById(officeId));
      dispatch(fetchAllOffices());

      return review;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update review"
      );
    }
  }
);

export const updateReviewStatus = createAsyncThunk(
  "review/updateReviewStatus",
  async (
    { reviewId, data }: { reviewId: string; data: UpdateReviewStatusData },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const review = await ReviewService.updateReviewStatus(reviewId, data);

      // Get the office_id from the updated review
      const officeId = review.office_id;

      // After updating a review status, fetch the updated office data
      // This is important because approving/rejecting reviews affects the average rating
      dispatch(fetchOfficeById(officeId));
      dispatch(fetchAllOffices());

      return review;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update review status"
      );
    }
  }
);

export const deleteReview = createAsyncThunk(
  "review/deleteReview",
  async (reviewId: string, { rejectWithValue, dispatch, getState }) => {
    try {
      // Get the review before deleting it to know which office to update
      const state = getState() as { review: ReviewState };
      const review =
        state.review.reviews.find((r) => r.review_id === reviewId) ||
        state.review.selectedReview;

      await ReviewService.deleteReview(reviewId);

      // If we found the review, update the office data
      if (review) {
        dispatch(fetchOfficeById(review.office_id));
        dispatch(fetchAllOffices());
      }

      return reviewId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete review"
      );
    }
  }
);

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedReview: (state) => {
      state.selectedReview = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Reviews
    builder.addCase(fetchAllReviews.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchAllReviews.fulfilled,
      (state, action: PayloadAction<Review[]>) => {
        state.reviews = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchAllReviews.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Reviews By Office
    builder.addCase(fetchReviewsByOffice.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchReviewsByOffice.fulfilled,
      (
        state,
        action: PayloadAction<{ officeId: string; reviews: Review[] }>
      ) => {
        state.officeReviews[action.payload.officeId] = action.payload.reviews;
        state.loading = false;
      }
    );
    builder.addCase(fetchReviewsByOffice.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Reviews By User
    builder.addCase(fetchReviewsByUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchReviewsByUser.fulfilled,
      (state, action: PayloadAction<{ userId: string; reviews: Review[] }>) => {
        state.userReviews[action.payload.userId] = action.payload.reviews;
        state.loading = false;
      }
    );
    builder.addCase(fetchReviewsByUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Review By ID
    builder.addCase(fetchReviewById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchReviewById.fulfilled,
      (state, action: PayloadAction<Review>) => {
        state.selectedReview = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchReviewById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Review
    builder.addCase(createReview.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      createReview.fulfilled,
      (state, action: PayloadAction<Review>) => {
        state.reviews.push(action.payload);

        // Update office reviews if we have them loaded
        if (state.officeReviews[action.payload.office_id]) {
          state.officeReviews[action.payload.office_id].push(action.payload);
        }

        // Update user reviews if we have them loaded
        if (state.userReviews[action.payload.user_id]) {
          state.userReviews[action.payload.user_id].push(action.payload);
        }

        state.loading = false;
      }
    );
    builder.addCase(createReview.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Review
    builder.addCase(updateReview.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateReview.fulfilled,
      (state, action: PayloadAction<Review>) => {
        state.selectedReview = action.payload;

        // Update in all reviews
        state.reviews = state.reviews.map((review) =>
          review.review_id === action.payload.review_id
            ? action.payload
            : review
        );

        // Update in office reviews if we have them loaded
        if (state.officeReviews[action.payload.office_id]) {
          state.officeReviews[action.payload.office_id] = state.officeReviews[
            action.payload.office_id
          ].map((review) =>
            review.review_id === action.payload.review_id
              ? action.payload
              : review
          );
        }

        // Update in user reviews if we have them loaded
        if (state.userReviews[action.payload.user_id]) {
          state.userReviews[action.payload.user_id] = state.userReviews[
            action.payload.user_id
          ].map((review) =>
            review.review_id === action.payload.review_id
              ? action.payload
              : review
          );
        }

        state.loading = false;
      }
    );
    builder.addCase(updateReview.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Review Status
    builder.addCase(updateReviewStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateReviewStatus.fulfilled,
      (state, action: PayloadAction<Review>) => {
        state.selectedReview = action.payload;

        // Update in all reviews
        state.reviews = state.reviews.map((review) =>
          review.review_id === action.payload.review_id
            ? action.payload
            : review
        );

        // Update in office reviews if we have them loaded
        if (state.officeReviews[action.payload.office_id]) {
          state.officeReviews[action.payload.office_id] = state.officeReviews[
            action.payload.office_id
          ].map((review) =>
            review.review_id === action.payload.review_id
              ? action.payload
              : review
          );
        }

        // Update in user reviews if we have them loaded
        if (state.userReviews[action.payload.user_id]) {
          state.userReviews[action.payload.user_id] = state.userReviews[
            action.payload.user_id
          ].map((review) =>
            review.review_id === action.payload.review_id
              ? action.payload
              : review
          );
        }

        state.loading = false;
      }
    );
    builder.addCase(updateReviewStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Review
    builder.addCase(deleteReview.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      deleteReview.fulfilled,
      (state, action: PayloadAction<string>) => {
        // Remove from all reviews
        state.reviews = state.reviews.filter(
          (review) => review.review_id !== action.payload
        );

        // Remove from office reviews
        Object.keys(state.officeReviews).forEach((officeId) => {
          state.officeReviews[officeId] = state.officeReviews[officeId].filter(
            (review) => review.review_id !== action.payload
          );
        });

        // Remove from user reviews
        Object.keys(state.userReviews).forEach((userId) => {
          state.userReviews[userId] = state.userReviews[userId].filter(
            (review) => review.review_id !== action.payload
          );
        });

        if (state.selectedReview?.review_id === action.payload) {
          state.selectedReview = null;
        }

        state.loading = false;
      }
    );
    builder.addCase(deleteReview.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, clearSelectedReview } = reviewSlice.actions;
export default reviewSlice.reducer;
