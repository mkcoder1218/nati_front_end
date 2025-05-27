"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  fetchAllReviews,
  updateReviewStatus,
} from "@/store/slices/reviewSlice";
import { createReply } from "@/store/slices/reviewReplySlice";
import { fetchVotesByReview, voteOnReview } from "@/store/slices/voteSlice";
import { CommentList } from "@/components/comment-system";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/translation-context";
import { Review } from "@/services/review.service";

// Interface for the comment system
interface Comment {
  id: number | string;
  user: string;
  userRole?: string;
  rating?: number;
  date: string;
  comment: string;
  upvotes: number;
  downvotes: number;
  flagged?: boolean;
  replies?: Comment[];
  isOfficial?: boolean;
}

export default function GovernmentFeedbackPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { reviews, loading, error } = useAppSelector((state) => state.review);
  const { user } = useAppSelector((state) => state.auth);
  const { votesByReview } = useAppSelector((state) => state.vote);

  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all reviews on component mount
  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "official")) {
      // Try to fetch with replies first, fallback to without replies if it fails
      dispatch(fetchAllReviews(true)).catch(() => {
        console.warn(
          "Failed to fetch reviews with replies, falling back to basic reviews"
        );
        dispatch(fetchAllReviews(false));
      });
    }
  }, [dispatch, user]);

  // Fetch vote counts for all reviews when reviews are loaded
  useEffect(() => {
    if (Array.isArray(reviews) && reviews.length > 0) {
      reviews.forEach((review) => {
        const reviewId = review.review_id;

        // The vote slice already handles deduplication, so we can just dispatch
        // without worrying about duplicate requests
        dispatch(fetchVotesByReview(reviewId));
      });
    }
  }, [dispatch, reviews]);

  // Convert Review objects to Comment objects for the CommentList component
  const convertToComments = (reviews: Review[]): Comment[] => {
    return reviews.map((review) => {
      // Get vote counts for this review from Redux store
      const voteCounts = votesByReview[review.review_id] || {
        helpful: 0,
        not_helpful: 0,
        flag: 0,
      };

      return {
        id: review.review_id,
        user: review.user_name || t("anonymous"),
        rating: review.rating,
        date: formatDistanceToNow(new Date(review.created_at), {
          addSuffix: true,
        }),
        comment: review.comment || review.content || "",
        upvotes: voteCounts.helpful,
        downvotes: voteCounts.not_helpful,
        flagged: review.status === "flagged",
        // Convert replies to Comment format
        replies: review.replies
          ? review.replies.map((reply) => ({
              id: reply.reply_id,
              user: reply.user_name || t("government_official"),
              userRole: reply.user_role,
              date: formatDistanceToNow(new Date(reply.created_at), {
                addSuffix: true,
              }),
              comment: reply.content,
              upvotes: 0,
              downvotes: 0,
              flagged: false,
              replies: [],
              isOfficial:
                reply.user_role === "official" || reply.user_role === "admin",
            }))
          : [],
      };
    });
  };

  // Filter reviews based on search and rating
  const filteredReviews = (Array.isArray(reviews) ? reviews : []).filter(
    (review) => {
      // Search filter
      if (
        searchQuery &&
        !review.content?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Rating filter
      if (ratingFilter !== "all" && review.rating !== parseInt(ratingFilter)) {
        return false;
      }

      return true;
    }
  );

  // Get reviews based on the active tab
  const getTabReviews = () => {
    switch (activeTab) {
      case "responded":
        return filteredReviews.filter(
          (review) => review.replies && review.replies.length > 0
        );
      case "pending":
        return filteredReviews.filter((review) => review.status === "pending");
      case "flagged":
        return filteredReviews.filter((review) => review.status === "flagged");
      case "all":
      default:
        return filteredReviews;
    }
  };

  // Handle voting on a review
  const handleVote = async (
    commentId: number | string,
    voteType: "upvote" | "downvote"
  ) => {
    if (!user) {
      toast({
        title: t("error"),
        description: t("please_login_to_vote"),
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(
        voteOnReview({
          reviewId: commentId.toString(),
          voteType,
        })
      ).unwrap();

      toast({
        title: t("vote_recorded"),
        description: t("thank_you_for_feedback"),
      });
    } catch (error) {
      console.error("Vote error:", error);
      toast({
        title: t("error"),
        description: t("vote_failed"),
        variant: "destructive",
      });
    }
  };

  // Handle flagging a review
  const handleFlag = async (commentId: number | string) => {
    try {
      await dispatch(
        updateReviewStatus({
          reviewId: commentId.toString(),
          data: { status: "flagged" },
        })
      ).unwrap();

      toast({
        title: t("review_flagged"),
        description: t("review_flagged_desc"),
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("flag_failed"),
        variant: "destructive",
      });
    }
  };

  // Handle replying to a review
  const handleReply = async (commentId: number | string, replyText: string) => {
    try {
      await dispatch(
        createReply({
          reviewId: commentId.toString(),
          data: { content: replyText },
        })
      ).unwrap();

      toast({
        title: t("reply_sent"),
        description: t("reply_sent_desc"),
      });

      // Refresh reviews to show the new reply
      dispatch(fetchAllReviews(true)).catch(() => {
        dispatch(fetchAllReviews(false));
      });
    } catch (error) {
      console.error("Reply error:", error);
      toast({
        title: t("error"),
        description:
          "Reply functionality requires database setup. Please contact administrator.",
        variant: "destructive",
      });
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "official")) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <p>{t("access_restricted")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t("citizen_feedback")}
        </h2>
        <p className="text-muted-foreground">{t("view_respond_feedback")}</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        {/* <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("search_feedback")}
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("filter_by_rating")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all_ratings")}</SelectItem>
              <SelectItem value="5">5 {t("stars")}</SelectItem>
              <SelectItem value="4">4 {t("stars")}</SelectItem>
              <SelectItem value="3">3 {t("stars")}</SelectItem>
              <SelectItem value="2">2 {t("stars")}</SelectItem>
              <SelectItem value="1">1 {t("star")}</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">{t("all_feedback")}</TabsTrigger>
          <TabsTrigger value="responded">{t("responded")}</TabsTrigger>
          <TabsTrigger value="pending">{t("pending_response")}</TabsTrigger>
          <TabsTrigger value="flagged">{t("flagged")}</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-destructive">
                <p>{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    dispatch(fetchAllReviews(true)).catch(() =>
                      dispatch(fetchAllReviews(false))
                    )
                  }
                >
                  {t("retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : getTabReviews().length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <p>{t("no_feedback_found")}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <TabsContent value="all" className="space-y-4 pt-4">
              <CommentList
                comments={convertToComments(getTabReviews())}
                onVote={handleVote}
                onFlag={handleFlag}
                onReply={handleReply}
              />
            </TabsContent>
            <TabsContent value="responded" className="space-y-4 pt-4">
              <CommentList
                comments={convertToComments(getTabReviews())}
                onVote={handleVote}
                onFlag={handleFlag}
                onReply={handleReply}
              />
            </TabsContent>
            <TabsContent value="pending" className="space-y-4 pt-4">
              <CommentList
                comments={convertToComments(getTabReviews())}
                onVote={handleVote}
                onFlag={handleFlag}
                onReply={handleReply}
              />
            </TabsContent>
            <TabsContent value="flagged" className="space-y-4 pt-4">
              <CommentList
                comments={convertToComments(getTabReviews())}
                onVote={handleVote}
                onFlag={handleFlag}
                onReply={handleReply}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
