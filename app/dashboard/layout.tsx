"use client";

import { type ReactNode, Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Flag,
  Home,
  LogOut,
  Map,
  MessageSquare,
  Settings,
  Star,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

import { LanguageSwitcher } from "@/components/language-switcher";
import { NotificationBell } from "@/components/dashboard/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { logout } from "@/store/slices/authSlice";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  SidebarVoteStatistics,
  SidebarCommentTab,
} from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  // Use state to handle user data to prevent hydration mismatch
  const [userName, setUserName] = useState<string>("Guest");
  const [userRole, setUserRole] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("?");

  // Update user data after initial render to prevent hydration mismatch
  useEffect(() => {
    if (user?.full_name) {
      setUserName(user.full_name);
      setUserRole(user.role || "");

      const initials = user.full_name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      setUserInitials(initials);
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      // Dispatch the logout action which will clear localStorage and reset Redux state
      await dispatch(logout()).unwrap();

      // Show success message
      toast.success("Signed out successfully");

      // Redirect to sign-in page
      router.push("/sign-in");
    } catch (error) {
      console.error("Error during sign out:", error);
      toast.error("There was a problem signing out. Please try again.");
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r shadow-soft">
          <SidebarHeader className="border-b bg-gradient-primary">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg text-gradient">Negari</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive>
                      <Link href="/dashboard">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/offices">
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>Offices</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/services">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Services</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/map">
                        <Map className="mr-2 h-4 w-4" />
                        <span>Map</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/ratings">
                        <Star className="mr-2 h-4 w-4" />
                        <span>My Ratings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/my-feedback">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        <span>My Feedback</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {user?.role === "admin" && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/admin/flagged-reviews">
                          <Flag className="mr-2 h-4 w-4" />
                          <span>Flagged Reviews</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            {/* Vote Statistics Section */}
            <SidebarVoteStatistics />

            <SidebarSeparator />

            {/* Comments Section */}
            <SidebarCommentTab />
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 lg:px-8">
            <SidebarTrigger />
            <div className="flex-1" />
            <LanguageSwitcher />
            {/* NotificationBell is client-side only to prevent hydration errors */}
            <div id="notification-bell-container">
              <NotificationBell />
            </div>
            <Button variant="outline" size="sm" className="hidden md:flex">
              Help
            </Button>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-xs text-muted-foreground">
                  {userRole}
                </span>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-primary-foreground font-medium shadow-medium">
                {userInitials}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-hidden">
            <div className="container-enhanced max-w-none">
              <Suspense>{children}</Suspense>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
