"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Flag,
  Loader2,
  MessageSquare,
  PlusCircle,
  Users,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchAdminDashboardStats } from "@/store/slices/adminSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboardStats, recentActivity, loading, error } = useAppSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchAdminDashboardStats());
  }, [dispatch]);

  // Function to get the appropriate icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "office_created":
        return <Building2 className="h-5 w-5 text-primary" />;
      case "service_updated":
        return <MessageSquare className="h-5 w-5 text-primary" />;
      case "review_flagged":
        return <Flag className="h-5 w-5 text-primary" />;
      case "user_registered":
        return <Users className="h-5 w-5 text-primary" />;
      default:
        return <MessageSquare className="h-5 w-5 text-primary" />;
    }
  };

  // Function to format activity title
  const formatActivityTitle = (activity: any) => {
    switch (activity.type) {
      case "office_created":
        return "New Office Added";
      case "service_updated":
        return "Service Updated";
      case "review_flagged":
        return "Comment Flagged";
      case "user_registered":
        return "New User Registered";
      default:
        return "Activity";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-gradient font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Manage Negari platform and moderate content
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="gradient"
            size="lg"
            asChild
            className="shadow-medium hover:shadow-strong"
          >
            <Link href="/admin/offices/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Office
            </Link>
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && dashboardStats && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="card-elevated animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Offices
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">
                  {dashboardStats.offices.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{dashboardStats.offices.new} from last month
                </p>
              </CardContent>
            </Card>
            <Card className="card-elevated animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Services
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">
                  {dashboardStats.services.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{dashboardStats.services.new} from last month
                </p>
              </CardContent>
            </Card>
            <Card className="card-elevated animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Registered Users
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">
                  {dashboardStats.users.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{dashboardStats.users.new} from last month
                </p>
              </CardContent>
            </Card>
            <Card className="card-elevated animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Flagged Comments
                </CardTitle>
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <Flag className="h-4 w-4 text-destructive" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">
                  {dashboardStats.flagged_comments}
                </div>
                <p className="text-xs text-destructive">Requires attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4 card-elevated">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions on the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.slice(0, 4).map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {formatActivityTitle(activity)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.title}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                          })}
                        </p>
                        <p className="font-medium">
                          {activity.user ? activity.user.full_name : "System"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No recent activity found
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>

            <Card className="lg:col-span-3 card-elevated">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full justify-start shadow-soft hover:shadow-medium"
                  asChild
                >
                  <Link href="/admin/offices/new">
                    <Building2 className="mr-2 h-4 w-4" />
                    Add New Office
                  </Link>
                </Button>
                <Button
                  className="w-full justify-start shadow-soft hover:shadow-medium"
                  asChild
                >
                  <Link href="/admin/services/new">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Add New Service
                  </Link>
                </Button>
                <Button
                  className="w-full justify-start shadow-soft hover:shadow-medium"
                  asChild
                >
                  <Link href="/admin/reviews">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Manage Reviews
                  </Link>
                </Button>
                <Button
                  className="w-full justify-start shadow-soft hover:shadow-medium"
                  asChild
                >
                  <Link href="/admin/comments">
                    <Flag className="mr-2 h-4 w-4" />
                    Moderate Flagged Comments
                  </Link>
                </Button>
                <Button
                  className="w-full justify-start shadow-soft hover:shadow-medium"
                  asChild
                >
                  <Link href="/admin/users/new">
                    <Users className="mr-2 h-4 w-4" />
                    Create Government Account
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
