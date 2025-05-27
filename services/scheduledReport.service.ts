import api from "@/lib/api";

export interface ScheduledReport {
  scheduled_report_id: string;
  title: string;
  report_type: 'sentiment' | 'feedback' | 'performance' | 'services';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  office_id?: string;
  user_id: string;
  recipients: string[];
  next_run_date: string;
  last_run_date?: string;
  status: 'active' | 'paused' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
  office_name?: string;
  user_name?: string;
}

export interface CreateScheduledReportData {
  title: string;
  report_type: 'sentiment' | 'feedback' | 'performance' | 'services';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  office_id?: string;
  recipients: string[];
  notes?: string;
}

export interface UpdateScheduledReportData {
  title?: string;
  report_type?: 'sentiment' | 'feedback' | 'performance' | 'services';
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  office_id?: string;
  recipients?: string[];
  status?: 'active' | 'paused' | 'inactive';
  notes?: string;
}

export interface ScheduledReportResponse {
  status: string;
  data: ScheduledReport[];
}

export interface SingleScheduledReportResponse {
  status: string;
  data: ScheduledReport;
}

export interface CreateScheduledReportResponse {
  status: string;
  message: string;
  data: ScheduledReport;
}

export interface UpdateScheduledReportResponse {
  status: string;
  message: string;
  data: ScheduledReport;
}

export interface DeleteScheduledReportResponse {
  status: string;
  message: string;
}

// Create a new scheduled report
export const createScheduledReport = async (data: CreateScheduledReportData): Promise<CreateScheduledReportResponse> => {
  const response = await api.post<CreateScheduledReportResponse>('/scheduled-reports', data);
  return response.data;
};

// Get all scheduled reports
export const getScheduledReports = async (params?: {
  office_id?: string;
  status?: string;
}): Promise<ScheduledReportResponse> => {
  const response = await api.get<ScheduledReportResponse>('/scheduled-reports', { params });
  return response.data;
};

// Get scheduled report by ID
export const getScheduledReportById = async (scheduledReportId: string): Promise<SingleScheduledReportResponse> => {
  const response = await api.get<SingleScheduledReportResponse>(`/scheduled-reports/${scheduledReportId}`);
  return response.data;
};

// Update scheduled report
export const updateScheduledReport = async (
  scheduledReportId: string,
  data: UpdateScheduledReportData
): Promise<UpdateScheduledReportResponse> => {
  const response = await api.put<UpdateScheduledReportResponse>(`/scheduled-reports/${scheduledReportId}`, data);
  return response.data;
};

// Delete scheduled report
export const deleteScheduledReport = async (scheduledReportId: string): Promise<DeleteScheduledReportResponse> => {
  const response = await api.delete<DeleteScheduledReportResponse>(`/scheduled-reports/${scheduledReportId}`);
  return response.data;
};

// Helper function to format frequency for display
export const formatFrequency = (frequency: string): string => {
  const frequencyMap: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
  };
  return frequencyMap[frequency] || frequency;
};

// Helper function to format report type for display
export const formatReportType = (reportType: string): string => {
  const typeMap: Record<string, string> = {
    sentiment: 'Sentiment Analysis',
    feedback: 'Feedback Analysis',
    performance: 'Performance Report',
    services: 'Service Usage',
  };
  return typeMap[reportType] || reportType;
};

// Helper function to format status for display
export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: 'Active',
    paused: 'Paused',
    inactive: 'Inactive',
  };
  return statusMap[status] || status;
};
