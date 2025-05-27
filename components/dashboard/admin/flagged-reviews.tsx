"use client";

import { useEffect, useState } from "react";
import { HydratedDate } from "@/lib/date-utils";
import { Check, Flag, MessageSquare, Star, Trash2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  fetchFlaggedReviews,
  updateReviewStatus,
  fetchAdminDashboardStats,
} from "@/store/slices/adminSlice";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/translation-context";

export function FlaggedReviews() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { flaggedReviews, loading, error } = useAppSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchFlaggedReviews());
  }, [dispatch]);

  const handleApprove = async (reviewId: string) => {
    try {
      await dispatch(
        updateReviewStatus({
          reviewId,
          status: "approved",
        })
      ).unwrap();

      // Refresh dashboard stats to update flagged comments count
      dispatch(fetchAdminDashboardStats());

      toast({
        title: t("success"),
        description: t("review_approved"),
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("action_failed"),
        variant: "destructive",
      });
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      await dispatch(
        updateReviewStatus({
          reviewId,
          status: "rejected",
        })
      ).unwrap();

      // Refresh dashboard stats to update flagged comments count
      dispatch(fetchAdminDashboardStats());

      toast({
        title: t("success"),
        description: t("review_rejected"),
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("action_failed"),
        variant: "destructive",
      });
    }
  };

  const handleResolve = async (reviewId: string) => {
    try {
      await dispatch(
        updateReviewStatus({
          reviewId,
          status: "resolved",
        })
      ).unwrap();

      // Refresh dashboard stats to update flagged comments count
      dispatch(fetchAdminDashboardStats());

      toast({
        title: t("success"),
        description: t("flags_resolved"),
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("action_failed"),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <p>{t("loading")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <p>{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => dispatch(fetchFlaggedReviews())}
            >
              {t("retry")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!flaggedReviews || flaggedReviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <p>{t("no_flagged_reviews")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("flagged_reviews")}</h2>
      <p className="text-muted-foreground">
        {t("flagged_reviews_description")}
      </p>

      <div className="space-y-4">
        {flaggedReviews.map((review) => (
          <Card key={review.review_id} className="border-amber-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{review.user_name || t("anonymous")}</CardTitle>
                  <CardDescription>
                    {t("reviewed")} {review.office_name} •{" "}
                    <HydratedDate dateString={review.created_at} />
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  <Flag className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {t("flagged_count", { count: review.flag_count })}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
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
              <p className="text-sm">{review.comment || review.content}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                onClick={() => handleApprove(review.review_id)}
              >
                <Check className="mr-1 h-4 w-4" />
                {t("approve")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-500 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
                onClick={() => handleResolve(review.review_id)}
              >
                <Flag className="mr-1 h-4 w-4" />
                {t("resolve_flags")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => handleReject(review.review_id)}
              >
                <X className="mr-1 h-4 w-4" />
                {t("reject")}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
