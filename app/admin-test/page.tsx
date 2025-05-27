"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Building2, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchAdminDashboardStats, fetchSystemHealth } from "@/store/slices/adminSlice";
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
import { formatDistanceToNow } from "date-fns";

export default function AdminTestPage() {
  const dispatch = useAppDispatch();
  const { dashboardStats, recentActivity, systemHealth, loading, error } = useAppSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchAdminDashboardStats());
    dispatch(fetchSystemHealth());
  }, [dispatch]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin API Integration Test</h1>
      <TestNavigation />
      
      <div className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard Stats</CardTitle>
            <CardDescription>Test fetching admin dashboard statistics from the backend</CardDescription>
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
                    Successfully fetched admin dashboard statistics.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Offices</h3>
                    <div className="text-2xl font-bold">{dashboardStats.offices.total}</div>
                    <p className="text-sm text-muted-foreground">
                      +{dashboardStats.offices.new} from last month
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Services</h3>
                    <div className="text-2xl font-bold">{dashboardStats.services.total}</div>
                    <p className="text-sm text-muted-foreground">
                      +{dashboardStats.services.new} from last month
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Users</h3>
                    <div className="text-2xl font-bold">{dashboardStats.users.total}</div>
                    <p className="text-sm text-muted-foreground">
                      +{dashboardStats.users.new} from last month
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Flagged Comments</h3>
                    <div className="text-2xl font-bold">{dashboardStats.flagged_comments}</div>
                    <p className="text-sm text-destructive">Requires attention</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                  {recentActivity && recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-1">
                            <p className="font-medium">
                              {activity.type === "office_created" && "New Office Added"}
                              {activity.type === "service_updated" && "Service Updated"}
                              {activity.type === "review_flagged" && "Comment Flagged"}
                              {activity.type === "user_registered" && "New User Registered"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.title}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </p>
                            <p className="font-medium">
                              {activity.user ? activity.user.full_name : "System"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No recent activity found.</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => dispatch(fetchAdminDashboardStats())} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  Refresh Stats
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="flex justify-center mt-6">
          <Button asChild>
            <Link href="/admin">
              Go to Admin Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
