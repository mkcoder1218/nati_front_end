"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart2,
  Calendar,
  Download,
  Filter,
  Loader2,
  MessageSquare,
  PieChart,
  RefreshCw,
  ThumbsUp,
  Users,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  fetchDashboardStats,
  fetchSentimentBreakdown,
  fetchTopIssues,
  generateReport,
  fetchTimeSeriesData,
} from "@/store/slices/governmentStatsSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/translation-context";
import { toast } from "sonner";
import { format, subMonths } from "date-fns";

// Remove mock data - we'll use real data from the backend

export default function GovernmentAnalyticsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    dashboardStats,
    timeSeriesData,
    loading,
    timeSeriesLoading,
    error,
    reportGenerating,
    reportUrl,
    reportError,
  } = useAppSelector((state) => state.governmentStats);

  const [officeId, setOfficeId] = useState<string | undefined>(
    user?.role === "official" ? user?.office_id : undefined
  );
  const [timeRange, setTimeRange] = useState("6months");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch dashboard stats and time series data on component mount
  useEffect(() => {
    dispatch(fetchDashboardStats(officeId));
    dispatch(fetchTimeSeriesData({ officeId, timeRange }));
  }, [dispatch, officeId]);

  // Fetch time series data when time range changes
  useEffect(() => {
    dispatch(fetchTimeSeriesData({ officeId, timeRange }));
  }, [dispatch, officeId, timeRange]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(t("failed_to_fetch_dashboard_stats"), {
        description: error,
      });
    }
    if (reportError) {
      toast.error(t("failed_to_generate_report"), {
        description: reportError,
      });
    }
  }, [error, reportError, t]);

  // Handle report generation
  const handleGenerateReport = async () => {
    try {
      await dispatch(generateReport({ officeId })).unwrap();
      toast.success(t("report_generated_successfully"), {
        description: t("using_mock_report"),
      });
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  // Handle refresh data
  const handleRefreshData = () => {
    dispatch(fetchDashboardStats(officeId));
    dispatch(fetchSentimentBreakdown(officeId));
    dispatch(fetchTopIssues(officeId));
    dispatch(fetchTimeSeriesData({ officeId, timeRange }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("detailed_analytics")}
          </h2>
          <p className="text-muted-foreground">
            {t("detailed_analytics_description")}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t("select_time_range")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">{t("last_month")}</SelectItem>
              <SelectItem value="3months">{t("last_3_months")}</SelectItem>
              <SelectItem value="6months">{t("last_6_months")}</SelectItem>
              <SelectItem value="1year">{t("last_year")}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefreshData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("refresh_data")}
          </Button>
          <Button onClick={handleGenerateReport} disabled={reportGenerating}>
            {reportGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("generating")}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {t("generate_report")}
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="sentiment">{t("sentiment_analysis")}</TabsTrigger>
          <TabsTrigger value="issues">{t("issues_analysis")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("total_reviews")}
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.office_summary.total_reviews.toLocaleString() ||
                    "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats?.office_summary.monthly_change.reviews > 0
                    ? "+"
                    : ""}
                  {dashboardStats?.office_summary.monthly_change.reviews || 0}{" "}
                  {t("from_last_month")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("average_rating")}
                </CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.office_summary.average_rating.toFixed(1) ||
                    "0.0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats?.office_summary.monthly_change.rating > 0
                    ? "+"
                    : ""}
                  {dashboardStats?.office_summary.monthly_change.rating.toFixed(
                    1
                  ) || 0}{" "}
                  {t("from_last_month")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("citizens_served")}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.office_summary.citizens_served.toLocaleString() ||
                    "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats?.office_summary.monthly_change.citizens > 0
                    ? "+"
                    : ""}
                  {dashboardStats?.office_summary.monthly_change.citizens || 0}{" "}
                  {t("from_last_month")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("positive_feedback")}
                </CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.office_summary
                    .positive_feedback_percentage || "0"}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats?.office_summary.monthly_change
                    .positive_percentage > 0
                    ? "+"
                    : ""}
                  {dashboardStats?.office_summary.monthly_change
                    .positive_percentage || 0}
                  % {t("from_last_month")}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>{t("ratings_over_time")}</CardTitle>
                <CardDescription>{t("average_rating_trend")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {timeSeriesLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : timeSeriesData?.ratings_over_time &&
                    timeSeriesData.ratings_over_time.length > 0 ? (
                    <div className="flex h-full flex-col justify-between">
                      <div className="space-y-4">
                        {timeSeriesData.ratings_over_time.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-12 text-sm text-muted-foreground">
                              {item.date}
                            </div>
                            <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-primary"
                                style={{
                                  width: `${
                                    (parseFloat(item.value.toString()) / 5) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                            <div className="w-10 text-sm font-medium">
                              {parseFloat(item.value.toString()).toFixed(1)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-6 text-center text-sm text-muted-foreground">
                        {t("ratings_scale_note")}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <p>{t("no_ratings_data")}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>{t("reviews_over_time")}</CardTitle>
                <CardDescription>{t("monthly_review_count")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {timeSeriesLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : timeSeriesData?.reviews_over_time &&
                    timeSeriesData.reviews_over_time.length > 0 ? (
                    <div className="flex h-full flex-col justify-between">
                      <div className="space-y-4">
                        {timeSeriesData.reviews_over_time.map((item, index) => {
                          const maxReviews = Math.max(
                            ...timeSeriesData.reviews_over_time.map((r) =>
                              parseInt(r.value.toString())
                            )
                          );
                          const percentage =
                            maxReviews > 0
                              ? (parseInt(item.value.toString()) / maxReviews) *
                                100
                              : 0;

                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <div className="w-12 text-sm text-muted-foreground">
                                {item.date}
                              </div>
                              <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <div className="w-10 text-sm font-medium">
                                {item.value}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="pt-6 text-center text-sm text-muted-foreground">
                        {t("reviews_count_note")}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <p>{t("no_reviews_data")}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("sentiment_breakdown")}</CardTitle>
              <CardDescription>{t("ai_powered_analysis")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <h3 className="text-lg font-medium">
                    {t("current_sentiment")}
                  </h3>
                  <div className="flex h-[200px] w-full items-end justify-center gap-8">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-16 rounded-t-md bg-green-500 relative"
                        style={{
                          height: `${Math.max(
                            20,
                            (dashboardStats?.sentiment_breakdown.positive ||
                              0) * 2
                          )}px`,
                        }}
                      >
                        <div className="absolute -top-6 font-medium">
                          {dashboardStats?.sentiment_breakdown.positive || 0}%
                        </div>
                      </div>
                      <span className="mt-2 text-sm">{t("positive")}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className="w-16 rounded-t-md bg-gray-400 relative"
                        style={{
                          height: `${Math.max(
                            20,
                            (dashboardStats?.sentiment_breakdown.neutral || 0) *
                              2
                          )}px`,
                        }}
                      >
                        <div className="absolute -top-6 font-medium">
                          {dashboardStats?.sentiment_breakdown.neutral || 0}%
                        </div>
                      </div>
                      <span className="mt-2 text-sm">{t("neutral")}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className="w-16 rounded-t-md bg-red-500 relative"
                        style={{
                          height: `${Math.max(
                            20,
                            (dashboardStats?.sentiment_breakdown.negative ||
                              0) * 2
                          )}px`,
                        }}
                      >
                        <div className="absolute -top-6 font-medium">
                          {dashboardStats?.sentiment_breakdown.negative || 0}%
                        </div>
                      </div>
                      <span className="mt-2 text-sm">{t("negative")}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {t("sentiment_trends")}
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">
                          {t("positive_sentiment")}
                        </span>
                        <span className="text-sm font-medium">
                          {timeSeriesData?.sentiment_over_time?.positive &&
                          timeSeriesData.sentiment_over_time.positive.length > 0
                            ? timeSeriesData.sentiment_over_time.positive[
                                timeSeriesData.sentiment_over_time.positive
                                  .length - 1
                              ].value
                            : dashboardStats?.sentiment_breakdown?.positive ||
                              0}
                          %
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${
                              timeSeriesData?.sentiment_over_time?.positive &&
                              timeSeriesData.sentiment_over_time.positive
                                .length > 0
                                ? timeSeriesData.sentiment_over_time.positive[
                                    timeSeriesData.sentiment_over_time.positive
                                      .length - 1
                                  ].value
                                : dashboardStats?.sentiment_breakdown
                                    ?.positive || 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          {t("neutral_sentiment")}
                        </span>
                        <span className="text-sm font-medium">
                          {timeSeriesData?.sentiment_over_time?.neutral &&
                          timeSeriesData.sentiment_over_time.neutral.length > 0
                            ? timeSeriesData.sentiment_over_time.neutral[
                                timeSeriesData.sentiment_over_time.neutral
                                  .length - 1
                              ].value
                            : dashboardStats?.sentiment_breakdown?.neutral || 0}
                          %
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gray-400"
                          style={{
                            width: `${
                              timeSeriesData?.sentiment_over_time?.neutral &&
                              timeSeriesData.sentiment_over_time.neutral
                                .length > 0
                                ? timeSeriesData.sentiment_over_time.neutral[
                                    timeSeriesData.sentiment_over_time.neutral
                                      .length - 1
                                  ].value
                                : dashboardStats?.sentiment_breakdown
                                    ?.neutral || 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-600">
                          {t("negative_sentiment")}
                        </span>
                        <span className="text-sm font-medium">
                          {timeSeriesData?.sentiment_over_time?.negative &&
                          timeSeriesData.sentiment_over_time.negative.length > 0
                            ? timeSeriesData.sentiment_over_time.negative[
                                timeSeriesData.sentiment_over_time.negative
                                  .length - 1
                              ].value
                            : dashboardStats?.sentiment_breakdown?.negative ||
                              0}
                          %
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{
                            width: `${
                              timeSeriesData?.sentiment_over_time?.negative &&
                              timeSeriesData.sentiment_over_time.negative
                                .length > 0
                                ? timeSeriesData.sentiment_over_time.negative[
                                    timeSeriesData.sentiment_over_time.negative
                                      .length - 1
                                  ].value
                                : dashboardStats?.sentiment_breakdown
                                    ?.negative || 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>{t("positive_feedback_keywords")}</CardTitle>
                <CardDescription>
                  {t("most_mentioned_positive_terms")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "Helpful",
                    "Efficient",
                    "Professional",
                    "Quick",
                    "Friendly",
                  ].map((keyword, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{keyword}</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 50) + 10} {t("mentions")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>{t("neutral_feedback_keywords")}</CardTitle>
                <CardDescription>
                  {t("most_mentioned_neutral_terms")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Average", "Okay", "Standard", "Normal", "Expected"].map(
                    (keyword, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">{keyword}</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 30) + 5} {t("mentions")}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>{t("negative_feedback_keywords")}</CardTitle>
                <CardDescription>
                  {t("most_mentioned_negative_terms")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "Slow",
                    "Confusing",
                    "Complicated",
                    "Delayed",
                    "Unhelpful",
                  ].map((keyword, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{keyword}</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 20) + 5} {t("mentions")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("top_issues")}</CardTitle>
              <CardDescription>{t("most_mentioned_concerns")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : dashboardStats?.top_issues &&
                  dashboardStats.top_issues.length > 0 ? (
                  dashboardStats.top_issues.map((issue, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{issue.issue}</span>
                        <span className="text-sm text-muted-foreground">
                          {issue.count} {t("mentions")} ({issue.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${issue.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    {t("no_issues_found")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("improvement_suggestions")}</CardTitle>
                <CardDescription>
                  {t("ai_generated_suggestions")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">{t("reduce_waiting_times")}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("waiting_times_suggestion")}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">
                      {t("improve_documentation")}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("documentation_suggestion")}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">{t("staff_training")}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("staff_training_suggestion")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("issue_resolution_tracking")}</CardTitle>
                <CardDescription>
                  {t("track_issue_resolution_progress")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {t("long_waiting_times")}
                      </span>
                      <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                        {t("in_progress")}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-yellow-500 w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {t("unclear_requirements")}
                      </span>
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {t("resolved")}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-green-500 w-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {t("staff_responsiveness")}
                      </span>
                      <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                        {t("not_started")}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-red-500 w-0" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {t("document_processing")}
                      </span>
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {t("planned")}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-blue-500 w-1/4" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
