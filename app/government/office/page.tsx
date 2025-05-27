"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Edit,
  Mail,
  MapPin,
  Phone,
  Globe,
  Clock,
  FileText,
  Loader2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchOfficeById } from "@/store/slices/officeSlice";
import { fetchServiceGuidesByOffice } from "@/store/slices/serviceGuideSlice";
import {
  fetchVotesByOffice,
  fetchVoteTrends,
} from "@/store/slices/officeVoteSlice";
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
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/translation-context";
import { useToast } from "@/components/ui/use-toast";
import OfficeVoteTrends from "@/components/office/OfficeVoteTrends";

export default function GovernmentOfficePage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const {
    selectedOffice: office,
    loading: officeLoading,
    error: officeError,
  } = useAppSelector((state) => state.office);
  const {
    officeGuides,
    loading: guidesLoading,
    error: guidesError,
  } = useAppSelector((state) => state.serviceGuide);
  const {
    votesByOffice,
    loading: voteLoading,
    error: voteError,
  } = useAppSelector((state) => state.officeVote);
  const { user } = useAppSelector((state) => state.auth);

  // Get user's assigned office (single office)
  const userOfficeId = user?.office_id;
  const userOfficeName = user?.office_name;

  // Get vote counts for the user's office
  const voteCounts = userOfficeId ? votesByOffice[userOfficeId] : null;

  // Get service guides for the user's office
  const guides = userOfficeId ? officeGuides[userOfficeId] || [] : [];

  // Fetch office data when user office is available
  useEffect(() => {
    if (userOfficeId) {
      dispatch(fetchOfficeById(userOfficeId));
      dispatch(fetchServiceGuidesByOffice(userOfficeId));
      dispatch(fetchVotesByOffice(userOfficeId));
      dispatch(
        fetchVoteTrends({
          officeId: userOfficeId,
          period: "weekly",
          limit: 12,
        })
      );
    } else {
      toast({
        title: t("no_office_assigned"),
        description: t("no_office_assigned_description"),
        variant: "destructive",
      });
    }
  }, [dispatch, userOfficeId, toast, t]);

  const loading = officeLoading || guidesLoading || voteLoading;
  const error = officeError || guidesError || voteError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("my_office")}
          </h2>
          <p className="text-muted-foreground">
            {userOfficeName
              ? `${t("manage_office_information")} - ${userOfficeName}`
              : t("no_office_assigned_description")}
          </p>
        </div>
        {office && user?.role === "admin" && (
          <Button asChild>
            <Link href={`/admin/offices/${office.office_id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              {t("edit_office")}
            </Link>
          </Button>
        )}
      </div>

      {/* Show message if no office is assigned */}
      {!userOfficeId && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">
              {t("no_office_assigned")}
            </CardTitle>
            <CardDescription>
              {t("contact_admin_for_office_assignment")}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Office Information - Show only if user has an office */}
      {userOfficeId && loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : userOfficeId && error ? (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">{t("error")}</CardTitle>
            <CardDescription>{t("error_loading_office")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (user?.office_id) {
                  dispatch(fetchOfficeById(user.office_id));
                  dispatch(fetchServiceGuidesByOffice(user.office_id));
                }
              }}
            >
              {t("retry")}
            </Button>
          </CardFooter>
        </Card>
      ) : userOfficeId && !office ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("no_office_found")}</CardTitle>
            <CardDescription>
              {t("no_office_assigned_description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("contact_admin_for_office_assignment")}
            </p>
          </CardContent>
        </Card>
      ) : userOfficeId && office ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                {office.name}
              </CardTitle>
              <CardDescription>{office.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{office.address}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{office.phone_number}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{office.email}</span>
                  </div>
                  {office.website && (
                    <div className="flex items-center text-sm">
                      <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                      <a
                        href={office.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {office.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{office.operating_hours || t("not_specified")}</span>
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <h3 className="mb-2 font-medium">{t("office_statistics")}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("services_offered")}:
                      </span>
                      <span className="font-medium">{guides.length}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("created_at")}:
                      </span>
                      <span className="font-medium">
                        {office.created_at
                          ? new Date(office.created_at).toLocaleDateString()
                          : t("not_available")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("last_updated")}:
                      </span>
                      <span className="font-medium">
                        {office.updated_at
                          ? new Date(office.updated_at).toLocaleDateString()
                          : t("not_available")}
                      </span>
                    </div>

                    <Separator />

                    <h4 className="text-sm font-medium">Citizen Feedback</h4>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <ThumbsUp className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-muted-foreground">Upvotes:</span>
                      </div>
                      <span className="font-medium">
                        {voteCounts?.upvotes || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <ThumbsDown className="mr-1 h-3 w-3 text-red-500" />
                        <span className="text-muted-foreground">
                          Downvotes:
                        </span>
                      </div>
                      <span className="font-medium">
                        {voteCounts?.downvotes || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Satisfaction Rate:
                      </span>
                      <Badge
                        variant={
                          (voteCounts?.ratio || 0) >= 70
                            ? "default"
                            : (voteCounts?.ratio || 0) >= 40
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {voteCounts?.ratio || 0}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vote Trends Section */}
          {userOfficeId && <OfficeVoteTrends officeId={userOfficeId} />}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t("services_offered")}</h3>
              <Button asChild variant="outline" size="sm">
                <Link href="/government/services">
                  <FileText className="mr-2 h-4 w-4" />
                  {t("view_all_services")}
                </Link>
              </Button>
            </div>

            {guides.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    <p>{t("no_services_found")}</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="/government/services/new">
                        {t("create_first_service")}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {guides.slice(0, 3).map((guide) => (
                  <Card key={guide.guide_id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{guide.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {guide.description}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <Link href={`/government/services/${guide.guide_id}`}>
                          {t("view_details")}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
