"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Star,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchOfficeById } from "@/store/slices/officeSlice";
import {
  fetchReviewsByOffice,
  fetchReviewsByUser,
  createReview,
} from "@/store/slices/reviewSlice";
import { fetchServiceGuidesByOffice } from "@/store/slices/serviceGuideSlice";
import { fetchVotesByOffice } from "@/store/slices/officeVoteSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/translation-context";
import { OfficeReviews } from "./office-reviews";
import OfficeVoteButtons from "@/components/office/OfficeVoteButtons";

interface OfficeDetailProps {
  officeId: string;
}

export function OfficeDetail({ officeId }: OfficeDetailProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const {
    selectedOffice,
    loading: officeLoading,
    error: officeError,
  } = useAppSelector((state) => state.office);
  const {
    officeReviews,
    userReviews,
    loading: reviewsLoading,
    error: reviewsError,
  } = useAppSelector((state) => state.review);
  const {
    officeGuides,
    loading: guidesLoading,
    error: guidesError,
  } = useAppSelector((state) => state.serviceGuide);
  const { votesByOffice } = useAppSelector((state) => state.officeVote);
  const { user } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("overview");
  const [reviewContent, setReviewContent] = useState("");
  const [rating, setRating] = useState(5);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Create refs to track if we've already fetched the data - outside useEffect
  const fetchedDataRef = React.useRef({
    reviews: false,
    guides: false,
    votes: false,
  });

  // Fetch office data if not already loaded
  useEffect(() => {
    if (
      officeId &&
      (!selectedOffice || selectedOffice.office_id !== officeId)
    ) {
      console.log("OfficeDetail: Fetching office data for ID:", officeId);
      dispatch(fetchOfficeById(officeId));
    }
  }, [dispatch, officeId, selectedOffice]);

  // Fetch reviews, service guides, and votes on component mount
  useEffect(() => {
    if (officeId) {
      console.log(
        "OfficeDetail component: Fetching related data for ID:",
        officeId
      );

      // Use Promise.all to fetch all data in parallel
      const fetchData = async () => {
        try {
          const promises = [];

          // Only fetch data if we haven't already
          if (!fetchedDataRef.current.reviews) {
            // All users (admin, official, and citizen) should see all reviews for the office
            if (user && !officeReviews[officeId]) {
              console.log("Fetching all reviews for office:", officeId);
              promises.push(dispatch(fetchReviewsByOffice(officeId)).unwrap());
            }

            // Additionally fetch user's own reviews for citizens to manage their submissions
            if (user && user.role === "citizen" && !userReviews[user.user_id]) {
              console.log("Fetching user reviews for citizen:", user.user_id);
              promises.push(
                dispatch(fetchReviewsByUser(user.user_id)).unwrap()
              );
            }
            fetchedDataRef.current.reviews = true;
          }

          if (!officeGuides[officeId] && !fetchedDataRef.current.guides) {
            console.log("Fetching service guides for office:", officeId);
            promises.push(
              dispatch(fetchServiceGuidesByOffice(officeId)).unwrap()
            );
            fetchedDataRef.current.guides = true;
          }

          if (!votesByOffice[officeId] && !fetchedDataRef.current.votes) {
            console.log("Fetching votes for office:", officeId);
            promises.push(dispatch(fetchVotesByOffice(officeId)).unwrap());
            fetchedDataRef.current.votes = true;
          }

          if (promises.length > 0) {
            await Promise.all(promises);
            console.log("All related data fetched successfully");
          } else {
            console.log("All data already loaded, skipping fetch");
          }
        } catch (error) {
          console.error("Error fetching related data:", error);
        }
      };

      fetchData();
    }
  }, [
    dispatch,
    officeId,
    user,
    officeReviews,
    userReviews,
    officeGuides,
    votesByOffice,
  ]);

  // Get reviews - show all reviews for the office based on user role
  const getReviews = () => {
    if (!user) return [];

    const allOfficeReviews = officeReviews[officeId] || [];

    // For admin and official users, show all reviews (including pending, flagged, etc.)
    if (user.role === "admin" || user.role === "official") {
      return allOfficeReviews;
    }

    // For citizen users, show only approved reviews
    return allOfficeReviews.filter((review) => review.status === "approved");
  };

  const reviews = getReviews();
  const guides = officeGuides[officeId] || [];
  const voteCounts = votesByOffice[officeId] || {
    upvotes: 0,
    downvotes: 0,
    total: 0,
    ratio: 0,
  };

  // Check daily review limit and get count
  const getDailyReviewInfo = () => {
    if (!user) return { count: 0, limit: 3, hasReachedLimit: false };

    const today = new Date().toDateString();
    const userReviewsToday =
      userReviews[user.user_id]?.filter((review) => {
        const reviewDate = new Date(review.created_at).toDateString();
        return reviewDate === today;
      }) || [];

    const count = userReviewsToday.length;
    const limit = 3;
    const hasReachedLimit = count >= limit;

    return { count, limit, hasReachedLimit };
  };

  const checkDailyReviewLimit = () => {
    return getDailyReviewInfo().hasReachedLimit;
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: t("error"),
        description: t("must_be_logged_in"),
        variant: "destructive",
      });
      return;
    }

    if (!reviewContent.trim()) {
      toast({
        title: t("error"),
        description: t("review_content_required"),
        variant: "destructive",
      });
      return;
    }

    // Check daily review limit
    const reviewInfo = getDailyReviewInfo();
    if (reviewInfo.hasReachedLimit) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const hoursUntilReset = Math.ceil(
        (tomorrow.getTime() - new Date().getTime()) / (1000 * 60 * 60)
      );

      toast({
        title: t("daily_limit_reached"),
        description: `${t("daily_review_limit_detailed", {
          count: reviewInfo.count,
          limit: reviewInfo.limit,
          hours: hoursUntilReset,
        })}`,
        variant: "destructive",
      });
      return;
    }

    setSubmittingReview(true);

    try {
      await dispatch(
        createReview({
          office_id: officeId,
          rating,
          comment: reviewContent,
          is_anonymous: isAnonymous,
        })
      ).unwrap();

      toast({
        title: t("success"),
        description: t("review_submitted"),
      });

      setReviewContent("");
      setRating(5);
      setIsAnonymous(false);
      setActiveTab("reviews");

      // Refresh office reviews for all users to see the new review
      if (user) {
        dispatch(fetchReviewsByOffice(officeId));

        // Also refresh user's own reviews for citizens to update their personal review list
        if (user.role === "citizen") {
          dispatch(fetchReviewsByUser(user.user_id));
        }
      }

      // Refresh the office data to get updated ratings
      dispatch(fetchOfficeById(officeId));
    } catch (error: any) {
      // Check if it's a daily limit error from backend
      if (
        error?.code === "DAILY_LIMIT_EXCEEDED" ||
        error?.response?.data?.code === "DAILY_LIMIT_EXCEEDED"
      ) {
        toast({
          title: t("daily_limit_reached"),
          description: t("daily_review_limit_message"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("error"),
          description: error?.message || t("review_submission_failed"),
          variant: "destructive",
        });
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (officeLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (officeError) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            <p>{officeError}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => dispatch(fetchOfficeById(officeId))}
            >
              {t("retry")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedOffice) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>{t("office_not_found")}</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/dashboard/offices">{t("back_to_offices")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/offices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">
            {selectedOffice.name}
          </h2>
        </div>

        {/* Office Vote Buttons */}
        <OfficeVoteButtons officeId={officeId} />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 text-xs sm:text-sm">
              <TabsTrigger value="overview" className="px-1 sm:px-3">
                {t("overview")}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="px-1 sm:px-3">
                {t("reviews")}
              </TabsTrigger>
              <TabsTrigger value="services" className="px-1 sm:px-3">
                {t("services")}
              </TabsTrigger>
              <TabsTrigger value="add-review" className="px-1 sm:px-3">
                {t("write_review")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-4 pt-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedOffice.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedOffice.contact_info}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedOffice.operating_hours}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">{t("about_this_office")}</h3>
                  <p className="text-muted-foreground mb-2">
                    {t("office_type")}:{" "}
                    {selectedOffice.type
                      ? t(selectedOffice.type)
                      : t("unknown")}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedOffice.description ||
                      t("no_description_available")}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">{t("office_statistics")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground">
                        {t("total_reviews")}
                      </div>
                      <div className="text-2xl font-bold">{reviews.length}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground">
                        {t("average_rating")}
                      </div>
                      <div className="text-2xl font-bold">
                        {reviews.length > 0
                          ? (
                              reviews.reduce(
                                (sum, review) => sum + review.rating,
                                0
                              ) / reviews.length
                            ).toFixed(1)
                          : "0.0"}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground">
                        {t("services_offered")}
                      </div>
                      <div className="text-2xl font-bold">{guides.length}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground">
                        {t("last_updated")}
                      </div>
                      <div className="text-lg font-medium">
                        {selectedOffice.updated_at
                          ? new Date(
                              selectedOffice.updated_at
                            ).toLocaleDateString()
                          : t("unknown")}
                      </div>
                    </div>

                    {/* Vote Statistics */}
                    <div className="rounded-lg border p-3 bg-muted/30">
                      <div className="text-sm text-muted-foreground flex items-center">
                        <ThumbsUp className="mr-1 h-3 w-3 text-green-500" />
                        <span>Upvotes</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {voteCounts.upvotes}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3 bg-muted/30">
                      <div className="text-sm text-muted-foreground flex items-center">
                        <ThumbsDown className="mr-1 h-3 w-3 text-red-500" />
                        <span>Downvotes</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {voteCounts.downvotes}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3 col-span-1 sm:col-span-2 bg-muted/30">
                      <div className="text-sm text-muted-foreground">
                        Satisfaction Rate
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {voteCounts.ratio}%
                        </div>
                        <Badge
                          className={
                            voteCounts.ratio >= 70
                              ? "bg-green-500"
                              : voteCounts.ratio >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }
                        >
                          {voteCounts.ratio >= 70
                            ? "Good"
                            : voteCounts.ratio >= 40
                            ? "Average"
                            : "Poor"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="p-4 pt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t("reviews")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {reviews.length > 0 ? (
                        <>
                          {t("average_rating")}:{" "}
                          <span className="font-medium">
                            {(
                              reviews.reduce(
                                (sum, review) => sum + review.rating,
                                0
                              ) / reviews.length
                            ).toFixed(1)}
                          </span>{" "}
                          ({reviews.length}{" "}
                          {reviews.length === 1 ? t("review") : t("reviews")})
                        </>
                      ) : (
                        t("no_reviews_yet")
                      )}
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab("add-review")}>
                    {t("write_review")}
                  </Button>
                </div>

                {reviewsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : reviewsError ? (
                  <div className="text-center text-destructive">
                    <p>{reviewsError}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        if (user) {
                          dispatch(fetchReviewsByOffice(officeId));

                          // Also refresh user's own reviews for citizens
                          if (user.role === "citizen") {
                            dispatch(fetchReviewsByUser(user.user_id));
                          }
                        }
                      }}
                    >
                      {t("retry")}
                    </Button>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    <p>{t("no_reviews_yet")}</p>
                    <Button
                      className="mt-4"
                      onClick={() => setActiveTab("add-review")}
                    >
                      {t("be_first_to_review")}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = reviews.filter(
                            (r) => r.rating === rating
                          ).length;
                          const percentage = Math.round(
                            (count / reviews.length) * 100
                          );

                          return (
                            <div
                              key={rating}
                              className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs"
                            >
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < rating
                                        ? "fill-primary text-primary"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span>({count})</span>
                              <div className="w-16 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span>{percentage}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Use the new OfficeReviews component */}
                    <div className="mt-4">
                      <OfficeReviews officeId={officeId} />
                    </div>

                    <div className="mt-4 text-center">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("add-review")}
                      >
                        {t("add_your_review")}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="services" className="p-4 pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{t("services")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("total_services")}: {guides.length}
                  </p>
                </div>

                {guidesLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : guidesError ? (
                  <div className="text-center text-destructive">
                    <p>{guidesError}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() =>
                        dispatch(fetchServiceGuidesByOffice(officeId))
                      }
                    >
                      {t("retry")}
                    </Button>
                  </div>
                ) : guides.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    <p>{t("no_services_found")}</p>
                  </div>
                ) : (
                  <>
                    <Input
                      type="search"
                      placeholder={t("search_services")}
                      className="mb-4"
                    />

                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      {guides.map((guide) => (
                        <Card
                          key={guide.guide_id}
                          className="overflow-hidden transition-colors hover:bg-muted/50"
                        >
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base">
                              {guide.title}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {t("category")}:{" "}
                              {guide.category || t("uncategorized")}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {guide.description}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-xs text-muted-foreground">
                                {t("last_updated")}:{" "}
                                {new Date(
                                  guide.updated_at
                                ).toLocaleDateString()}
                              </div>
                              <Button
                                variant="link"
                                className="px-0"
                                size="sm"
                                asChild
                              >
                                <Link
                                  href={`/dashboard/services/${guide.guide_id}`}
                                >
                                  {t("view_details")}
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="mt-4 text-center">
                      <Button variant="outline" asChild>
                        <Link href="/dashboard/services">
                          {t("view_all_services")}
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="add-review" className="p-4 pt-6">
              <div className="space-y-4">
                <h3 className="font-medium">{t("write_review")}</h3>

                {/* Daily Review Counter */}
                {user && user.role === "citizen" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">
                          {t("reviews_today")}
                        </h4>
                        <p className="text-xs text-blue-700">
                          {t("reviews_remaining", {
                            count: getDailyReviewInfo().count,
                            limit: getDailyReviewInfo().limit,
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-900">
                          {getDailyReviewInfo().count}/
                          {getDailyReviewInfo().limit}
                        </div>
                        {getDailyReviewInfo().limit -
                          getDailyReviewInfo().count >
                          0 && (
                          <p className="text-xs text-blue-600">
                            {t("reviews_remaining_warning", {
                              remaining:
                                getDailyReviewInfo().limit -
                                getDailyReviewInfo().count,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t("rating")}</h4>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= rating
                                ? "fill-primary text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">{t("review")}</h4>
                    <Textarea
                      placeholder={t("write_your_review")}
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      rows={5}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous-review"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="anonymous-review"
                      className="text-sm text-muted-foreground"
                    >
                      {t("submit_anonymously")}
                    </label>
                  </div>

                  <Button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !reviewContent.trim()}
                  >
                    {submittingReview ? t("submitting") : t("submit_review")}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t("office_information")}</CardTitle>
              <CardDescription>{t("contact_and_location")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">{t("address")}</h4>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    {selectedOffice.address}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">{t("contact")}</h4>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    {selectedOffice.contact_info}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">{t("hours")}</h4>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    {selectedOffice.operating_hours}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
