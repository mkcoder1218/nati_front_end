"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, FileText, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchAllOffices } from "@/store/slices/officeSlice";
import { fetchAllServiceGuides } from "@/store/slices/serviceGuideSlice";
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
import { useTranslation } from "@/lib/translation-context";
import { Office } from "@/services/office.service";
import { ServiceGuide } from "@/services/serviceGuide.service";

export function DashboardOverview() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { offices, loading: officesLoading } = useAppSelector(
    (state) => state.office
  );
  const { guides, loading: guidesLoading } = useAppSelector(
    (state) => state.serviceGuide
  );
  const { userReviews } = useAppSelector((state) => state.review);

  const [nearbyOffices, setNearbyOffices] = useState<Office[]>([]);
  const [popularServices, setPopularServices] = useState<ServiceGuide[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchAllOffices());
    dispatch(fetchAllServiceGuides());

    if (user) {
      dispatch(fetchReviewsByUser(user.user_id));
    }
  }, [dispatch, user]);

  // Set nearby offices (for now, just show the first 3 offices)
  useEffect(() => {
    if (offices.length > 0) {
      setNearbyOffices(offices.slice(0, 3));
    }
  }, [offices]);

  // Set popular services (for now, just show the first 3 services)
  useEffect(() => {
    if (guides.length > 0) {
      setPopularServices(guides.slice(0, 3));
    }
  }, [guides]);

  // Get user reviews count
  const userReviewsCount =
    user && userReviews[user.user_id] ? userReviews[user.user_id].length : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-gradient font-bold">{t("dashboard")}</h1>
          <p className="text-muted-foreground text-lg">
            {t("welcome_back")}! {t("dashboard_subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="gradient"
            size="lg"
            asChild
            className="shadow-medium hover:shadow-strong"
          >
            <Link href="/dashboard/offices">{t("find_offices")}</Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-elevated animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("offices_visited")}
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">
              {userReviewsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("based_on_your_reviews")}
            </p>
          </CardContent>
        </Card>
        <Card className="card-elevated animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("services_used")}
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">
              {guides.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("available_services")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Nearby Offices and Popular Services */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 card-elevated">
          <CardHeader>
            <CardTitle>{t("nearby_offices")}</CardTitle>
            <CardDescription>{t("nearby_offices_subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            {officesLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : nearbyOffices.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                <p>{t("no_offices_found")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {nearbyOffices.map((office) => (
                  <div
                    key={office.office_id}
                    className="flex items-start gap-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">{office.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {office.address}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0"
                          asChild
                        >
                          <Link href={`/dashboard/offices/${office.office_id}`}>
                            {t("view_details")}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/offices">{t("view_all_offices")}</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="lg:col-span-3 card-elevated">
          <CardHeader>
            <CardTitle>{t("popular_services")}</CardTitle>
            <CardDescription>{t("popular_services_subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {guidesLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : popularServices.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                <p>{t("no_services_found")}</p>
              </div>
            ) : (
              popularServices.map((guide) => (
                <div key={guide.guide_id} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">{guide.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {guide.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0"
                        asChild
                      >
                        <Link href={`/dashboard/services/${guide.guide_id}`}>
                          {t("view_details")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/services">{t("view_all_services")}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
