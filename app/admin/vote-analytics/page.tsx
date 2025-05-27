"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  fetchTopVotedOffices,
  fetchVoteTrends,
} from "@/store/slices/officeVoteSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnDef } from "@tanstack/react-table";
import {
  BarChart,
  LineChart,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import OfficeVoteTrends from "@/components/office/OfficeVoteTrends";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Define columns for the data table
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "office_name",
    header: "Office Name",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/offices/${row.original.office_id}`}
        className="font-medium hover:underline"
      >
        {row.getValue("office_name")}
      </Link>
    ),
  },
  {
    accessorKey: "upvotes",
    header: () => (
      <div className="flex items-center">
        <ThumbsUp className="mr-1 h-4 w-4 text-green-500" />
        <span>Upvotes</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("upvotes")}</div>
    ),
  },
  {
    accessorKey: "downvotes",
    header: () => (
      <div className="flex items-center">
        <ThumbsDown className="mr-1 h-4 w-4 text-red-500" />
        <span>Downvotes</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("downvotes")}</div>
    ),
  },
  {
    accessorKey: "total",
    header: "Total Votes",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("total")}</div>
    ),
  },
  {
    accessorKey: "ratio",
    header: "Positive Ratio",
    cell: ({ row }) => (
      <Badge
        variant={
          row.getValue("ratio") >= 70
            ? "success"
            : row.getValue("ratio") >= 40
            ? "warning"
            : "destructive"
        }
      >
        {row.getValue("ratio")}%
      </Badge>
    ),
  },
];

export default function VoteAnalyticsPage() {
  const dispatch = useAppDispatch();
  const {
    topVotedOffices,
    voteTrends,
    statsLoading,
    trendsLoading,
    statsError,
    trendsError,
  } = useAppSelector((state) => state.officeVote);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [voteType, setVoteType] = useState<"upvote" | "downvote" | "total">(
    "total"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOffices, setFilteredOffices] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [region, setRegion] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated and has admin/government role
  useEffect(() => {
    // Reset error state
    setError(null);

    // Check authentication
    if (!isAuthenticated) {
      setError("You must be logged in to access vote analytics");
      return;
    }

    // Check user role
    if (user?.role !== "admin" && user?.role !== "government") {
      setError("You don't have permission to access vote analytics");
      return;
    }
  }, [isAuthenticated, user]);

  // Fetch data on component mount or when vote type changes
  useEffect(() => {
    // Skip if there's an authentication error
    if (error) return;

    try {
      dispatch(fetchTopVotedOffices({ limit: 100, voteType }))
        .unwrap()
        .catch((err) => {
          console.error("Error fetching top voted offices:", err);
          setError(err.message || "Failed to fetch vote statistics");
        });

      dispatch(fetchVoteTrends({ period: "monthly", limit: 12 }))
        .unwrap()
        .catch((err) => {
          console.error("Error fetching vote trends:", err);
          if (!error) {
            setError(err.message || "Failed to fetch vote trends");
          }
        });
    } catch (err: any) {
      console.error("Error in vote analytics data fetching:", err);
      setError(err.message || "An error occurred while fetching vote data");
    }
  }, [dispatch, voteType, error]);

  // Filter offices based on search term and other filters
  useEffect(() => {
    if (!topVotedOffices) return;

    let filtered = [...topVotedOffices];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((office) =>
        office.office_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply region filter (in a real app, you'd have region data)
    if (region !== "all") {
      // This is a mock filter - in a real app, you'd filter by actual region data
      filtered = filtered.filter((office) => office.office_id.includes(region));
    }

    // Apply date filters (in a real app, you'd have date data for each vote)
    // This is just a placeholder for the UI

    setFilteredOffices(filtered);
  }, [topVotedOffices, searchTerm, region, startDate, endDate]);

  // Handle authentication and permission errors
  if (error) {
    return (
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Vote Analytics
            </h1>
            <p className="text-muted-foreground">
              Analyze voting patterns across all government offices
            </p>
          </div>
        </div>

        <Card className="border-red-200">
          <CardHeader className="bg-red-50 text-red-700">
            <CardTitle>Access Error</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p>{error}</p>
            {!isAuthenticated && (
              <Button className="mt-4" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle loading state
  if (statsLoading && !topVotedOffices.length) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Vote Analytics
            </h1>
            <p className="text-muted-foreground">
              Analyze voting patterns across all government offices
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Upvotes</CardTitle>
              <CardDescription>Across all offices</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-24" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Downvotes</CardTitle>
              <CardDescription>Across all offices</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-24" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Overall Satisfaction</CardTitle>
              <CardDescription>Positive vote ratio</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-24" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vote Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Office Vote Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vote Analytics</h1>
          <p className="text-muted-foreground">
            Analyze voting patterns across all government offices
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Upvotes</CardTitle>
            <CardDescription>Across all offices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center">
              <ThumbsUp className="mr-2 h-6 w-6 text-green-500" />
              {topVotedOffices.reduce((sum, office) => sum + office.upvotes, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Downvotes</CardTitle>
            <CardDescription>Across all offices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center">
              <ThumbsDown className="mr-2 h-6 w-6 text-red-500" />
              {topVotedOffices.reduce(
                (sum, office) => sum + office.downvotes,
                0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overall Satisfaction</CardTitle>
            <CardDescription>Positive vote ratio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
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
            </div>
          </CardContent>
        </Card>
      </div>

      <OfficeVoteTrends />

      <Card>
        <CardHeader>
          <CardTitle>Office Vote Rankings</CardTitle>
          <CardDescription>
            View and filter vote statistics for all government offices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search offices..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Select
                  value={voteType}
                  onValueChange={(value) => setVoteType(value as any)}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total">Total Votes</SelectItem>
                    <SelectItem value="upvote">Most Upvoted</SelectItem>
                    <SelectItem value="downvote">Most Downvoted</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="north">North Region</SelectItem>
                    <SelectItem value="south">South Region</SelectItem>
                    <SelectItem value="east">East Region</SelectItem>
                    <SelectItem value="west">West Region</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex gap-2 items-center">
                <div>
                  <p className="text-sm mb-1">Start Date</p>
                  <DatePicker date={startDate} setDate={setStartDate} />
                </div>
                <div>
                  <p className="text-sm mb-1">End Date</p>
                  <DatePicker date={endDate} setDate={setEndDate} />
                </div>
              </div>

              <Button
                variant="outline"
                className="h-10"
                onClick={() => {
                  setSearchTerm("");
                  setRegion("all");
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
              >
                Reset Filters
              </Button>
            </div>

            <DataTable columns={columns} data={filteredOffices} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
