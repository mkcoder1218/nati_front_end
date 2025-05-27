"use client";

import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  fetchReviewsByOffice,
  fetchReviewsByUser,
} from "@/store/slices/reviewSlice";
import { fetchVotesByReview } from "@/store/slices/voteSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/lib/translation-context";
import { ReviewList } from "./review-list";
import { Review } from "@/services/review.service";

interface OfficeReviewsProps {
  officeId: string;
}

export function OfficeReviews({ officeId }: OfficeReviewsProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { officeReviews, userReviews, loading, error } = useAppSelector(
    (state) => state.review
  );
  const { user } = useAppSelector((state) => state.auth);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Use refs to track if we've already fetched data
  const initialFetchDoneRef = useRef<boolean>(false);
  const fetchingVotesRef = useRef<Set<string>>(new Set());

  // Fetch reviews for the office
  useEffect(() => {
    if (!user || initialFetchDoneRef.current) return;

    // All users should see reviews for the office
    if (!officeReviews[officeId]) {
      console.log("OfficeReviews: Fetching all reviews for office:", officeId);
      dispatch(fetchReviewsByOffice(officeId));
    }

    initialFetchDoneRef.current = true;
  }, [dispatch, officeId, user, officeReviews]);

  // Update local state when reviews change
  useEffect(() => {
    if (!user) return;

    let reviewsToShow: Review[] = [];

    // Show all approved reviews for the office for all users
    if (officeReviews[officeId]) {
      reviewsToShow = officeReviews[officeId];
    }

    if (reviewsToShow.length > 0) {
      console.log("OfficeReviews: Updating local state with reviews");
      setReviews(reviewsToShow);

      // Fetch votes for all reviews, but only if not already fetching for a review
      reviewsToShow.forEach((review) => {
        const reviewId = review.review_id;

        // Skip if we're already fetching votes for this review
        if (fetchingVotesRef.current.has(reviewId)) {
          return;
        }

        // Mark that we're fetching votes for this review
        fetchingVotesRef.current.add(reviewId);

        dispatch(fetchVotesByReview(reviewId))
          .unwrap()
          .then((result) => {
            // Update the review with vote counts
            review.vote_counts = result.voteCounts;
          })
          .catch((error) => {
            console.error("Failed to fetch votes for review:", error);
          })
          .finally(() => {
            // Remove from the set when done
            fetchingVotesRef.current.delete(reviewId);
          });
      });
    }
  }, [dispatch, officeId, user, officeReviews]);

  // Filter reviews based on user role
  const getApprovedReviews = () => {
    if (!user) return [];

    // For admin and official users, show all reviews
    if (user.role === "admin" || user.role === "official") {
      return reviews;
    }

    // For citizen users, show only approved reviews
    return reviews.filter((review) => review.status === "approved");
  };

  // Get recent reviews
  const getRecentReviews = () => {
    return [...getApprovedReviews()].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  // Get highest rated reviews
  const getHighestRatedReviews = () => {
    return [...getApprovedReviews()].sort((a, b) => b.rating - a.rating);
  };

  // Get lowest rated reviews
  const getLowestRatedReviews = () => {
    return [...getApprovedReviews()].sort((a, b) => a.rating - b.rating);
  };

  // Get most voted reviews
  const getMostVotedReviews = () => {
    return [...getApprovedReviews()].sort((a, b) => {
      const aVotes =
        (a.vote_counts?.helpful || 0) + (a.vote_counts?.not_helpful || 0);
      const bVotes =
        (b.vote_counts?.helpful || 0) + (b.vote_counts?.not_helpful || 0);
      return bVotes - aVotes;
    });
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
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <p>{t("no_reviews_yet")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">{t("all_reviews")}</TabsTrigger>
        <TabsTrigger value="recent">{t("recent")}</TabsTrigger>
        <TabsTrigger value="highest">{t("highest_rated")}</TabsTrigger>
        <TabsTrigger value="lowest">{t("lowest_rated")}</TabsTrigger>
        <TabsTrigger value="most_voted">{t("most_voted")}</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        <ReviewList reviews={getApprovedReviews()} />
      </TabsContent>

      <TabsContent value="recent" className="space-y-4">
        <ReviewList reviews={getRecentReviews()} />
      </TabsContent>

      <TabsContent value="highest" className="space-y-4">
        <ReviewList reviews={getHighestRatedReviews()} />
      </TabsContent>

      <TabsContent value="lowest" className="space-y-4">
        <ReviewList reviews={getLowestRatedReviews()} />
      </TabsContent>

      <TabsContent value="most_voted" className="space-y-4">
        <ReviewList reviews={getMostVotedReviews()} />
      </TabsContent>
    </Tabs>
  );
}
