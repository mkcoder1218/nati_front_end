import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  ScheduledReport,
  CreateScheduledReportData,
  UpdateScheduledReportData,
  createScheduledReport as createScheduledReportAPI,
  getScheduledReports as getScheduledReportsAPI,
  getScheduledReportById as getScheduledReportByIdAPI,
  updateScheduledReport as updateScheduledReportAPI,
  deleteScheduledReport as deleteScheduledReportAPI,
} from '@/services/scheduledReport.service';

interface ScheduledReportState {
  scheduledReports: ScheduledReport[];
  currentScheduledReport: ScheduledReport | null;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
}

const initialState: ScheduledReportState = {
  scheduledReports: [],
  currentScheduledReport: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
};

// Async thunks
export const createScheduledReport = createAsyncThunk(
  'scheduledReport/create',
  async (data: CreateScheduledReportData, { rejectWithValue }) => {
    try {
      const response = await createScheduledReportAPI(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create scheduled report');
    }
  }
);

export const fetchScheduledReports = createAsyncThunk(
  'scheduledReport/fetchAll',
  async (params?: { office_id?: string; status?: string }, { rejectWithValue }) => {
    try {
      const response = await getScheduledReportsAPI(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch scheduled reports');
    }
  }
);

export const fetchScheduledReportById = createAsyncThunk(
  'scheduledReport/fetchById',
  async (scheduledReportId: string, { rejectWithValue }) => {
    try {
      const response = await getScheduledReportByIdAPI(scheduledReportId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch scheduled report');
    }
  }
);

export const updateScheduledReport = createAsyncThunk(
  'scheduledReport/update',
  async (
    { scheduledReportId, data }: { scheduledReportId: string; data: UpdateScheduledReportData },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateScheduledReportAPI(scheduledReportId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update scheduled report');
    }
  }
);

export const deleteScheduledReport = createAsyncThunk(
  'scheduledReport/delete',
  async (scheduledReportId: string, { rejectWithValue }) => {
    try {
      await deleteScheduledReportAPI(scheduledReportId);
      return scheduledReportId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete scheduled report');
    }
  }
);

const scheduledReportSlice = createSlice({
  name: 'scheduledReport',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentScheduledReport: (state) => {
      state.currentScheduledReport = null;
    },
  },
  extraReducers: (builder) => {
    // Create scheduled report
    builder
      .addCase(createScheduledReport.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createScheduledReport.fulfilled, (state, action: PayloadAction<ScheduledReport>) => {
        state.creating = false;
        state.scheduledReports.unshift(action.payload);
      })
      .addCase(createScheduledReport.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      });

    // Fetch all scheduled reports
    builder
      .addCase(fetchScheduledReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScheduledReports.fulfilled, (state, action: PayloadAction<ScheduledReport[]>) => {
        state.loading = false;
        state.scheduledReports = action.payload;
      })
      .addCase(fetchScheduledReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch scheduled report by ID
    builder
      .addCase(fetchScheduledReportById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScheduledReportById.fulfilled, (state, action: PayloadAction<ScheduledReport>) => {
        state.loading = false;
        state.currentScheduledReport = action.payload;
      })
      .addCase(fetchScheduledReportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update scheduled report
    builder
      .addCase(updateScheduledReport.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateScheduledReport.fulfilled, (state, action: PayloadAction<ScheduledReport>) => {
        state.updating = false;
        const index = state.scheduledReports.findIndex(
          (report) => report.scheduled_report_id === action.payload.scheduled_report_id
        );
        if (index !== -1) {
          state.scheduledReports[index] = action.payload;
        }
        if (state.currentScheduledReport?.scheduled_report_id === action.payload.scheduled_report_id) {
          state.currentScheduledReport = action.payload;
        }
      })
      .addCase(updateScheduledReport.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Delete scheduled report
    builder
      .addCase(deleteScheduledReport.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteScheduledReport.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleting = false;
        state.scheduledReports = state.scheduledReports.filter(
          (report) => report.scheduled_report_id !== action.payload
        );
        if (state.currentScheduledReport?.scheduled_report_id === action.payload) {
          state.currentScheduledReport = null;
        }
      })
      .addCase(deleteScheduledReport.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentScheduledReport } = scheduledReportSlice.actions;
export default scheduledReportSlice.reducer;
