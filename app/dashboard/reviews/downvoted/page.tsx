"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchUserDownvotedReviews } from "@/store/slices/voteSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/translation-context";
import { ReviewList } from "@/components/dashboard/review-list";
import { ThumbsDown, MessageSquare, Building2 } from "lucide-react";
import { HydratedDate } from "@/lib/date-utils";

export default function DownvotedReviewsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { downvotedReviews, loading, error } = useAppSelector(
    (state) => state.vote
  );
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserDownvotedReviews());
    }
  }, [dispatch, user]);

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <ThumbsDown className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {t("authentication_required")}
              </h3>
              <p className="text-muted-foreground">
                {t("please_login_to_view_downvoted_reviews")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== "official" && user.role !== "admin") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <ThumbsDown className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {t("access_denied")}
              </h3>
              <p className="text-muted-foreground">
                {t("only_officials_can_view_downvoted_reviews")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ThumbsDown className="h-8 w-8 text-red-600" />
            {t("downvoted_reviews")}
          </h1>
          <p className="text-muted-foreground">
            {user.role === "official"
              ? t("reviews_you_have_downvoted_for_your_office")
              : t("reviews_you_have_downvoted")}
          </p>
          {user.role === "official" && (
            <div className="flex items-center gap-2 mt-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary">{t("office_specific_data")}</Badge>
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-red-600">
            {downvotedReviews.length}
          </div>
          <div className="text-sm text-muted-foreground">
            {t("total_downvoted")}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-destructive">
              <p>{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => dispatch(fetchUserDownvotedReviews())}
              >
                {t("retry")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : downvotedReviews.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <ThumbsDown className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {t("no_downvoted_reviews")}
              </h3>
              <p className="text-muted-foreground">
                {user.role === "official"
                  ? t("you_havent_downvoted_any_reviews_for_your_office_yet")
                  : t("you_havent_downvoted_any_reviews_yet")}
              </p>
              <Button
                className="mt-4"
                onClick={() =>
                  (window.location.href = "/dashboard/reviews/browse")
                }
              >
                {t("browse_reviews")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {downvotedReviews.map((review) => (
            <Card
              key={review.review_id}
              className="border-l-4 border-l-red-500"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-red-100 p-2">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {review.user_name || t("anonymous")}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {t("reviewed")} {review.office_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < review.rating
                                  ? "text-yellow-500"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          <HydratedDate dateString={review.created_at} />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("downvoted_on")}{" "}
                    <HydratedDate dateString={review.voted_at} />
                  </div>
                </div>
              </CardHeader>
              {review.comment && (
                <CardContent>
                  <p className="text-sm">{review.comment}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
