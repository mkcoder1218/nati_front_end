import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import SentimentService, { 
  SentimentAnalysisRequest, 
  SentimentAnalysisResponse,
  SentimentStats,
  SentimentLog
} from '@/services/sentiment.service';

interface SentimentState {
  stats: SentimentStats | null;
  logs: SentimentLog[];
  loading: boolean;
  error: string | null;
}

const initialState: SentimentState = {
  stats: null,
  logs: [],
  loading: false,
  error: null,
};

// Async thunks
export const analyzeText = createAsyncThunk(
  'sentiment/analyzeText',
  async (data: SentimentAnalysisRequest, { rejectWithValue }) => {
    try {
      const result = await SentimentService.analyzeText(data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to analyze text');
    }
  }
);

export const getSentimentStats = createAsyncThunk(
  'sentiment/getSentimentStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await SentimentService.getSentimentStats();
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sentiment statistics');
    }
  }
);

export const getSentimentLogsBySentiment = createAsyncThunk(
  'sentiment/getSentimentLogsBySentiment',
  async (sentiment: 'positive' | 'negative' | 'neutral', { rejectWithValue }) => {
    try {
      const logs = await SentimentService.getSentimentLogsBySentiment(sentiment);
      return logs;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sentiment logs');
    }
  }
);

export const getSentimentLogsByCategory = createAsyncThunk(
  'sentiment/getSentimentLogsByCategory',
  async (category: string, { rejectWithValue }) => {
    try {
      const logs = await SentimentService.getSentimentLogsByCategory(category);
      return logs;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sentiment logs');
    }
  }
);

export const getSentimentLogsByLanguage = createAsyncThunk(
  'sentiment/getSentimentLogsByLanguage',
  async (language: 'amharic' | 'english', { rejectWithValue }) => {
    try {
      const logs = await SentimentService.getSentimentLogsByLanguage(language);
      return logs;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sentiment logs');
    }
  }
);

const sentimentSlice = createSlice({
  name: 'sentiment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Analyze Text
    builder.addCase(analyzeText.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(analyzeText.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(analyzeText.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Get Sentiment Stats
    builder.addCase(getSentimentStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getSentimentStats.fulfilled, (state, action: PayloadAction<SentimentStats>) => {
      state.stats = action.payload;
      state.loading = false;
    });
    builder.addCase(getSentimentStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Get Sentiment Logs By Sentiment
    builder.addCase(getSentimentLogsBySentiment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getSentimentLogsBySentiment.fulfilled, (state, action: PayloadAction<SentimentLog[]>) => {
      state.logs = action.payload;
      state.loading = false;
    });
    builder.addCase(getSentimentLogsBySentiment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Get Sentiment Logs By Category
    builder.addCase(getSentimentLogsByCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getSentimentLogsByCategory.fulfilled, (state, action: PayloadAction<SentimentLog[]>) => {
      state.logs = action.payload;
      state.loading = false;
    });
    builder.addCase(getSentimentLogsByCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Get Sentiment Logs By Language
    builder.addCase(getSentimentLogsByLanguage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getSentimentLogsByLanguage.fulfilled, (state, action: PayloadAction<SentimentLog[]>) => {
      state.logs = action.payload;
      state.loading = false;
    });
    builder.addCase(getSentimentLogsByLanguage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = sentimentSlice.actions;
export default sentimentSlice.reducer;
