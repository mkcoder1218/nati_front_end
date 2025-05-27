import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchVoteTrends } from "@/store/slices/officeVoteSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  LineChart,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// This is a simplified chart component - in a real app, you'd use a proper chart library
// like Chart.js, Recharts, or D3.js
const SimpleChart = ({ data, type }: { data: any[]; type: "bar" | "line" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.upvotes, d.downvotes))
  );

  return (
    <div className="h-64 flex flex-col">
      <div className="flex-1 flex items-end">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col items-center justify-end h-full"
          >
            {type === "bar" ? (
              <>
                <div
                  className="w-4 bg-green-500 rounded-t"
                  style={{ height: `${(item.upvotes / maxValue) * 100}%` }}
                ></div>
                <div className="h-1"></div>
                <div
                  className="w-4 bg-red-500 rounded-t"
                  style={{ height: `${(item.downvotes / maxValue) * 100}%` }}
                ></div>
              </>
            ) : (
              <div className="relative w-full h-full">
                {index > 0 && (
                  <>
                    <div
                      className="absolute w-full h-1 bg-green-500"
                      style={{
                        bottom: `${(item.upvotes / maxValue) * 100}%`,
                        transform: "translateY(-50%)",
                      }}
                    ></div>
                    <div
                      className="absolute w-full h-1 bg-red-500"
                      style={{
                        bottom: `${(item.downvotes / maxValue) * 100}%`,
                        transform: "translateY(-50%)",
                      }}
                    ></div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="h-6 flex text-xs text-muted-foreground">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center truncate">
            {item.date.split("-").slice(-1)[0]}
          </div>
        ))}
      </div>
    </div>
  );
};

interface OfficeVoteTrendsProps {
  officeId?: string;
  className?: string;
}

const OfficeVoteTrends: React.FC<OfficeVoteTrendsProps> = ({
  officeId,
  className,
}) => {
  const dispatch = useAppDispatch();
  const { voteTrends, trendsLoading, trendsError } = useAppSelector(
    (state) => state.officeVote
  );
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [error, setError] = useState<string | null>(null);

  // Reset error state when trendsError changes
  useEffect(() => {
    if (trendsError) {
      setError(trendsError);
    } else {
      setError(null);
    }
  }, [trendsError]);

  // Fetch vote trends when period or officeId changes
  useEffect(() => {
    try {
      dispatch(fetchVoteTrends({ officeId, period }))
        .unwrap()
        .catch((err) => {
          console.error("Error fetching vote trends:", err);
          setError(err.message || "Failed to fetch vote trends");
        });
    } catch (err: any) {
      console.error("Error in vote trends fetching:", err);
      setError(err.message || "An error occurred while fetching vote trends");
    }
  }, [dispatch, officeId, period]);

  // Handle error state
  if (error) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              Error Loading Vote Trends
            </CardTitle>

            <div className="flex items-center space-x-2">
              <Select
                value={period}
                onValueChange={(value) => setPeriod(value as any)}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => dispatch(fetchVoteTrends({ officeId, period }))}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle loading state
  if (trendsLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>Vote Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Vote Trends
          </CardTitle>

          <div className="flex items-center space-x-2">
            <Select
              value={period}
              onValueChange={(value) => setPeriod(value as any)}
            >
              <SelectTrigger className="h-8 w-[100px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>

            <Tabs
              value={chartType}
              onValueChange={(value) => setChartType(value as any)}
            >
              <TabsList className="h-8">
                <TabsTrigger value="bar" className="px-2">
                  <BarChart className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="line" className="px-2">
                  <LineChart className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="pt-4">
          <div className="flex justify-between text-sm mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Upvotes</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span>Downvotes</span>
            </div>
          </div>

          <SimpleChart data={voteTrends} type={chartType} />

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">
                Total Upvotes
              </div>
              <div className="text-xl font-bold flex items-center">
                <ThumbsUp className="mr-2 h-4 w-4 text-green-500" />
                {voteTrends.reduce((sum, item) => sum + item.upvotes, 0)}
              </div>
            </div>

            <div className="bg-muted rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">
                Total Downvotes
              </div>
              <div className="text-xl font-bold flex items-center">
                <ThumbsDown className="mr-2 h-4 w-4 text-red-500" />
                {voteTrends.reduce((sum, item) => sum + item.downvotes, 0)}
              </div>
            </div>

            <div className="bg-muted rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">
                Positive Ratio
              </div>
              <div className="text-xl font-bold">
                {voteTrends.reduce((sum, item) => sum + item.upvotes, 0) > 0
                  ? Math.round(
                      (voteTrends.reduce((sum, item) => sum + item.upvotes, 0) /
                        voteTrends.reduce((sum, item) => sum + item.total, 0)) *
                        100
                    )
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficeVoteTrends;
