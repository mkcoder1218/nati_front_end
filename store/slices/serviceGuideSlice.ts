import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import ServiceGuideService, {
  ServiceGuide,
  CreateServiceGuideData,
  UpdateServiceGuideData,
} from "@/services/serviceGuide.service";

interface ServiceGuideState {
  guides: ServiceGuide[];
  officeGuides: { [officeId: string]: ServiceGuide[] };
  searchResults: ServiceGuide[];
  selectedGuide: ServiceGuide | null;
  loading: boolean;
  error: string | null;
}

const initialState: ServiceGuideState = {
  guides: [],
  officeGuides: {},
  searchResults: [],
  selectedGuide: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllServiceGuides = createAsyncThunk(
  "serviceGuide/fetchAllServiceGuides",
  async (_, { rejectWithValue }) => {
    try {
      const guides = await ServiceGuideService.getAllServiceGuides();
      return guides;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch service guides"
      );
    }
  }
);

export const searchServiceGuides = createAsyncThunk(
  "serviceGuide/searchServiceGuides",
  async (query: string, { rejectWithValue }) => {
    try {
      const guides = await ServiceGuideService.searchServiceGuides(query);
      return guides;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search service guides"
      );
    }
  }
);

// Keep track of in-progress service guide requests to prevent duplicates
const pendingGuideRequests: Record<string, Promise<any>> = {};

export const fetchServiceGuidesByOffice = createAsyncThunk(
  "serviceGuide/fetchServiceGuidesByOffice",
  async (officeId: string, { rejectWithValue, getState }) => {
    try {
      console.log("fetchServiceGuidesByOffice thunk called with ID:", officeId);

      // Check if we already have the data for this office
      const state = getState() as { serviceGuide: ServiceGuideState };
      if (state.serviceGuide.officeGuides[officeId]) {
        console.log(
          "Already have service guides for this office, skipping fetch"
        );
        return { officeId, guides: state.serviceGuide.officeGuides[officeId] };
      }

      // If there's already a pending request for this office, return its promise
      if (pendingGuideRequests[officeId]) {
        console.log(
          "Service guide request already in progress for office:",
          officeId
        );
        const guides = await pendingGuideRequests[officeId];
        return { officeId, guides };
      }

      // Create a new request and store its promise
      console.log("Fetching service guides from API for office ID:", officeId);
      pendingGuideRequests[officeId] =
        ServiceGuideService.getServiceGuidesByOffice(officeId);

      // Await the result
      const guides = await pendingGuideRequests[officeId];
      console.log("Service guides fetched successfully for office:", officeId);

      // Clear the pending request
      delete pendingGuideRequests[officeId];

      return { officeId, guides };
    } catch (error: any) {
      console.error("Error fetching service guides:", error);
      // Clear the pending request on error
      delete pendingGuideRequests[officeId];
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch office service guides"
      );
    }
  }
);

export const fetchServiceGuideById = createAsyncThunk(
  "serviceGuide/fetchServiceGuideById",
  async (guideId: string, { rejectWithValue }) => {
    try {
      const guide = await ServiceGuideService.getServiceGuideById(guideId);
      return guide;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch service guide"
      );
    }
  }
);

export const createServiceGuide = createAsyncThunk(
  "serviceGuide/createServiceGuide",
  async (data: CreateServiceGuideData, { rejectWithValue }) => {
    try {
      const guide = await ServiceGuideService.createServiceGuide(data);
      return guide;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create service guide"
      );
    }
  }
);

export const updateServiceGuide = createAsyncThunk(
  "serviceGuide/updateServiceGuide",
  async (
    { guideId, data }: { guideId: string; data: UpdateServiceGuideData },
    { rejectWithValue }
  ) => {
    try {
      const guide = await ServiceGuideService.updateServiceGuide(guideId, data);
      return guide;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update service guide"
      );
    }
  }
);

export const deleteServiceGuide = createAsyncThunk(
  "serviceGuide/deleteServiceGuide",
  async (guideId: string, { rejectWithValue }) => {
    try {
      await ServiceGuideService.deleteServiceGuide(guideId);
      return guideId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete service guide"
      );
    }
  }
);

const serviceGuideSlice = createSlice({
  name: "serviceGuide",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedGuide: (state) => {
      state.selectedGuide = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch All Service Guides
    builder.addCase(fetchAllServiceGuides.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchAllServiceGuides.fulfilled,
      (state, action: PayloadAction<ServiceGuide[]>) => {
        state.guides = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchAllServiceGuides.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Search Service Guides
    builder.addCase(searchServiceGuides.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      searchServiceGuides.fulfilled,
      (state, action: PayloadAction<ServiceGuide[]>) => {
        state.searchResults = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(searchServiceGuides.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Service Guides By Office
    builder.addCase(fetchServiceGuidesByOffice.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchServiceGuidesByOffice.fulfilled,
      (
        state,
        action: PayloadAction<{ officeId: string; guides: ServiceGuide[] }>
      ) => {
        state.officeGuides[action.payload.officeId] = action.payload.guides;
        state.loading = false;
      }
    );
    builder.addCase(fetchServiceGuidesByOffice.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Service Guide By ID
    builder.addCase(fetchServiceGuideById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchServiceGuideById.fulfilled,
      (state, action: PayloadAction<ServiceGuide>) => {
        state.selectedGuide = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchServiceGuideById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Service Guide
    builder.addCase(createServiceGuide.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      createServiceGuide.fulfilled,
      (state, action: PayloadAction<ServiceGuide>) => {
        state.guides.push(action.payload);

        // Update office guides if we have them loaded
        if (state.officeGuides[action.payload.office_id]) {
          state.officeGuides[action.payload.office_id].push(action.payload);
        }

        state.loading = false;
      }
    );
    builder.addCase(createServiceGuide.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Service Guide
    builder.addCase(updateServiceGuide.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateServiceGuide.fulfilled,
      (state, action: PayloadAction<ServiceGuide>) => {
        state.selectedGuide = action.payload;

        // Update in all guides
        state.guides = state.guides.map((guide) =>
          guide.guide_id === action.payload.guide_id ? action.payload : guide
        );

        // Update in office guides if we have them loaded
        if (state.officeGuides[action.payload.office_id]) {
          state.officeGuides[action.payload.office_id] = state.officeGuides[
            action.payload.office_id
          ].map((guide) =>
            guide.guide_id === action.payload.guide_id ? action.payload : guide
          );
        }

        // Update in search results if present
        state.searchResults = state.searchResults.map((guide) =>
          guide.guide_id === action.payload.guide_id ? action.payload : guide
        );

        state.loading = false;
      }
    );
    builder.addCase(updateServiceGuide.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Service Guide
    builder.addCase(deleteServiceGuide.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      deleteServiceGuide.fulfilled,
      (state, action: PayloadAction<string>) => {
        // Remove from all guides
        state.guides = state.guides.filter(
          (guide) => guide.guide_id !== action.payload
        );

        // Remove from office guides
        Object.keys(state.officeGuides).forEach((officeId) => {
          state.officeGuides[officeId] = state.officeGuides[officeId].filter(
            (guide) => guide.guide_id !== action.payload
          );
        });

        // Remove from search results
        state.searchResults = state.searchResults.filter(
          (guide) => guide.guide_id !== action.payload
        );

        if (state.selectedGuide?.guide_id === action.payload) {
          state.selectedGuide = null;
        }

        state.loading = false;
      }
    );
    builder.addCase(deleteServiceGuide.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, clearSelectedGuide, clearSearchResults } =
  serviceGuideSlice.actions;
export default serviceGuideSlice.reducer;
