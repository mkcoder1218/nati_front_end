"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  Clock,
  Edit,
  Loader2,
  Lock,
  LogIn,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  ThumbsUp,
  Trash2,
  User,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  fetchUserById,
  deleteUser,
  updateUserRole,
} from "@/store/slices/userSlice";
import { fetchReviewsByUser } from "@/store/slices/reviewSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "@/lib/translation-context";
import { toast } from "sonner";
import { format } from "date-fns";
import { UpdateRoleData } from "@/services/user.service";

// Helper function to validate UUID format
const isValidUUID = (str: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export default function AdminUserDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const userId = params.id as string;

  const {
    selectedUser: user,
    loading: userLoading,
    error: userError,
  } = useAppSelector((state) => state.user);
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
  } = useAppSelector((state) => state.review);

  const [activeTab, setActiveTab] = useState("profile");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [isChangingRole, setIsChangingRole] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    if (userId && isValidUUID(userId)) {
      dispatch(fetchUserById(userId));
      dispatch(fetchReviewsByUser(userId));
    } else if (userId && !isValidUUID(userId)) {
      // If the userId is not a valid UUID (like "new"), redirect to users page
      console.error("Invalid user ID format:", userId);
      router.push("/admin/users");
    }
  }, [dispatch, userId, router]);

  useEffect(() => {
    if (user) {
      setNewRole(user.role);
    }
  }, [user]);

  const loading = userLoading || reviewsLoading;
  const error = userError || reviewsError;

  // Handle user deletion
  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast.success(t("user_deleted_successfully"));
      router.push("/admin/users");
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error(t("failed_to_delete_user"));
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Handle role change
  const handleRoleChange = async () => {
    if (!user || user.role === newRole) return;

    setIsChangingRole(true);
    try {
      const data: UpdateRoleData = {
        role: newRole as "citizen" | "official" | "admin",
      };
      await dispatch(updateUserRole({ userId, data })).unwrap();
      toast.success(t("user_role_updated_successfully"));
      setShowRoleDialog(false);
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error(t("failed_to_update_user_role"));
    } finally {
      setIsChangingRole(false);
    }
  };

  // Get role badge color
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "official":
        return "default";
      case "citizen":
      default:
        return "secondary";
    }
  };

  // Get role display name
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "admin":
        return t("admin");
      case "official":
        return t("government_official");
      case "citizen":
        return t("citizen");
      default:
        return role;
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
          {user ? user.full_name : t("user_profile")}
        </h2>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="mr-2 h-4 w-4" />
              {t("error")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => {
                dispatch(fetchUserById(userId));
                dispatch(fetchReviewsByUser(userId));
              }}
            >
              {t("retry")}
            </Button>
          </CardFooter>
        </Card>
      )}

      {!loading && !error && user && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{user.full_name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleDisplay(user.role)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {t("user_id")}: {user.user_id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowRoleDialog(true)}>
                <Shield className="mr-2 h-4 w-4" />
                {t("change_role")}
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/admin/users/${userId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t("edit")}
                </Link>
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("delete_user")}
              </Button>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
              <TabsTrigger value="activity">{t("activity")}</TabsTrigger>
              <TabsTrigger value="reviews">{t("reviews")}</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("user_information")}</CardTitle>
                  <CardDescription>
                    {t("basic_details_about_user")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{user.phone_number || t("not_provided")}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {t("joined")}:{" "}
                          {format(new Date(user.created_at), "MMMM d, yyyy")}
                        </span>
                      </div>
                      {user.last_login && (
                        <div className="flex items-center text-sm">
                          <LogIn className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            {t("last_login")}:{" "}
                            {format(
                              new Date(user.last_login),
                              "MMMM d, yyyy HH:mm"
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="rounded-md border p-4">
                      <h3 className="mb-2 font-medium">
                        {t("account_status")}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {t("role")}:
                          </span>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleDisplay(user.role)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {t("status")}:
                          </span>
                          <Badge variant="outline" className="bg-green-50">
                            {t("active")}
                          </Badge>
                        </div>
                        {user.role === "official" && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {t("assigned_office")}:
                            </span>
                            {user.office_id ? (
                              <Badge variant="default">
                                {user.office_name || t("office_assigned")}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                {t("no_office_assigned")}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-2 font-medium">
                      {t("additional_information")}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t("user_id")}:
                          </span>
                          <span className="font-mono">{user.user_id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t("created_at")}:
                          </span>
                          <span>
                            {format(
                              new Date(user.created_at),
                              "yyyy-MM-dd HH:mm:ss"
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t("reviews_count")}:
                          </span>
                          <span className="font-medium">{reviews.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/admin/users/${userId}/reset-password`}>
                      <Lock className="mr-2 h-4 w-4" />
                      {t("reset_password")}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("user_activity")}</CardTitle>
                  <CardDescription>{t("recent_user_activity")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      {t("activity_tracking_coming_soon")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("activity_tracking_description")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("user_reviews")}</CardTitle>
                  <CardDescription>
                    {t("reviews_submitted_by_user")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <MessageSquare className="h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">
                        {t("no_reviews_submitted")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review.review_id}
                          className="rounded-lg border p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {review.office_name || t("unknown_office")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <ThumbsUp
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-primary text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm">{review.comment}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(review.created_at),
                                "MMMM d, yyyy"
                              )}
                            </span>
                            <Badge
                              variant={
                                review.status === "approved"
                                  ? "outline"
                                  : review.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {review.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Delete User Confirmation Dialog */}
          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("confirm_delete_user")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("delete_user_warning")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  {t("cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("deleting")}
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("delete")}
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Change Role Dialog */}
          <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("change_user_role")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("change_role_description")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_new_role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t("admin")}</SelectItem>
                    <SelectItem value="official">
                      {t("government_official")}
                    </SelectItem>
                    <SelectItem value="citizen">{t("citizen")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isChangingRole}>
                  {t("cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRoleChange}
                  disabled={isChangingRole || user.role === newRole}
                >
                  {isChangingRole ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("updating")}
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {t("confirm")}
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
