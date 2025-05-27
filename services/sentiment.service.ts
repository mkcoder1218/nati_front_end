import api from '@/lib/api';

export interface SentimentAnalysisRequest {
  text: string;
  language?: 'en' | 'am';
}

export interface SentimentAnalysisResponse {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  language: 'en' | 'am';
}

export interface SentimentStats {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

export interface SentimentLog {
  log_id: string;
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  language: 'en' | 'am';
  category?: string;
  created_at: string;
}

const SentimentService = {
  // Analyze text sentiment
  analyzeText: async (data: SentimentAnalysisRequest): Promise<SentimentAnalysisResponse> => {
    const response = await api.post('/sentiment/analyze', data);
    return response.data.data;
  },

  // Get sentiment statistics (admin/official only)
  getSentimentStats: async (): Promise<SentimentStats> => {
    const response = await api.get('/sentiment/stats');
    return response.data.data.stats;
  },

  // Get sentiment logs by sentiment type (admin/official only)
  getSentimentLogsBySentiment: async (sentiment: 'positive' | 'negative' | 'neutral'): Promise<SentimentLog[]> => {
    const response = await api.get(`/sentiment/sentiment/${sentiment}`);
    return response.data.data.logs;
  },

  // Get sentiment logs by category (admin/official only)
  getSentimentLogsByCategory: async (category: string): Promise<SentimentLog[]> => {
    const response = await api.get(`/sentiment/category/${category}`);
    return response.data.data.logs;
  },

  // Get sentiment logs by language (admin/official only)
  getSentimentLogsByLanguage: async (language: 'en' | 'am'): Promise<SentimentLog[]> => {
    const response = await api.get(`/sentiment/language/${language}`);
    return response.data.data.logs;
  },
};

export default SentimentService;
