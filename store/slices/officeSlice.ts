import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import OfficeService, {
  Office,
  CreateOfficeData,
  UpdateOfficeData,
} from "@/services/office.service";

interface OfficeState {
  offices: Office[];
  selectedOffice: Office | null;
  loading: boolean;
  error: string | null;
}

const initialState: OfficeState = {
  offices: [],
  selectedOffice: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllOffices = createAsyncThunk(
  "office/fetchAllOffices",
  async (_, { rejectWithValue }) => {
    try {
      const offices = await OfficeService.getAllOffices();
      return offices;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch offices"
      );
    }
  }
);

// Keep track of in-progress requests to prevent duplicates
const pendingRequests: Record<string, Promise<any>> = {};

export const fetchOfficeById = createAsyncThunk(
  "office/fetchOfficeById",
  async (officeId: string, { rejectWithValue, getState }) => {
    try {
      console.log("fetchOfficeById thunk called with ID:", officeId);

      // Check if we already have this office in the state
      const state = getState() as { office: OfficeState };

      // Check if the office is already selected in the state
      if (state.office.selectedOffice?.office_id === officeId) {
        console.log("Office already selected in state, skipping fetch");
        return state.office.selectedOffice;
      }

      // Check if we have the office in the offices array
      const existingOffice = state.office.offices.find(
        (office) => office.office_id === officeId
      );

      // If we have the office in the array and it's not loading, return it
      if (existingOffice && !state.office.loading) {
        console.log("Using existing office from state:", existingOffice);
        return existingOffice;
      }

      // If there's already a pending request for this office, return its promise
      if (pendingRequests[officeId]) {
        console.log("Request already in progress for office:", officeId);
        return await pendingRequests[officeId];
      }

      // Create a new request and store its promise
      console.log("Fetching office from API with ID:", officeId);
      pendingRequests[officeId] = OfficeService.getOfficeById(officeId);

      // Await the result
      const office = await pendingRequests[officeId];
      console.log("Office fetched successfully:", office);

      // Clear the pending request
      delete pendingRequests[officeId];

      return office;
    } catch (error: any) {
      console.error("Error fetching office:", error);
      // Clear the pending request on error
      delete pendingRequests[officeId];
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch office"
      );
    }
  }
);

export const createOffice = createAsyncThunk(
  "office/createOffice",
  async (data: CreateOfficeData, { rejectWithValue }) => {
    try {
      const office = await OfficeService.createOffice(data);
      return office;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create office"
      );
    }
  }
);

export const updateOffice = createAsyncThunk(
  "office/updateOffice",
  async (
    { officeId, data }: { officeId: string; data: UpdateOfficeData },
    { rejectWithValue }
  ) => {
    try {
      const office = await OfficeService.updateOffice(officeId, data);
      return office;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update office"
      );
    }
  }
);

export const deleteOffice = createAsyncThunk(
  "office/deleteOffice",
  async (officeId: string, { rejectWithValue }) => {
    try {
      await OfficeService.deleteOffice(officeId);
      return officeId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete office"
      );
    }
  }
);

const officeSlice = createSlice({
  name: "office",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedOffice: (state) => {
      state.selectedOffice = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Offices
    builder.addCase(fetchAllOffices.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchAllOffices.fulfilled,
      (state, action: PayloadAction<Office[]>) => {
        state.offices = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchAllOffices.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Office By ID
    builder.addCase(fetchOfficeById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchOfficeById.fulfilled,
      (state, action: PayloadAction<Office>) => {
        state.selectedOffice = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchOfficeById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Office
    builder.addCase(createOffice.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      createOffice.fulfilled,
      (state, action: PayloadAction<Office>) => {
        state.offices.push(action.payload);
        state.loading = false;
      }
    );
    builder.addCase(createOffice.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Office
    builder.addCase(updateOffice.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateOffice.fulfilled,
      (state, action: PayloadAction<Office>) => {
        state.selectedOffice = action.payload;
        state.offices = state.offices.map((office) =>
          office.office_id === action.payload.office_id
            ? action.payload
            : office
        );
        state.loading = false;
      }
    );
    builder.addCase(updateOffice.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Office
    builder.addCase(deleteOffice.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      deleteOffice.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.offices = state.offices.filter(
          (office) => office.office_id !== action.payload
        );
        if (state.selectedOffice?.office_id === action.payload) {
          state.selectedOffice = null;
        }
        state.loading = false;
      }
    );
    builder.addCase(deleteOffice.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, clearSelectedOffice } = officeSlice.actions;
export default officeSlice.reducer;
