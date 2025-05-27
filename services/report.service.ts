import api from "@/lib/api";

export interface Report {
  report_id: string;
  title: string;
  filename: string;
  file_path: string;
  file_size?: number;
  file_size_formatted?: string;
  format: string;
  report_type: 'sentiment' | 'feedback' | 'performance' | 'services';
  office_id?: string;
  user_id: string;
  start_date?: string;
  end_date?: string;
  status: 'generating' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  office_name?: string;
  user_name?: string;
}

export interface ReportResponse {
  status: string;
  data: Report[];
}

export interface SingleReportResponse {
  status: string;
  data: Report;
}

const ReportService = {
  // Get all reports for the current user
  getReports: async (): Promise<Report[]> => {
    try {
      const response = await api.get<ReportResponse>("/reports");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }
  },

  // Get a specific report by ID
  getReportById: async (reportId: string): Promise<Report> => {
    try {
      const response = await api.get<SingleReportResponse>(`/reports/metadata/${reportId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching report:", error);
      throw error;
    }
  },

  // Delete a report
  deleteReport: async (reportId: string): Promise<void> => {
    try {
      await api.delete(`/reports/${reportId}`);
    } catch (error) {
      console.error("Error deleting report:", error);
      throw error;
    }
  },

  // Download a report file
  downloadReport: async (filename: string): Promise<Blob> => {
    try {
      const response = await api.get(`/reports/${filename}`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Error downloading report:", error);
      throw error;
    }
  },

  // Helper function to trigger file download in browser
  downloadReportFile: async (report: Report): Promise<void> => {
    try {
      const blob = await ReportService.downloadReport(report.filename);
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = report.filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report file:", error);
      throw error;
    }
  },

  // Format file size for display
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get report type display name
  getReportTypeDisplayName: (type: string): string => {
    const typeNames: Record<string, string> = {
      sentiment: "Sentiment Analysis",
      feedback: "Feedback Analysis", 
      performance: "Performance Report",
      services: "Service Usage Report"
    };
    return typeNames[type] || type;
  },

  // Get report status display info
  getReportStatusInfo: (status: string): { label: string; color: string } => {
    const statusInfo: Record<string, { label: string; color: string }> = {
      generating: { label: "Generating", color: "text-yellow-600" },
      completed: { label: "Completed", color: "text-green-600" },
      failed: { label: "Failed", color: "text-red-600" }
    };
    return statusInfo[status] || { label: status, color: "text-gray-600" };
  }
};

export default ReportService;
