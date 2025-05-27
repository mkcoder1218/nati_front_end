import api from "@/lib/api";

export interface OfficeSummary {
  total_reviews: number;
  average_rating: number;
  citizens_served: number;
  positive_feedback_percentage: number;
  monthly_change: {
    reviews: number;
    rating: number;
    citizens: number;
    positive_percentage: number;
  };
}

export interface TopIssue {
  issue: string;
  count: number;
  percentage: number;
}

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

export interface AIReport {
  summary: string;
  keyInsights: string[];
  recommendations: string[];
  trendAnalysis: string;
  fullAnalysis: string;
}

export interface GovernmentDashboardStats {
  office_summary: OfficeSummary;
  sentiment_breakdown: SentimentBreakdown;
  top_issues: TopIssue[];
  ai_insights?: AIReport; // Add AI insights to dashboard stats
}

// Empty default stats structure - no mock data
const emptyDashboardStats: GovernmentDashboardStats = {
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

const GovernmentStatsService = {
  // Get dashboard statistics for government officials
  getDashboardStats: async (
    officeId?: string
  ): Promise<GovernmentDashboardStats> => {
    try {
      const endpoint = officeId
        ? `/government/dashboard/stats?office_id=${officeId}`
        : "/government/dashboard/stats";

      const response = await api.get(endpoint);
      return response.data.data;
    } catch (error) {
      console.warn(
        "Government dashboard API not available, using real sentiment data only"
      );

      try {
        // Get real sentiment data directly
        const sentimentResponse = await api.get("/sentiment/stats");
        const stats = sentimentResponse.data.data.stats;

        // Calculate total for percentages
        const total = stats.positive + stats.neutral + stats.negative;

        let sentimentBreakdown;
        if (total === 0) {
          sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 };
        } else {
          sentimentBreakdown = {
            positive: Math.round((stats.positive / total) * 100),
            neutral: Math.round((stats.neutral / total) * 100),
            negative: Math.round((stats.negative / total) * 100),
          };
        }

        // Return empty stats with real sentiment data only
        return {
          ...emptyDashboardStats,
          sentiment_breakdown: sentimentBreakdown,
        };
      } catch (sentimentError) {
        console.warn("Failed to fetch sentiment data, returning empty stats");
        return emptyDashboardStats;
      }
    }
  },

  // Get sentiment breakdown for an office
  getSentimentBreakdown: async (
    officeId?: string
  ): Promise<SentimentBreakdown> => {
    try {
      // Use the real sentiment stats API
      const response = await api.get("/sentiment/stats");
      const stats = response.data.data.stats;

      // Calculate total for percentages
      const total = stats.positive + stats.neutral + stats.negative;

      if (total === 0) {
        return { positive: 0, neutral: 0, negative: 0 };
      }

      // Return percentages
      return {
        positive: Math.round((stats.positive / total) * 100),
        neutral: Math.round((stats.neutral / total) * 100),
        negative: Math.round((stats.negative / total) * 100),
      };
    } catch (error) {
      console.warn("Failed to fetch real sentiment data:", error);
      // Return empty sentiment data instead of mock data
      return { positive: 0, neutral: 0, negative: 0 };
    }
  },

  // Get top issues for an office
  getTopIssues: async (officeId?: string): Promise<TopIssue[]> => {
    try {
      const endpoint = officeId
        ? `/government/issues/top?office_id=${officeId}`
        : "/government/issues/top";

      const response = await api.get(endpoint);
      return response.data.data.issues;
    } catch (error) {
      console.warn(
        "Top issues API endpoint not available - returning empty array"
      );
      // Return empty array instead of mock data
      return [];
    }
  },

  // Get time series data for analytics
  getTimeSeriesData: async (
    officeId?: string,
    timeRange: string = "6months"
  ): Promise<any> => {
    try {
      const params = new URLSearchParams();
      if (officeId) {
        params.append("office_id", officeId);
      }
      params.append("time_range", timeRange);

      const endpoint = `/government/analytics/timeseries?${params.toString()}`;
      const response = await api.get(endpoint);
      return response.data.data;
    } catch (error) {
      console.warn(
        "Time series API endpoint not available - returning empty data"
      );
      // Return empty data structure instead of mock data
      return {
        ratings_over_time: [],
        reviews_over_time: [],
        sentiment_over_time: {
          positive: [],
          neutral: [],
          negative: [],
        },
      };
    }
  },

  // Generate a detailed report for an office
  // Note: For officials, officeId is automatically determined from their user record
  // For admins, officeId can be specified to generate reports for specific offices
  generateReport: async (
    officeId?: string,
    startDate?: string,
    endDate?: string,
    reportType: string = "sentiment",
    reportFormat: string = "pdf"
  ): Promise<{ reportUrl: string; aiReport: AIReport }> => {
    try {
      // Build the endpoint with query parameters
      let endpoint = "/government/reports/generate";
      const params = new URLSearchParams();

      // Only add office_id for admins - officials will have it automatically determined
      if (officeId) params.append("office_id", officeId);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (reportType) params.append("report_type", reportType);
      if (reportFormat) params.append("report_format", reportFormat);

      const queryString = params.toString();
      if (queryString) endpoint += `?${queryString}`;

      console.log("🔄 Generating report with endpoint:", endpoint);
      console.log("📋 Report parameters:", {
        officeId,
        startDate,
        endDate,
        reportType,
        reportFormat,
      });

      const response = await api.get(endpoint);

      console.log("Report generation successful:", response.data);

      // Ensure the reportUrl doesn't have duplicate /api/ prefixes
      let reportUrl = response.data.data.reportUrl;

      // Log the original URL for debugging
      console.log("Original report URL from backend:", reportUrl);

      // Remove any duplicate /api/ prefixes
      if (reportUrl.startsWith("/api/api/")) {
        reportUrl = reportUrl.replace("/api/api/", "/api/");
        console.log("Fixed report URL:", reportUrl);
      }

      return {
        reportUrl: reportUrl,
        aiReport: response.data.data.aiReport,
      };
    } catch (error: any) {
      console.error("Report generation failed:", error);

      // Log more detailed error information
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message);
      }

      console.warn("Report generation API endpoint not available");
      // For development/testing, return mock data
      return {
        reportUrl: "/mock-report.pdf",
        aiReport: {
          summary:
            "This is a mock AI-generated report summary for development purposes.",
          keyInsights: [
            "62% of feedback was positive, indicating overall satisfaction with services.",
            "The most common issue was 'Long Waiting Times' (32%).",
            "14% of feedback was negative, suggesting areas for improvement.",
            "Staff behavior was the second most mentioned concern (21%).",
          ],
          recommendations: [
            "Address the primary concern of 'Long Waiting Times' through process improvements.",
            "Implement regular staff training on customer service best practices.",
            "Establish a feedback loop to continuously monitor and address citizen concerns.",
            "Consider digital solutions to streamline service delivery and reduce wait times.",
          ],
          trendAnalysis:
            "The ratio of positive to negative feedback is 62:14 (82% vs 18%), indicating an overall positive citizen experience.",
          fullAnalysis:
            "This is a mock full analysis for development purposes. In production, this would contain a comprehensive analysis of the sentiment data.",
        },
      };
    }
  },

  // Download a generated report
  downloadReport: async (reportUrl: string): Promise<Blob> => {
    try {
      const response = await api.get(reportUrl, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.warn("Report download API endpoint not available");
      // For development/testing, throw an error
      throw new Error("Report download failed");
    }
  },
};

export default GovernmentStatsService;
