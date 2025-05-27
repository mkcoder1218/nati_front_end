"use client";

import { useState, useEffect } from "react";
import { HydratedDate } from "@/lib/date-utils";
import { Flag, MessageSquare, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  voteOnReview,
  removeVoteFromReview,
  fetchVotesByReview,
} from "@/store/slices/voteSlice";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/translation-context";
import { Review } from "@/services/review.service";

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { votesByReview, userVotes } = useAppSelector((state) => state.vote);

  // Track which reviews we've already fetched votes for
  const fetchedVotesRef = useState(() => new Set<string>())[0];

  // Fetch votes for all reviews when the component mounts, but only if not already fetched
  useEffect(() => {
    if (reviews.length > 0) {
      reviews.forEach((review) => {
        const reviewId = review.review_id;

        // Skip if we already have vote counts or if we're already fetching
        if (review.vote_counts || fetchedVotesRef.has(reviewId)) {
          return;
        }

        // Mark that we're fetching votes for this review
        fetchedVotesRef.add(reviewId);

        dispatch(fetchVotesByReview(reviewId))
          .unwrap()
          .then((result) => {
            // Update the review with vote counts
            review.vote_counts = result.voteCounts;
          })
          .catch((error) => {
            console.error("Failed to fetch votes for review:", error);
            // Remove from the set on error so we can try again
            fetchedVotesRef.delete(reviewId);
          });
      });
    }
  }, [dispatch, reviews, fetchedVotesRef]);

  const handleVote = async (
    reviewId: string,
    voteType: "upvote" | "downvote"
  ) => {
    if (!user) {
      toast({
        title: t("error"),
        description: t("must_be_logged_in"),
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if user already voted on this review
      const existingVote = userVotes[reviewId];

      if (existingVote) {
        // If the user is clicking the same vote type, remove the vote
        if (
          (existingVote.vote_type === "helpful" && voteType === "upvote") ||
          (existingVote.vote_type === "not_helpful" && voteType === "downvote")
        ) {
          await dispatch(removeVoteFromReview(reviewId)).unwrap();
          toast({
            title: t("success"),
            description: t("vote_removed"),
          });
        } else {
          // If the user is changing their vote type
          await dispatch(voteOnReview({ reviewId, voteType })).unwrap();
          toast({
            title: t("success"),
            description: t("vote_updated"),
          });
        }
      } else {
        // New vote
        await dispatch(voteOnReview({ reviewId, voteType })).unwrap();
        toast({
          title: t("success"),
          description: t("vote_recorded"),
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("vote_failed"),
        variant: "destructive",
      });
    }
  };

  const handleFlag = async (reviewId: string) => {
    if (!user) {
      toast({
        title: t("error"),
        description: t("must_be_logged_in"),
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if user already flagged this review
      const existingVote = userVotes[reviewId];

      if (existingVote && existingVote.vote_type === "flag") {
        // If the user already flagged, remove the flag
        await dispatch(removeVoteFromReview(reviewId)).unwrap();
        toast({
          title: t("success"),
          description: t("flag_removed"),
        });
      } else {
        // New flag - we need to use a different approach since our voteOnReview
        // function doesn't directly support "flag" as a vote type
        await dispatch(
          voteOnReview({
            reviewId,
            voteType: "flag" as any, // Type assertion needed since flag is not in the type
          })
        ).unwrap();

        toast({
          title: t("success"),
          description: t("review_flagged"),
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("flag_failed"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.review_id}
          review={review}
          onVote={handleVote}
          onFlag={handleFlag}
        />
      ))}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  onVote: (reviewId: string, voteType: "upvote" | "downvote") => void;
  onFlag: (reviewId: string) => void;
}

function ReviewCard({ review, onVote, onFlag }: ReviewCardProps) {
  const { t } = useTranslation();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { votesByReview, userVotes } = useAppSelector((state) => state.vote);

  // Get vote counts for this review
  const voteCounts = votesByReview[review.review_id] || {
    helpful: 0,
    not_helpful: 0,
    flag: 0,
  };

  // Check if the current user has voted on this review
  const userVote = userVotes[review.review_id];

  // Determine if the user has upvoted, downvoted, or flagged
  const hasUpvoted = userVote?.vote_type === "helpful";
  const hasDownvoted = userVote?.vote_type === "not_helpful";
  const hasFlagged = userVote?.vote_type === "flag";

  // Check if the review is flagged by multiple users
  const isFlagged = review.status === "flagged" || voteCounts.flag >= 3;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarFallback>
              {getInitials(review.user_name || "Anonymous")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">
                  {review.user_name || t("anonymous")}
                </h4>
                <div className="flex items-center gap-2">
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
                  <HydratedDate
                    dateString={review.created_at}
                    className="text-xs text-muted-foreground"
                  />
                  {review.status === "pending" && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      {t("pending_approval")}
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant={hasFlagged || isFlagged ? "default" : "ghost"}
                size="icon"
                onClick={() => onFlag(review.review_id)}
                title={hasFlagged ? t("remove_flag") : t("report_review")}
                className={isFlagged ? "bg-amber-600 hover:bg-amber-700" : ""}
              >
                <Flag className="h-4 w-4" />
                {isFlagged && (
                  <span className="sr-only">{t("flagged_for_review")}</span>
                )}
              </Button>
            </div>

            {isFlagged && (
              <div className="mb-2 rounded-md bg-amber-50 p-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  <p>{t("flagged_content_warning")}</p>
                </div>
              </div>
            )}
            <p>{review.comment || review.content}</p>

            {/* Display replies if any */}
            {review.replies && review.replies.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t("replies")} ({review.replies.length})
                </h4>
                {review.replies.map((reply, index) => (
                  <div
                    key={reply.reply_id || index}
                    className="bg-muted/30 rounded-lg p-3 border-l-2 border-primary/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {reply.user_name || t("government_official")}
                        </span>
                        {(reply.user_role === "official" ||
                          reply.user_role === "admin") && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {t("official")}
                          </span>
                        )}
                      </div>
                      <HydratedDate
                        dateString={reply.created_at}
                        className="text-xs text-muted-foreground"
                      />
                    </div>
                    <p className="text-sm">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant={hasUpvoted ? "default" : "ghost"}
                size="sm"
                className={`h-8 gap-1 ${
                  hasUpvoted ? "bg-green-600 hover:bg-green-700" : ""
                }`}
                onClick={() => onVote(review.review_id, "upvote")}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-xs">{voteCounts.helpful}</span>
              </Button>

              <Button
                variant={hasDownvoted ? "default" : "ghost"}
                size="sm"
                className={`h-8 gap-1 ${
                  hasDownvoted ? "bg-red-600 hover:bg-red-700" : ""
                }`}
                onClick={() => onVote(review.review_id, "downvote")}
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="text-xs">{voteCounts.not_helpful}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">{t("reply")}</span>
              </Button>
            </div>

            {showReplyForm && (
              <div className="pt-2">
                <Separator className="my-2" />
                <div className="space-y-2">
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={t("write_reply")}
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReplyForm(false)}
                    >
                      {t("cancel")}
                    </Button>
                    <Button size="sm">{t("reply")}</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
