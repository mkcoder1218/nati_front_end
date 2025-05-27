"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart2,
  Building2,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/lib/translation-context";
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
  SidebarSentimentTab,
} from "@/components/ui/sidebar";
import { useAppDispatch } from "@/hooks/use-redux";
import { logout } from "@/store/slices/authSlice";

export default function GovernmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      // Dispatch the logout action which will clear localStorage and reset Redux state
      await dispatch(logout()).unwrap();

      // Show success message
      toast.success(t("signed_out_successfully"));

      // Redirect to sign-in page
      router.push("/sign-in");
    } catch (error) {
      console.error("Error during sign out:", error);
      toast.error(t("sign_out_error"));
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
              <span className="font-bold text-lg text-gradient">
                {t("app_name")} {t("government")}
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{t("government_portal")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/government">
                        <Home className="mr-2 h-4 w-4" />
                        <span>{t("dashboard")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/government/office">
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>{t("my_office")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/government/feedback">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>{t("citizen_feedback")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/government/analytics">
                        <BarChart2 className="mr-2 h-4 w-4" />
                        <span>{t("analytics")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/government/reports">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>{t("reports")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/government/services">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>{t("service_guides")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            {/* Vote Statistics Section */}
            <SidebarVoteStatistics />

            <SidebarSeparator />

            {/* Sentiment Analysis Section */}
            <SidebarSentimentTab />

            <SidebarSeparator />

            {/* Comments Section */}
            <SidebarCommentTab />
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/government/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t("settings")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("sign_out")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur shadow-soft px-4 sm:px-6">
            <SidebarTrigger className="hover:bg-primary/10" />
            <div className="flex-1" />
            <LanguageSwitcher />
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium">
                  {t("government_official")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("office_location")}
                </span>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-primary-foreground font-medium shadow-medium">
                GO
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-hidden">
            <div className="container-enhanced max-w-none">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
