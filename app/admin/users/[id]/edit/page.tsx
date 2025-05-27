"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Loader2, Save, User, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchUserById, updateUser } from "@/store/slices/userSlice";
import { fetchAllOffices } from "@/store/slices/officeSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/translation-context";
import { toast } from "sonner";
import UserService from "@/services/user.service";

interface UserFormData {
  full_name: string;
  email: string;
  phone_number: string;
  role: "citizen" | "official" | "admin";
}

interface OfficeAssignment {
  office_id: string;
  office_name: string;
  is_primary: boolean;
}

export default function EditUserPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useParams();
  const userId = params.id as string;

  const { user, loading, error } = useAppSelector((state) => state.user);
  const { offices } = useAppSelector((state) => state.office);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    full_name: "",
    email: "",
    phone_number: "",
    role: "citizen",
  });

  const [currentOfficeId, setCurrentOfficeId] = useState<string>("");
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Fetch user and offices data
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserById(userId));
      dispatch(fetchAllOffices());
    }
  }, [dispatch, userId]);

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        role: user.role || "citizen",
      });

      // Set current office if user is an official
      if (user.role === "official" && user.office_id) {
        setCurrentOfficeId(user.office_id);
      }
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value as "citizen" | "official" | "admin",
    }));

    // Clear office assignment if role is not official
    if (value !== "official") {
      setCurrentOfficeId("");
    }
  };

  const handleAssignOffice = async (officeId: string) => {
    if (!officeId || !user) return;

    setLoadingAssignments(true);
    try {
      const updatedUser = await UserService.assignUserToOffice(
        user.user_id,
        officeId
      );
      setCurrentOfficeId(officeId);

      // Refresh user data from the server to get the latest state
      dispatch(fetchUserById(user.user_id));

      toast.success(t("office_assigned_successfully"));
    } catch (error) {
      console.error("Failed to assign office:", error);
      toast.error(t("failed_to_assign_office"));
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleRemoveOffice = async () => {
    if (!user) return;

    setLoadingAssignments(true);
    try {
      const updatedUser = await UserService.removeUserFromOffice(user.user_id);
      setCurrentOfficeId("");

      // Refresh user data from the server to get the latest state
      dispatch(fetchUserById(user.user_id));

      toast.success(t("office_removed_successfully"));
    } catch (error) {
      console.error("Failed to remove office:", error);
      toast.error(t("failed_to_remove_office"));
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        updateUser({ userId: user.user_id, data: formData })
      ).unwrap();
      toast.success(t("user_updated_successfully"));
      router.push(`/admin/users/${userId}`);
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error(t("failed_to_update_user"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => dispatch(fetchUserById(userId))}
          >
            {t("retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">{t("user_not_found")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/users/${userId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
          {t("edit_user_title", { name: user.full_name })}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("user_information")}
            </CardTitle>
            <CardDescription>{t("update_user_details")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">{t("full_name")}</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder={t("full_name_placeholder")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t("email_placeholder")}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone_number">{t("phone_number")}</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder={t("phone_number_placeholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">{t("role")}</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen">{t("citizen")}</SelectItem>
                    <SelectItem value="official">
                      {t("government_official")}
                    </SelectItem>
                    <SelectItem value="admin">{t("admin")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {formData.role === "official" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t("office_assignment")}
              </CardTitle>
              <CardDescription>
                {t("assign_official_to_office")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingAssignments ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  {currentOfficeId ? (
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {offices.find((o) => o.office_id === currentOfficeId)
                            ?.name || t("unknown_office")}
                        </span>
                        <Badge variant="default">{t("assigned")}</Badge>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveOffice}
                        disabled={loadingAssignments}
                      >
                        <X className="h-4 w-4" />
                        {t("remove")}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      {t("no_office_assigned")}
                    </p>
                  )}

                  {!currentOfficeId && (
                    <div className="space-y-2">
                      <Label>{t("select_office")}</Label>
                      <Select
                        value={currentOfficeId}
                        onValueChange={(value) => {
                          if (value) {
                            handleAssignOffice(value);
                          }
                        }}
                        disabled={loadingAssignments}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("select_office_to_assign")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {offices.map((office) => (
                            <SelectItem
                              key={office.office_id}
                              value={office.office_id}
                            >
                              {office.name} ({office.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/admin/users/${userId}`}>{t("cancel")}</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? t("submitting") : t("save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
