"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BarChart2, Download, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchDashboardStats, generateReport } from "@/store/slices/governmentStatsSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TestNavigation } from "@/components/test-navigation";

export default function GovernmentTestPage() {
  const dispatch = useAppDispatch();
  const { dashboardStats, loading, error, reportGenerating, reportUrl } = useAppSelector(
    (state) => state.governmentStats
  );

  useEffect(() => {
    dispatch(fetchDashboardStats(undefined));
  }, [dispatch]);

  const handleGenerateReport = async () => {
    try {
      await dispatch(generateReport(undefined)).unwrap();
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Government API Integration Test</h1>
      <TestNavigation />
      
      <div className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Government Dashboard Stats</CardTitle>
            <CardDescription>Test fetching government dashboard statistics from the backend</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            
            {error && (
              <Alert className="bg-red-50 border-red-200 mb-4">
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {!loading && !error && dashboardStats && (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200 mb-4">
                  <AlertTitle className="text-green-800">Success</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Successfully fetched government dashboard statistics.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Office Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Reviews:</span>
                        <span className="font-medium">{dashboardStats.office_summary.total_reviews}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Rating:</span>
                        <span className="font-medium">{dashboardStats.office_summary.average_rating.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Citizens Served:</span>
                        <span className="font-medium">{dashboardStats.office_summary.citizens_served}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Positive Feedback:</span>
                        <span className="font-medium">{dashboardStats.office_summary.positive_feedback_percentage}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Sentiment Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Positive:</span>
                        <span className="font-medium">{dashboardStats.sentiment_breakdown.positive}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Neutral:</span>
                        <span className="font-medium">{dashboardStats.sentiment_breakdown.neutral}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Negative:</span>
                        <span className="font-medium">{dashboardStats.sentiment_breakdown.negative}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Top Issues</h3>
                  {dashboardStats.top_issues.length > 0 ? (
                    <ul className="space-y-2">
                      {dashboardStats.top_issues.map((issue, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{issue.issue}</span>
                          <span className="font-medium">{issue.count} mentions ({issue.percentage}%)</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No issues found.</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              onClick={() => dispatch(fetchDashboardStats(undefined))} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Refresh Stats
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleGenerateReport} 
              disabled={reportGenerating}
              variant="outline"
            >
              {reportGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {reportUrl && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertTitle className="text-blue-800">Report Generated</AlertTitle>
            <AlertDescription className="text-blue-700">
              Report URL: {reportUrl}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-center mt-6">
          <Button asChild>
            <Link href="/government">
              Go to Government Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
