import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import GovernmentStatsService, {
  GovernmentDashboardStats,
  SentimentBreakdown,
  TopIssue,
  AIReport,
} from "@/services/governmentStats.service";
import { RootState } from "@/store";

interface TimeSeriesData {
  ratings_over_time: Array<{ date: string; value: number; count: number }>;
  reviews_over_time: Array<{ date: string; value: number; count: number }>;
  sentiment_over_time: {
    positive: Array<{ date: string; value: number; count: number }>;
    neutral: Array<{ date: string; value: number; count: number }>;
    negative: Array<{ date: string; value: number; count: number }>;
  };
}

interface GovernmentStatsState {
  dashboardStats: GovernmentDashboardStats | null;
  timeSeriesData: TimeSeriesData | null;
  loading: boolean;
  timeSeriesLoading: boolean;
  error: string | null;
  reportGenerating: boolean;
  reportUrl: string | null;
  reportError: string | null;
  aiReport: AIReport | null;
  reportStartDate: string | null;
  reportEndDate: string | null;
}

const initialState: GovernmentStatsState = {
  dashboardStats: null,
  timeSeriesData: null,
  loading: false,
  timeSeriesLoading: false,
  error: null,
  reportGenerating: false,
  reportUrl: null,
  reportError: null,
  aiReport: null,
  reportStartDate: null,
  reportEndDate: null,
};

// Default empty stats for initial state
const emptyStats: GovernmentDashboardStats = {
  office_summary: {
    total_reviews: 0,
    average_rating: 0,
    citizens_served: 0,
    positive_feedback_percentage: 0,
    monthly_change: {
      reviews: 0,
      rating: 0,
      citizens: 0,
      positive_percentage: 0,
    },
  },
  sentiment_breakdown: {
    positive: 0,
    neutral: 0,
    negative: 0,
  },
  top_issues: [],
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  "governmentStats/fetchDashboardStats",
  async (officeId: string | undefined, { rejectWithValue, getState }) => {
    try {
      // Check if we already have the stats in the state
      const state = getState() as RootState;
      if (
        state.governmentStats.dashboardStats &&
        !state.governmentStats.loading
      ) {
        console.log("Using existing dashboard stats from state");
        return state.governmentStats.dashboardStats;
      }

      console.log("Fetching dashboard stats from service");
      const stats = await GovernmentStatsService.getDashboardStats(officeId);
      return stats;
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard statistics"
      );
    }
  }
);

export const fetchSentimentBreakdown = createAsyncThunk(
  "governmentStats/fetchSentimentBreakdown",
  async (officeId: string | undefined, { rejectWithValue, getState }) => {
    try {
      // Check if we already have the sentiment breakdown in the state
      const state = getState() as RootState;
      if (
        state.governmentStats.dashboardStats?.sentiment_breakdown &&
        !state.governmentStats.loading
      ) {
        console.log("Using existing sentiment breakdown from state");
        return state.governmentStats.dashboardStats.sentiment_breakdown;
      }

      console.log("Fetching sentiment breakdown from service");
      const breakdown = await GovernmentStatsService.getSentimentBreakdown(
        officeId
      );
      return breakdown;
    } catch (error: any) {
      console.error("Error fetching sentiment breakdown:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch sentiment breakdown"
      );
    }
  }
);

export const fetchTopIssues = createAsyncThunk(
  "governmentStats/fetchTopIssues",
  async (officeId: string | undefined, { rejectWithValue, getState }) => {
    try {
      // Check if we already have the top issues in the state
      const state = getState() as RootState;
      if (
        state.governmentStats.dashboardStats?.top_issues &&
        state.governmentStats.dashboardStats.top_issues.length > 0 &&
        !state.governmentStats.loading
      ) {
        console.log("Using existing top issues from state");
        return state.governmentStats.dashboardStats.top_issues;
      }

      console.log("Fetching top issues from service");
      const issues = await GovernmentStatsService.getTopIssues(officeId);
      return issues;
    } catch (error: any) {
      console.error("Error fetching top issues:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch top issues"
      );
    }
  }
);

// Interface for report generation parameters
interface GenerateReportParams {
  officeId?: string;
  startDate?: string;
  endDate?: string;
  reportType?: string;
  reportFormat?: string;
}

export const generateReport = createAsyncThunk(
  "governmentStats/generateReport",
  async (params: GenerateReportParams, { rejectWithValue }) => {
    try {
      const {
        officeId,
        startDate,
        endDate,
        reportType = "sentiment",
        reportFormat = "pdf",
      } = params;

      console.log("Generating report with params:", {
        office: officeId || "all offices",
        startDate: startDate || "all time",
        endDate: endDate || "present",
        type: reportType,
        format: reportFormat,
      });

      const result = await GovernmentStatsService.generateReport(
        officeId,
        startDate,
        endDate,
        reportType,
        reportFormat
      );

      console.log("Report generated successfully:", result.reportUrl);

      return {
        reportUrl: result.reportUrl,
        aiReport: result.aiReport,
        startDate,
        endDate,
      };
    } catch (error: any) {
      console.error("Error generating report:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate report"
      );
    }
  }
);

// Async thunk for fetching time series data
export const fetchTimeSeriesData = createAsyncThunk(
  "governmentStats/fetchTimeSeriesData",
  async (
    params: { officeId?: string; timeRange?: string },
    { rejectWithValue }
  ) => {
    try {
      console.log("Fetching time series data with params:", params);
      const response = await GovernmentStatsService.getTimeSeriesData(
        params.officeId,
        params.timeRange || "6months"
      );
      console.log("Time series data fetched successfully:", response);
      return response;
    } catch (error: any) {
      console.error("Error fetching time series data:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch time series data"
      );
    }
  }
);

const governmentStatsSlice = createSlice({
  name: "governmentStats",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReportUrl: (state) => {
      state.reportUrl = null;
      state.reportError = null;
      state.aiReport = null;
      state.reportStartDate = null;
      state.reportEndDate = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Dashboard Stats
    builder.addCase(fetchDashboardStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchDashboardStats.fulfilled,
      (state, action: PayloadAction<GovernmentDashboardStats>) => {
        state.dashboardStats = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchDashboardStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      // Set default empty stats if fetch fails
      state.dashboardStats = emptyStats;
    });

    // Fetch Sentiment Breakdown
    builder.addCase(
      fetchSentimentBreakdown.fulfilled,
      (state, action: PayloadAction<SentimentBreakdown>) => {
        if (state.dashboardStats) {
          state.dashboardStats.sentiment_breakdown = action.payload;
        }
      }
    );

    // Fetch Top Issues
    builder.addCase(
      fetchTopIssues.fulfilled,
      (state, action: PayloadAction<TopIssue[]>) => {
        if (state.dashboardStats) {
          state.dashboardStats.top_issues = action.payload;
        }
      }
    );

    // Generate Report
    builder.addCase(generateReport.pending, (state) => {
      state.reportGenerating = true;
      state.reportError = null;
      state.aiReport = null;
    });
    builder.addCase(
      generateReport.fulfilled,
      (
        state,
        action: PayloadAction<{
          reportUrl: string;
          aiReport: AIReport;
          startDate?: string;
          endDate?: string;
        }>
      ) => {
        state.reportGenerating = false;
        state.reportUrl = action.payload.reportUrl;
        state.aiReport = action.payload.aiReport;
        state.reportStartDate = action.payload.startDate || null;
        state.reportEndDate = action.payload.endDate || null;
      }
    );
    builder.addCase(generateReport.rejected, (state, action) => {
      state.reportGenerating = false;
      state.reportError = action.payload as string;
      state.aiReport = null;
    });

    // Fetch Time Series Data
    builder.addCase(fetchTimeSeriesData.pending, (state) => {
      state.timeSeriesLoading = true;
      state.error = null;
    });
    builder.addCase(
      fetchTimeSeriesData.fulfilled,
      (state, action: PayloadAction<TimeSeriesData>) => {
        state.timeSeriesData = action.payload;
        state.timeSeriesLoading = false;
      }
    );
    builder.addCase(fetchTimeSeriesData.rejected, (state, action) => {
      state.timeSeriesLoading = false;
      state.error = action.payload as string;
      // Set default empty time series data if fetch fails
      state.timeSeriesData = {
        ratings_over_time: [],
        reviews_over_time: [],
        sentiment_over_time: {
          positive: [],
          neutral: [],
          negative: [],
        },
      };
    });
  },
});

export const { clearError, clearReportUrl } = governmentStatsSlice.actions;
export default governmentStatsSlice.reducer;
