import React, { useEffect } from "react";
import { ThumbsUp, ThumbsDown, BarChart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  fetchUserVoteStats,
  fetchTopVotedOffices,
} from "@/store/slices/officeVoteSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface OfficeVoteStatsProps {
  className?: string;
}

const OfficeVoteStats: React.FC<OfficeVoteStatsProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { userVoteStats, topVotedOffices, statsLoading } = useAppSelector(
    (state) => state.officeVote
  );

  useEffect(() => {
    // Fetch user vote statistics
    if (user) {
      dispatch(fetchUserVoteStats());
    }

    // Fetch top voted offices for admin/government users
    if (user?.role === "admin" || user?.role === "government") {
      dispatch(fetchTopVotedOffices({ limit: 5 }));
    }
  }, [dispatch, user]);

  if (statsLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // For citizen users, show their voting history
  if (user?.role === "citizen") {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <BarChart className="mr-2 h-5 w-5" />
            My Voting Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!userVoteStats ? (
            <p className="text-sm text-muted-foreground">
              No voting activity yet.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <ThumbsUp className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-sm">Upvotes</span>
                </div>
                <Badge variant="secondary">{userVoteStats.upvotes}</Badge>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <ThumbsDown className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-sm">Downvotes</span>
                </div>
                <Badge variant="secondary">{userVoteStats.downvotes}</Badge>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Recent Votes</span>
                  <span>{userVoteStats.total} total</span>
                </div>

                {userVoteStats.voted_offices.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {userVoteStats.voted_offices.slice(0, 5).map((vote) => (
                      <li
                        key={vote.office_id}
                        className="flex items-center justify-between"
                      >
                        <Link
                          href={`/dashboard/offices/${vote.office_id}`}
                          className="text-sm hover:underline truncate max-w-[180px]"
                        >
                          {vote.office_name}
                        </Link>
                        <div className="flex items-center">
                          {vote.vote_type === "upvote" ? (
                            <ThumbsUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <ThumbsDown className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No recent votes.
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // For admin/government users, show system-wide statistics
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <BarChart className="mr-2 h-5 w-5" />
          Office Vote Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Statistics */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Positive Feedback Ratio</span>
              <span className="font-medium">
                {topVotedOffices.length > 0
                  ? Math.round(
                      (topVotedOffices.reduce(
                        (sum, office) => sum + office.upvotes,
                        0
                      ) /
                        topVotedOffices.reduce(
                          (sum, office) => sum + office.total,
                          0
                        )) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={
                topVotedOffices.length > 0
                  ? Math.round(
                      (topVotedOffices.reduce(
                        (sum, office) => sum + office.upvotes,
                        0
                      ) /
                        topVotedOffices.reduce(
                          (sum, office) => sum + office.total,
                          0
                        )) *
                        100
                    )
                  : 0
              }
              className="h-2"
            />
          </div>

          {/* Top Offices */}
          <div className="pt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Top Rated Offices</span>
              <span>Ratio</span>
            </div>

            {topVotedOffices.length > 0 ? (
              <ul className="space-y-3">
                {topVotedOffices.slice(0, 5).map((office) => (
                  <li key={office.office_id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Link
                        href={`/dashboard/offices/${office.office_id}`}
                        className="text-sm font-medium hover:underline truncate max-w-[180px]"
                      >
                        {office.office_name}
                      </Link>
                      <Badge
                        variant={
                          office.ratio >= 70
                            ? "success"
                            : office.ratio >= 40
                            ? "warning"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {office.ratio}%
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <div className="flex items-center mr-3">
                        <ThumbsUp className="mr-1 h-3 w-3 text-green-500" />
                        <span>{office.upvotes}</span>
                      </div>
                      <div className="flex items-center">
                        <ThumbsDown className="mr-1 h-3 w-3 text-red-500" />
                        <span>{office.downvotes}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No office vote data available.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficeVoteStats;
