"use client";

import { useEffect, useState } from "react";
import { HydratedDate } from "@/lib/date-utils";
import {
  Edit,
  Filter,
  Search,
  Star,
  Trash2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  fetchReviewsByUser,
  updateReview,
  deleteReview,
} from "@/store/slices/reviewSlice";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/translation-context";
import { Review } from "@/services/review.service";

export function UserRatings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { userReviews, loading, error } = useAppSelector(
    (state) => state.review
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter] = useState("all");
  const [officeFilter] = useState("all");
  const [dateFilter] = useState("all");
  const [isHydrated, setIsHydrated] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [editFormState, setEditFormState] = useState({
    rating: 5,
    content: "",
  });

  // Hydration effect
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    if (!isHydrated) return;

    if (user) {
      console.log("Fetching reviews for user:", user.user_id);
      dispatch(fetchReviewsByUser(user.user_id));
    }
  }, [dispatch, user, isHydrated]);

  // Debug logging
  useEffect(() => {
    console.log("UserRatings Debug:", {
      user,
      userReviews,
      loading,
      error,
      currentUserReviews: user ? userReviews[user.user_id] : null,
    });
  }, [user, userReviews, loading, error]);

  // Get user reviews
  const getUserReviews = () => {
    if (!user) return [];
    return userReviews[user.user_id] || [];
  };

  // Filter reviews based on search and filters
  const filteredReviews = getUserReviews().filter((review) => {
    // Search filter
    if (
      searchQuery &&
      !(review.comment || review.content)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !review.office_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Rating filter
    if (ratingFilter !== "all" && review.rating !== parseInt(ratingFilter)) {
      return false;
    }

    // Office filter
    if (officeFilter !== "all" && review.office_id !== officeFilter) {
      return false;
    }

    // Date filter
    if (dateFilter !== "all") {
      const reviewDate = new Date(review.created_at);
      const now = new Date();

      if (dateFilter === "today") {
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        return reviewDate >= today;
      } else if (dateFilter === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return reviewDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return reviewDate >= monthAgo;
      }
    }

    return true;
  });

  // Handle edit review
  const handleEditReview = async () => {
    if (!selectedReview) return;

    try {
      await dispatch(
        updateReview({
          reviewId: selectedReview.review_id,
          data: {
            rating: editFormState.rating,
            comment: editFormState.content,
          },
        })
      ).unwrap();

      toast({
        title: t("success"),
        description: t("review_updated"),
      });

      setEditDialogOpen(false);
    } catch (error) {
      toast({
        title: t("error"),
        description: t("update_failed"),
        variant: "destructive",
      });
    }
  };

  // Handle delete review
  const handleDeleteReview = async () => {
    if (!selectedReview) return;

    try {
      await dispatch(deleteReview(selectedReview.review_id)).unwrap();

      toast({
        title: t("success"),
        description: t("review_deleted"),
      });

      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: t("error"),
        description: t("delete_failed"),
        variant: "destructive",
      });
    }
  };

  // Show loading during hydration
  if (!isHydrated) {
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

  if (!user) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <p>{t("must_be_logged_in")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("my_ratings")}</h2>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <TabsList>
            <TabsTrigger value="all">{t("all_ratings")}</TabsTrigger>
            <TabsTrigger value="recent">{t("recent")}</TabsTrigger>
            <TabsTrigger value="highest">{t("highest_rated")}</TabsTrigger>
            <TabsTrigger value="lowest">{t("lowest_rated")}</TabsTrigger>
            <TabsTrigger value="most_voted">{t("most_voted")}</TabsTrigger>
          </TabsList>

         {/** <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("search_ratings")}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>**/}
        </div>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <p>{t("loading")}</p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <p className="text-red-500">
                    {t("error")}: {error}
                  </p>
                  <Button
                    onClick={() => {
                      if (user) {
                        dispatch(fetchReviewsByUser(user.user_id));
                      }
                    }}
                    className="mt-4"
                  >
                    {t("retry")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <p>{t("no_ratings_found")}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("debug")}: {getUserReviews().length} total reviews found
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((review) => (
              <Card key={review.review_id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{review.office_name}</h3>
                      <div className="flex items-center">
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
                        <HydratedDate
                          dateString={review.created_at}
                          className="ml-2 text-sm text-muted-foreground"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedReview(review);
                          setEditFormState({
                            rating: review.rating,
                            content: review.comment || review.content || "",
                          });
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedReview(review);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <p className="text-sm">{review.comment || review.content}</p>

                  {/* Display replies if any */}
                  {(review as any).replies &&
                    (review as any).replies.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          {t("replies")} ({(review as any).replies.length})
                        </h4>
                        {(review as any).replies.map(
                          (reply: any, index: number) => (
                            <div
                              key={index}
                              className="bg-muted/30 rounded-lg p-3 border-l-2 border-primary/20"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {reply.author_name ||
                                      t("government_official")}
                                  </span>
                                  {reply.is_official && (
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
                          )
                        )}
                      </div>
                    )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {[...getUserReviews()]
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .slice(0, 5)
            .map((review) => (
              <Card key={review.review_id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{review.office_name}</h3>
                      <div className="flex items-center">
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
                        <HydratedDate
                          dateString={review.created_at}
                          className="ml-2 text-sm text-muted-foreground"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedReview(review);
                          setEditFormState({
                            rating: review.rating,
                            content: review.comment || review.content || "",
                          });
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedReview(review);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <p className="text-sm">{review.comment || review.content}</p>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="highest" className="space-y-4">
          {[...getUserReviews()]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5)
            .map((review) => (
              <Card key={review.review_id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{review.office_name}</h3>
                      <div className="flex items-center">
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
                        <HydratedDate
                          dateString={review.created_at}
                          className="ml-2 text-sm text-muted-foreground"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedReview(review);
                          setEditFormState({
                            rating: review.rating,
                            content: review.comment || review.content || "",
                          });
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedReview(review);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <p className="text-sm">{review.comment || review.content}</p>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="lowest" className="space-y-4">
          {[...getUserReviews()]
            .sort((a, b) => a.rating - b.rating)
            .slice(0, 5)
            .map((review) => (
              <Card key={review.review_id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{review.office_name}</h3>
                      <div className="flex items-center">
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
                        <HydratedDate
                          dateString={review.created_at}
                          className="ml-2 text-sm text-muted-foreground"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedReview(review);
                          setEditFormState({
                            rating: review.rating,
                            content: review.comment || review.content || "",
                          });
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedReview(review);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <p className="text-sm">{review.comment || review.content}</p>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="most_voted" className="space-y-4">
          {[...getUserReviews()]
            .sort((a, b) => {
              // Sort by total votes (helpful + not_helpful)
              const aVotes =
                (a.vote_counts?.helpful || 0) +
                (a.vote_counts?.not_helpful || 0);
              const bVotes =
                (b.vote_counts?.helpful || 0) +
                (b.vote_counts?.not_helpful || 0);
              return bVotes - aVotes;
            })
            .slice(0, 5)
            .map((review) => (
              <Card key={review.review_id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{review.office_name}</h3>
                      <div className="flex items-center">
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
                        <HydratedDate
                          dateString={review.created_at}
                          className="ml-2 text-sm text-muted-foreground"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedReview(review);
                          setEditFormState({
                            rating: review.rating,
                            content: review.comment || review.content || "",
                          });
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedReview(review);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <p className="text-sm">{review.comment || review.content}</p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <ThumbsUp className="mr-1 h-4 w-4" />
                      <span>{review.vote_counts?.helpful || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsDown className="mr-1 h-4 w-4" />
                      <span>{review.vote_counts?.not_helpful || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {/* Edit Review Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("edit_review")}</DialogTitle>
            <DialogDescription>{t("edit_review_desc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="rating">{t("rating")}</Label>
              <Select
                value={editFormState.rating.toString()}
                onValueChange={(value) =>
                  setEditFormState({
                    ...editFormState,
                    rating: parseInt(value),
                  })
                }
              >
                <SelectTrigger id="rating">
                  <SelectValue placeholder={t("select_rating")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">★★★★★ (5)</SelectItem>
                  <SelectItem value="4">★★★★☆ (4)</SelectItem>
                  <SelectItem value="3">★★★☆☆ (3)</SelectItem>
                  <SelectItem value="2">★★☆☆☆ (2)</SelectItem>
                  <SelectItem value="1">★☆☆☆☆ (1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">{t("review")}</Label>
              <Textarea
                id="content"
                value={editFormState.content}
                onChange={(e) =>
                  setEditFormState({
                    ...editFormState,
                    content: e.target.value,
                  })
                }
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleEditReview}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Review Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("delete_review")}</DialogTitle>
            <DialogDescription>{t("delete_review_confirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteReview}>
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
