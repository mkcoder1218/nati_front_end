"use client";

import * as React from "react";
import Link from "next/link";
import { BarChart3, Brain, Calendar, Download, FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector, useAppDispatch } from "@/hooks/use-redux";
import { fetchSentimentBreakdown } from "@/store/slices/governmentStatsSlice";
import { getSentimentStats } from "@/store/slices/sentimentSlice";
import { useTranslation } from "@/lib/translation-context";
import { Badge } from "@/components/ui/badge";

interface SidebarSentimentTabProps {
  className?: string;
}

export function SidebarSentimentTab({ className }: SidebarSentimentTabProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Get user information and role from Redux store
  const { user } = useAppSelector((state) => state.auth);
  const { dashboardStats, loading, aiReport } = useAppSelector(
    (state) => state.governmentStats
  );
  const { stats: sentimentStats, loading: sentimentLoading } = useAppSelector(
    (state) => state.sentiment
  );

  // Track error state
  const [error, setError] = React.useState<string | null>(null);

  // State to track if we're on the client side
  const [isClient, setIsClient] = React.useState(false);

  // Use a ref to track if initial fetch has been done
  const initialFetchDoneRef = React.useRef<boolean>(false);

  // Set isClient to true once the component mounts (client-side only)
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch sentiment data when component mounts (client-side only)
  React.useEffect(() => {
    // Only run this effect on the client side
    if (
      isClient &&
      !initialFetchDoneRef.current &&
      user?.user_id &&
      (user.role === "government" || user.role === "admin")
    ) {
      const fetchData = async () => {
        try {
          setError(null);
          const officeId =
            user.role === "government" ? user.office_id : undefined;

          // Fetch both dashboard stats and real sentiment data
          await Promise.all([
            dispatch(fetchSentimentBreakdown(officeId)).unwrap(),
            dispatch(getSentimentStats()).unwrap(),
          ]);

          initialFetchDoneRef.current = true;
        } catch (error: any) {
          console.error("Error fetching sentiment data:", error);
          setError(error?.message || "Failed to fetch sentiment data");
        }
      };

      fetchData();
    }
  }, [dispatch, user, isClient]);

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

  // Don't show anything if user is not logged in or not a government/admin user
  if (!user?.user_id || (user.role !== "government" && user.role !== "admin")) {
    return null;
  }

  // Show loading state
  if (
    (loading && !dashboardStats?.sentiment_breakdown) ||
    (sentimentLoading && !sentimentStats)
  ) {
    return (
      <div data-sidebar="sentiment-tab" className={cn("p-2", className)}>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4" />
          <h3 className="text-sm font-medium">{t("sentiment_analysis")}</h3>
        </div>
        <div className="mt-2 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div data-sidebar="sentiment-tab" className={cn("p-2", className)}>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4" />
          <h3 className="text-sm font-medium">{t("sentiment_analysis")}</h3>
        </div>
        <div className="mt-2 p-2 text-sm text-red-500 bg-red-50 rounded-md">
          <p>{t("error_loading_sentiment")}</p>
          <button
            onClick={() => {
              if (!isClient) return; // Safety check
              initialFetchDoneRef.current = false;
              const officeId =
                user.role === "government" ? user.office_id : undefined;
              dispatch(fetchSentimentBreakdown(officeId));
            }}
            className="text-xs text-blue-500 hover:underline mt-1"
          >
            {t("try_again")}
          </button>
        </div>
      </div>
    );
  }

  // If we have sentiment data, show it
  if (dashboardStats?.sentiment_breakdown) {
    const { positive, neutral, negative } = dashboardStats.sentiment_breakdown;
    const total = positive + neutral + negative;

    // Calculate percentages
    const positivePercentage = Math.round((positive / total) * 100) || 0;
    const neutralPercentage = Math.round((neutral / total) * 100) || 0;
    const negativePercentage = Math.round((negative / total) * 100) || 0;

    return (
      <div data-sidebar="sentiment-tab" className={cn("p-2", className)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <h3 className="text-sm font-medium">{t("sentiment_analysis")}</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            <BarChart3 className="h-3 w-3 mr-1" />
            {t("ai_powered")}
          </Badge>
        </div>

        <div className="mt-3 space-y-3">
          {/* Sentiment Breakdown */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{t("positive")}</span>
              <span className="font-medium">{positivePercentage}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${positivePercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{t("neutral")}</span>
              <span className="font-medium">{neutralPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-400 rounded-full"
                style={{ width: `${neutralPercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{t("negative")}</span>
              <span className="font-medium">{negativePercentage}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${negativePercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {aiReport && (
          <>
            <Separator className="my-3" />
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs font-medium">
                <FileText className="h-3 w-3" />
                <span>{t("ai_insights")}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {aiReport.keyInsights[0]}
              </p>
            </div>
          </>
        )}

        {/* Generate Report Button */}
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            asChild
          >
            <Link href="/government/reports/generate">
              <Download className="h-3 w-3 mr-1" />
              {t("generate_detailed_report")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
