"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart2,
  FileText,
  MessageSquare,
  ThumbsUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchDashboardStats } from "@/store/slices/governmentStatsSlice";
import { getSentimentStats } from "@/store/slices/sentimentSlice";
import { useTranslation } from "@/lib/translation-context";

export default function GovernmentDashboardPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { dashboardStats, loading, error } = useAppSelector(
    (state) => state.governmentStats
  );
  const { stats: sentimentStats, loading: sentimentLoading } = useAppSelector(
    (state) => state.sentiment
  );

  const [officeId, setOfficeId] = useState<string | undefined>(
    user?.role === "official" ? user?.office_id : undefined
  );

  // Calculate real sentiment percentages from sentiment stats
  const getRealSentimentBreakdown = () => {
    if (!sentimentStats || sentimentStats.total === 0) {
      return { positive: 0, neutral: 0, negative: 0 };
    }

    const total = sentimentStats.total;
    return {
      positive: Math.round((sentimentStats.positive / total) * 100),
      neutral: Math.round((sentimentStats.neutral / total) * 100),
      negative: Math.round((sentimentStats.negative / total) * 100),
    };
  };

  // Use real sentiment data if available, otherwise fall back to dashboard stats
  const sentimentBreakdown = sentimentStats
    ? getRealSentimentBreakdown()
    : dashboardStats?.sentiment_breakdown;

  // Update office ID when user changes
  useEffect(() => {
    if (user?.role === "official" && user?.office_id) {
      console.log(
        "Government official detected, setting office_id:",
        user.office_id
      );
      console.log("Office name:", user.office_name);
      setOfficeId(user.office_id);
    } else if (user?.role === "admin") {
      console.log("Admin user detected, showing all offices data");
      setOfficeId(undefined);
    }
  }, [user]);

  // Fetch dashboard stats when office ID changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(
          "Fetching dashboard stats for office:",
          officeId || "all offices"
        );
        console.log("User role:", user?.role);
        console.log("User office_id:", user?.office_id);
        console.log("User office_name:", user?.office_name);

        await dispatch(fetchDashboardStats(officeId)).unwrap();
        console.log("Dashboard stats fetched successfully");

        // Also fetch real sentiment data
        console.log("Fetching real sentiment data...");
        await dispatch(getSentimentStats()).unwrap();
        console.log("Sentiment stats fetched successfully");
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Don't show toast for 404 errors in development mode
        if (
          process.env.NODE_ENV !== "development" ||
          (error as any)?.status !== 404
        ) {
          toast.error(t("failed_to_fetch_dashboard_stats"));
        }
      }
    };

    // Only fetch if we have a user
    if (user) {
      fetchData();
    }
  }, [dispatch, officeId, user, t]);

  // Navigate to generate report page
  const handleNavigateToGenerateReport = () => {
    router.push("/government/reports/generate");
  };

  // Show error if any
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-gradient font-bold">
            {t("government_dashboard")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("welcome_to")} {user?.office_name || t("government_portal")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="gradient"
            size="lg"
            onClick={handleNavigateToGenerateReport}
            className="shadow-medium hover:shadow-strong"
          >
            <FileText className="mr-2 h-5 w-5" />
            {t("generate_report")}
          </Button>
        </div>
      </div>

      {loading && !dashboardStats ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-elevated animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("total_reviews")}
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">
              {dashboardStats?.office_summary.total_reviews.toLocaleString() ||
                "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {(dashboardStats?.office_summary.monthly_change?.reviews || 0) > 0
                ? "+"
                : ""}
              {dashboardStats?.office_summary.monthly_change?.reviews || "0"}{" "}
              {t("from_last_month")}
            </p>
          </CardContent>
        </Card>
        <Card
          className="card-elevated animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("average_rating")}
            </CardTitle>
            <div className="p-2 bg-accent/10 rounded-lg">
              <svg
                className="h-4 w-4 text-accent"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">
              {dashboardStats?.office_summary.average_rating.toFixed(1) ||
                "0.0"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {(dashboardStats?.office_summary.monthly_change?.rating || 0) > 0
                ? "+"
                : ""}
              {dashboardStats?.office_summary.monthly_change?.rating?.toFixed(
                1
              ) || "0.0"}{" "}
              {t("from_last_month")}
            </p>
          </CardContent>
        </Card>
        <Card
          className="card-elevated animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("citizens_served")}
            </CardTitle>
            <div className="p-2 bg-success/10 rounded-lg">
              <Users className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">
              {dashboardStats?.office_summary.citizens_served.toLocaleString() ||
                "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {(dashboardStats?.office_summary.monthly_change?.citizens || 0) >
              0
                ? "+"
                : ""}
              {dashboardStats?.office_summary.monthly_change?.citizens || "0"}{" "}
              {t("from_last_month")}
            </p>
          </CardContent>
        </Card>
        <Card
          className="card-elevated animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("positive_feedback")}
            </CardTitle>
            <div className="p-2 bg-warning/10 rounded-lg">
              <ThumbsUp className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">
              {dashboardStats?.office_summary.positive_feedback_percentage}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {(dashboardStats?.office_summary.monthly_change
                ?.positive_percentage || 0) > 0
                ? "+"
                : ""}
              {dashboardStats?.office_summary.monthly_change
                ?.positive_percentage || "0"}
              % {t("from_last_month")}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-8 lg:grid-cols-7">
        <Card
          className="lg:col-span-4 card-elevated animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <CardHeader className="bg-gradient-primary rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              {t("sentiment_analysis")}
            </CardTitle>
            <CardDescription>{t("ai_powered_analysis")}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              {loading && !dashboardStats ? (
                <div className="flex h-full items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-4">
                  <div className="w-full max-w-md space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">
                        {t("sentiment_breakdown")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("powered_by_ai")}
                      </p>
                    </div>

                    {sentimentBreakdown ? (
                      <div className="space-y-4">
                        {/* Positive Sentiment */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-sm font-medium">
                                {t("positive")}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-green-600">
                              {sentimentBreakdown.positive}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${sentimentBreakdown.positive}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Neutral Sentiment */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                              <span className="text-sm font-medium">
                                {t("neutral")}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-600">
                              {sentimentBreakdown.neutral}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-gray-400 to-gray-600 h-3 rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${sentimentBreakdown.neutral}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Negative Sentiment */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <span className="text-sm font-medium">
                                {t("negative")}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-red-600">
                              {sentimentBreakdown.negative}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${sentimentBreakdown.negative}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold text-green-600">
                                {sentimentBreakdown.positive}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {t("positive")}
                              </div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-600">
                                {sentimentBreakdown.neutral}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {t("neutral")}
                              </div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-red-600">
                                {sentimentBreakdown.negative}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {t("negative")}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : sentimentLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {t("loading_sentiment_data")}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <div className="text-4xl mb-2">📊</div>
                        <p>{t("no_sentiment_data")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-background-secondary rounded-b-lg">
            <Button
              variant="gradient"
              size="lg"
              className="w-full shadow-medium hover:shadow-strong"
              asChild
            >
              <Link href="/government/analytics">
                <BarChart2 className="mr-2 h-5 w-5" />
                {t("view_detailed_analytics")}
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card
          className="lg:col-span-3 card-elevated animate-slide-up"
          style={{ animationDelay: "0.5s" }}
        >
          <CardHeader className="bg-gradient-accent rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              {t("top_issues")}
            </CardTitle>
            <CardDescription>{t("most_mentioned_concerns")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && !dashboardStats ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : dashboardStats?.top_issues &&
              dashboardStats.top_issues.length > 0 ? (
              dashboardStats.top_issues.map((issue, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{issue.issue}</span>
                    <span className="text-sm text-muted-foreground">
                      {issue.count} {t("mentions")}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${issue.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                <p>{t("no_issues_found")}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-background-secondary rounded-b-lg">
            <Button
              variant="gradient"
              size="lg"
              className="w-full shadow-medium hover:shadow-strong"
              onClick={handleNavigateToGenerateReport}
            >
              <FileText className="mr-2 h-5 w-5" />
              {t("generate_detailed_report")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
