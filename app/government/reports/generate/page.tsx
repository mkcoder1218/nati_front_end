"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileText, Calendar } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/lib/translation-context";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  generateReport,
  clearReportUrl,
} from "@/store/slices/governmentStatsSlice";
import { toast } from "sonner";

// We'll use regular imports and check for window object before using them
// This avoids SSR issues while still allowing us to use the libraries

export default function GenerateReportPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Create a reference to the report content div for PDF generation
  const reportContentRef = useRef<HTMLDivElement>(null);

  // Get report state from Redux
  const {
    reportGenerating,
    reportUrl,
    reportError,
    aiReport,
    reportStartDate,
    reportEndDate,
  } = useAppSelector((state) => state.governmentStats);

  // Form state
  const [reportType, setReportType] = useState("sentiment");
  const [reportFormat, setReportFormat] = useState("pdf");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([
    "Executive Summary",
    "Detailed Feedback",
    "Statistical Analysis",
    "Sentiment Analysis",
    "Top Issues",
    "Improvement Suggestions",
  ]);

  // Get office ID from user context if available
  const { user } = useAppSelector((state) => state.auth);
  const officeId = user?.role === "government" ? user.office_id : undefined;

  // State to track if we're on the client side
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once the component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Clear report data when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearReportUrl());
    };
  }, [dispatch]);

  // Show error toast if report generation fails
  useEffect(() => {
    if (reportError) {
      toast.error(t("failed_to_generate_report"), {
        description: reportError,
      });
    }
  }, [reportError, t]);

  // Handle option toggle
  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((opt) => opt !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  // Function to generate PDF directly in the browser
  const downloadBackendPDF = async () => {
    if (!reportUrl) return;

    try {
      // Show loading toast
      toast.loading(t("downloading_pdf"), {
        id: "pdf-toast",
      });

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Construct the download URL
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
      const downloadUrl = `${baseUrl}${reportUrl}?token=${encodeURIComponent(
        token
      )}`;

      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `report-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success toast
      toast.dismiss("pdf-toast");
      toast.success(t("report_downloaded_successfully"));

      return true;
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.dismiss("pdf-toast");
      toast.error(t("failed_to_download_pdf"));
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dates
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error(t("invalid_date_range"), {
        description: t("start_date_must_be_before_end_date"),
      });
      return;
    }

    try {
      // Dispatch the generate report action with all parameters
      await dispatch(
        generateReport({
          officeId,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          reportType,
          reportFormat,
        })
      ).unwrap();

      // Show success toast
      toast.success(t("report_generated_successfully"));
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  return (
    <div className="container-enhanced section-padding animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="hover:bg-primary/10"
        >
          <Link href="/government/reports">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-gradient font-bold">Generate Report</h1>
          <p className="text-muted-foreground mt-1">
            Create comprehensive reports with AI-powered insights
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="card-elevated animate-slide-up">
          <form onSubmit={handleSubmit}>
            <CardHeader className="bg-gradient-primary rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Report Parameters
              </CardTitle>
              <CardDescription>
                Configure your report settings and select the data you want to
                include
              </CardDescription>
            </CardHeader>
            <CardContent className="content-spacing">
              <div className="space-y-2">
                <Label htmlFor="report-type">{t("report_type")}</Label>
                <Select
                  required
                  value={reportType}
                  onValueChange={setReportType}
                >
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder={t("select_report_type")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sentiment">
                      {t("sentiment_analysis")}
                    </SelectItem>
                    <SelectItem value="feedback">
                      {t("citizen_feedback_analysis")}
                    </SelectItem>
                    <SelectItem value="performance">
                      {t("office_performance")}
                    </SelectItem>
                    <SelectItem value="services">
                      {t("service_usage")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="start-date" className="text-sm font-medium">
                    {t("start_date")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="input-enhanced pl-10"
                    />
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="end-date" className="text-sm font-medium">
                    {t("end_date")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="input-enhanced pl-10"
                    />
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">{t("report_format")}</Label>
                <Select
                  required
                  value={reportFormat}
                  onValueChange={setReportFormat}
                >
                  <SelectTrigger id="format">
                    <SelectValue placeholder={t("select_format")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF {t("document")}</SelectItem>
                    <SelectItem value="excel">
                      Excel {t("spreadsheet")}
                    </SelectItem>
                    <SelectItem value="csv">CSV {t("file")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  {t("include_in_report")}
                </Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    "Executive Summary",
                    "Detailed Feedback",
                    "Statistical Analysis",
                    "Sentiment Analysis",
                    "Top Issues",
                    "Improvement Suggestions",
                    "Comparative Analysis",
                    "Charts and Graphs",
                  ].map((option, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        id={`option-${i}`}
                        checked={selectedOptions.includes(option)}
                        onChange={() => toggleOption(option)}
                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2"
                      />
                      <Label
                        htmlFor={`option-${i}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-background-secondary rounded-b-lg">
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={reportGenerating || !!reportUrl}
              >
                {reportGenerating ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("generating_report")}
                  </>
                ) : reportUrl ? (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {t("report_generated")}
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    {t("generate_report")}
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card
          className={`card-elevated animate-slide-up ${
            reportUrl ? "" : "hidden md:block"
          }`}
        >
          <CardHeader className="bg-gradient-accent rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              {t("report_preview")}
            </CardTitle>
            <CardDescription>
              {reportUrl
                ? t("report_generated_successfully")
                : t("report_preview_will_appear_here")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {reportUrl && aiReport ? (
              <div className="p-6 space-y-6" ref={reportContentRef}>
                <div className="bg-gradient-primary rounded-lg border p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {reportType === "sentiment"
                            ? t("sentiment_analysis")
                            : reportType === "feedback"
                            ? t("citizen_feedback_analysis")
                            : reportType === "performance"
                            ? t("office_performance")
                            : t("service_usage")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {reportFormat.toUpperCase()} {t("document")} •{" "}
                          {reportStartDate && reportEndDate
                            ? `${reportStartDate} - ${reportEndDate}`
                            : t("all_time")}
                        </p>
                      </div>
                    </div>
                    {/* Direct download link as fallback */}
                    {isClient && reportUrl && (
                      <a
                        href={`${
                          process.env.NEXT_PUBLIC_API_URL ||
                          "http://localhost:5002"
                        }${reportUrl}?token=${encodeURIComponent(
                          localStorage.getItem("token") || ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                        onClick={(e) => {
                          // Prevent default to use our custom handler instead
                          e.preventDefault();
                          // Trigger the download button click
                          document
                            .getElementById("download-report-btn")
                            ?.click();
                        }}
                      >
                        {t("direct_link")}
                      </a>
                    )}
                    <Button
                      id="download-report-btn"
                      variant="gradient"
                      size="sm"
                      className="shadow-medium hover:shadow-strong"
                      onClick={async () => {
                        try {
                          if (!isClient) return; // Safety check

                          // Download the PDF from the backend
                          await downloadBackendPDF();
                        } catch (error) {
                          console.error("Error downloading PDF:", error);
                          toast.error(t("failed_to_download_pdf"));

                          // Try to regenerate the report
                          toast.info(t("trying_to_regenerate_report"));
                          try {
                            await dispatch(
                              generateReport({
                                officeId,
                                startDate: startDate || undefined,
                                endDate: endDate || undefined,
                                reportType,
                                reportFormat,
                              })
                            ).unwrap();
                          } catch (regenerateError) {
                            console.error(
                              "Failed to regenerate report:",
                              regenerateError
                            );
                            toast.error(t("failed_to_regenerate_report"));
                          }
                        }
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {t("download")}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    {t("executive_summary")}
                  </h3>
                  <div className="bg-gradient-muted rounded-lg border p-5 shadow-soft max-h-40 overflow-y-auto">
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {aiReport.summary}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    {t("key_insights")}
                  </h3>
                  <div className="bg-gradient-accent rounded-lg border p-5 shadow-soft space-y-3">
                    {aiReport.keyInsights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-xs font-medium text-accent">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed flex-1">
                          {insight}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    {t("recommendations")}
                  </h3>
                  <div className="bg-success-light rounded-lg border p-5 shadow-soft space-y-3">
                    {aiReport.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center text-xs font-medium text-success">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed flex-1">
                          {recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-[400px] items-center justify-center m-6 rounded-lg border-2 border-dashed border-muted bg-gradient-muted">
                <div className="text-center space-y-4 p-8">
                  <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
                    <FileText className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Ready to Generate
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      {t("fill_out_form_to_see_preview")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          {reportUrl && (
            <CardFooter className="bg-background-secondary rounded-b-lg gap-3">
              <Button variant="outline" size="lg" className="flex-1" asChild>
                <Link href="/government/reports">{t("view_all_reports")}</Link>
              </Button>
              <Button
                variant="gradient"
                size="lg"
                className="flex-1"
                onClick={() => dispatch(clearReportUrl())}
              >
                {t("generate_new_report")}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
