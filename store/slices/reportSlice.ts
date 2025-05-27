import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import ReportService, { Report } from "@/services/report.service";

interface ReportState {
  reports: Report[];
  loading: boolean;
  error: string | null;
  selectedReport: Report | null;
  deleting: boolean;
  downloading: boolean;
}

const initialState: ReportState = {
  reports: [],
  loading: false,
  error: null,
  selectedReport: null,
  deleting: false,
  downloading: false,
};

// Async thunks
export const fetchReports = createAsyncThunk(
  "reports/fetchReports",
  async (_, { rejectWithValue }) => {
    try {
      const reports = await ReportService.getReports();
      return reports;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch reports"
      );
    }
  }
);

export const fetchReportById = createAsyncThunk(
  "reports/fetchReportById",
  async (reportId: string, { rejectWithValue }) => {
    try {
      const report = await ReportService.getReportById(reportId);
      return report;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch report"
      );
    }
  }
);

export const deleteReport = createAsyncThunk(
  "reports/deleteReport",
  async (reportId: string, { rejectWithValue }) => {
    try {
      await ReportService.deleteReport(reportId);
      return reportId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete report"
      );
    }
  }
);

export const downloadReport = createAsyncThunk(
  "reports/downloadReport",
  async (report: Report, { rejectWithValue }) => {
    try {
      await ReportService.downloadReportFile(report);
      return report.report_id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to download report"
      );
    }
  }
);

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedReport: (state) => {
      state.selectedReport = null;
    },
    setSelectedReport: (state, action: PayloadAction<Report>) => {
      state.selectedReport = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch reports
    builder.addCase(fetchReports.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchReports.fulfilled, (state, action) => {
      state.loading = false;
      state.reports = action.payload;
    });
    builder.addCase(fetchReports.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch report by ID
    builder.addCase(fetchReportById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchReportById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedReport = action.payload;
    });
    builder.addCase(fetchReportById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete report
    builder.addCase(deleteReport.pending, (state) => {
      state.deleting = true;
      state.error = null;
    });
    builder.addCase(deleteReport.fulfilled, (state, action) => {
      state.deleting = false;
      state.reports = state.reports.filter(
        (report) => report.report_id !== action.payload
      );
    });
    builder.addCase(deleteReport.rejected, (state, action) => {
      state.deleting = false;
      state.error = action.payload as string;
    });

    // Download report
    builder.addCase(downloadReport.pending, (state) => {
      state.downloading = true;
      state.error = null;
    });
    builder.addCase(downloadReport.fulfilled, (state) => {
      state.downloading = false;
    });
    builder.addCase(downloadReport.rejected, (state, action) => {
      state.downloading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, clearSelectedReport, setSelectedReport } = reportSlice.actions;
export default reportSlice.reducer;
