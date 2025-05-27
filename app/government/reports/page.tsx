"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart2,
  Calendar,
  Clock,
  Download,
  FileText,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { generateReport } from "@/store/slices/governmentStatsSlice";
import {
  fetchReports,
  deleteReport as deleteReportAction,
  downloadReport as downloadReportAction,
} from "@/store/slices/reportSlice";
import {
  fetchScheduledReports,
  deleteScheduledReport as deleteScheduledReportAction,
} from "@/store/slices/scheduledReportSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/lib/translation-context";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import ReportService from "@/services/report.service";
import {
  formatFrequency,
  formatReportType,
} from "@/services/scheduledReport.service";

// Mock report data
const mockReports = [
  {
    id: "rep-001",
    title: "Monthly Citizen Feedback Analysis",
    type: "feedback",
    date: subDays(new Date(), 2),
    size: "2.4 MB",
    format: "PDF",
    status: "completed",
    url: "/mock-reports/feedback-report.pdf",
  },
  {
    id: "rep-002",
    title: "Office Performance Report",
    type: "performance",
    date: subDays(new Date(), 5),
    size: "1.8 MB",
    format: "PDF",
    status: "completed",
    url: "/mock-reports/performance-report.pdf",
  },
  {
    id: "rep-003",
    title: "Service Usage Statistics",
    type: "services",
    date: subDays(new Date(), 10),
    size: "3.2 MB",
    format: "XLSX",
    status: "completed",
    url: "/mock-reports/service-usage.xlsx",
  },
  {
    id: "rep-004",
    title: "Quarterly Sentiment Analysis",
    type: "sentiment",
    date: subDays(new Date(), 15),
    size: "4.1 MB",
    format: "PDF",
    status: "completed",
    url: "/mock-reports/sentiment-analysis.pdf",
  },
  {
    id: "rep-005",
    title: "Annual Performance Review",
    type: "performance",
    date: subDays(new Date(), 45),
    size: "5.7 MB",
    format: "PDF",
    status: "completed",
    url: "/mock-reports/annual-review.pdf",
  },
];

// Mock scheduled reports
const mockScheduledReports = [
  {
    id: "sched-001",
    title: "Weekly Feedback Summary",
    type: "feedback",
    frequency: "weekly",
    nextRun: addDays(new Date(), 3),
    recipients: ["office.manager@example.com", "team.lead@example.com"],
    status: "active",
  },
  {
    id: "sched-002",
    title: "Monthly Performance Report",
    type: "performance",
    frequency: "monthly",
    nextRun: addDays(new Date(), 12),
    recipients: ["director@example.com", "office.manager@example.com"],
    status: "active",
  },
];

// Helper function to add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default function ReportsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { reportGenerating, reportUrl, reportError } = useAppSelector(
    (state) => state.governmentStats
  );
  const { reports, loading, error, deleting, downloading } = useAppSelector(
    (state) => state.report
  );
  const {
    scheduledReports,
    loading: scheduledLoading,
    error: scheduledError,
    deleting: scheduledDeleting,
  } = useAppSelector((state) => state.scheduledReport);
  const { user } = useAppSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("generated");

  // Fetch reports and scheduled reports on component mount
  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "official")) {
      dispatch(fetchReports());
      dispatch(fetchScheduledReports());
    }
  }, [dispatch, user]);

  // Filter reports based on search term and type
  const filteredReports = reports.filter((report) => {
    // Enhanced search logic - search across multiple fields
    const searchTermLower = searchTerm.toLowerCase().trim();

    if (!searchTermLower) {
      // If no search term, only apply type filter
      const matchesType =
        filterType === "all" || report.report_type === filterType;
      return matchesType;
    }

    // Search in multiple fields with null/undefined checks
    const searchableFields = [
      report.title || "",
      report.filename || "",
      report.office_name || "",
      report.user_name || "",
      ReportService.getReportTypeDisplayName(report.report_type) || "",
      report.format || "",
    ];

    // Debug logging (can be removed later)
    if (searchTermLower && reports.length > 0 && report === reports[0]) {
      console.log("Search Debug - First report searchable fields:", {
        title: report.title,
        filename: report.filename,
        office_name: report.office_name,
        user_name: report.user_name,
        report_type: report.report_type,
        format: report.format,
        searchTerm: searchTermLower,
        searchableFields,
      });
    }

    const matchesSearch = searchableFields.some((field) =>
      field.toLowerCase().includes(searchTermLower)
    );

    const matchesType =
      filterType === "all" || report.report_type === filterType;

    return matchesSearch && matchesType;
  });

  // Handle report download
  const handleDownloadReport = async (report: any) => {
    try {
      await dispatch(downloadReportAction(report)).unwrap();
      toast.success(t("download_started"), {
        description: t("download_started_description"),
      });
    } catch (error) {
      toast.error(t("download_failed"), {
        description: error as string,
      });
    }
  };

  // Handle report deletion
  const handleDeleteReport = async (reportId: string) => {
    try {
      await dispatch(deleteReportAction(reportId)).unwrap();
      toast.success(t("report_deleted"));
    } catch (error) {
      toast.error(t("delete_failed"), {
        description: error as string,
      });
    }
  };

  // Handle scheduled report deletion
  const handleDeleteScheduledReport = async (reportId: string) => {
    try {
      await dispatch(deleteScheduledReportAction(reportId)).unwrap();
      toast.success(t("scheduled_report_deleted"));
    } catch (error) {
      toast.error(t("delete_failed"), {
        description: error as string,
      });
    }
  };

  // Handle generate new report
  const handleGenerateNewReport = () => {
    router.push("/government/reports/generate");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("reports")}</h2>
          <p className="text-muted-foreground">{t("reports_description")}</p>
        </div>
        <Button onClick={handleGenerateNewReport}>
          <Plus className="mr-2 h-4 w-4" />
          {t("generate_new_report")}
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="generated">{t("generated_reports")}</TabsTrigger>
          <TabsTrigger value="scheduled">{t("scheduled_reports")}</TabsTrigger>
        </TabsList>

        <TabsContent value="generated" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={
                  t("search_reports_placeholder") ||
                  "Search by title, filename, office, or type..."
                }
                className="pl-8 pr-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t("filter_by_type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_types")}</SelectItem>
                <SelectItem value="feedback">
                  {t("feedback_analysis")}
                </SelectItem>
                <SelectItem value="performance">
                  {t("performance_report")}
                </SelectItem>
                <SelectItem value="services">{t("service_usage")}</SelectItem>
                <SelectItem value="sentiment">
                  {t("sentiment_analysis")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Results Info */}
          {searchTerm && (
            <div className="text-sm text-muted-foreground">
              {filteredReports.length === 0
                ? `No reports found for "${searchTerm}"`
                : `Found ${filteredReports.length} report${
                    filteredReports.length === 1 ? "" : "s"
                  } for "${searchTerm}"`}
            </div>
          )}

          {loading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-center text-muted-foreground">
                  {t("loading_reports")}
                </p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-center text-destructive">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => dispatch(fetchReports())}
                >
                  {t("retry")}
                </Button>
              </CardContent>
            </Card>
          ) : filteredReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-center text-muted-foreground">
                  {searchTerm || filterType !== "all"
                    ? t("no_matching_reports")
                    : t("no_reports_yet")}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleGenerateNewReport}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("generate_first_report")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.report_id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-md bg-primary/10 p-2">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{report.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3.5 w-3.5" />
                              {format(
                                new Date(report.created_at),
                                "MMM d, yyyy"
                              )}
                            </span>
                            <span className="uppercase">{report.format}</span>
                            <span>
                              {report.file_size_formatted || "Unknown size"}
                            </span>
                            <span
                              className={`capitalize ${
                                ReportService.getReportStatusInfo(report.status)
                                  .color
                              }`}
                            >
                              {
                                ReportService.getReportStatusInfo(report.status)
                                  .label
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(report)}
                          disabled={
                            downloading || report.status !== "completed"
                          }
                        >
                          {downloading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}
                          {t("download")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReport(report.report_id)}
                          disabled={deleting}
                        >
                          {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-medium">{t("scheduled_reports")}</h3>
            <Button variant="outline" size="sm" asChild>
              <Link href="/government/reports/schedule">
                <Plus className="mr-2 h-4 w-4" />
                {t("schedule_new_report")}
              </Link>
            </Button>
          </div>

          {scheduledLoading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-center text-muted-foreground">
                  {t("loading_scheduled_reports")}
                </p>
              </CardContent>
            </Card>
          ) : scheduledError ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Clock className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-center text-destructive">
                  {scheduledError}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => dispatch(fetchScheduledReports())}
                >
                  {t("retry")}
                </Button>
              </CardContent>
            </Card>
          ) : scheduledReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Clock className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-center text-muted-foreground">
                  {t("no_scheduled_reports")}
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/government/reports/schedule">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("schedule_first_report")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {scheduledReports.map((report) => (
                <Card key={report.scheduled_report_id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-md bg-primary/10 p-2">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{report.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="capitalize">
                              {formatFrequency(report.frequency)}
                            </span>
                            <span className="capitalize">
                              {formatReportType(report.report_type)}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3.5 w-3.5" />
                              {t("next_run")}:{" "}
                              {format(
                                new Date(report.next_run_date),
                                "MMM d, yyyy"
                              )}
                            </span>
                            <span>
                              {report.recipients.length} {t("recipients")}
                            </span>
                            <span
                              className={`capitalize ${
                                report.status === "active"
                                  ? "text-green-600"
                                  : report.status === "paused"
                                  ? "text-yellow-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {report.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/government/reports/schedule/${report.scheduled_report_id}`}
                          >
                            {t("edit")}
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteScheduledReport(
                              report.scheduled_report_id
                            )
                          }
                          disabled={scheduledDeleting}
                        >
                          {scheduledDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
