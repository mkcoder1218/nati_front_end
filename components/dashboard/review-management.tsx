"use client";

import { useEffect, useState } from "react";
import { HydratedDate } from "@/lib/date-utils";
import { Edit, Filter, Search, Star, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  fetchAllReviews,
  fetchReviewsByUser,
  updateReview,
  updateReviewStatus,
  deleteReview,
} from "@/store/slices/reviewSlice";
import { fetchAllOffices } from "@/store/slices/officeSlice";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export function ReviewManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { reviews, userReviews, loading, error } = useAppSelector(
    (state) => state.review
  );
  const { offices } = useAppSelector((state) => state.office);

  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [officeFilter, setOfficeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [editFormState, setEditFormState] = useState({
    rating: 5,
    content: "",
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchAllOffices());

    if (user) {
      if (user.role === "admin" || user.role === "official") {
        dispatch(fetchAllReviews());
      } else {
        dispatch(fetchReviewsByUser(user.user_id));
      }
    }
  }, [dispatch, user]);

  // Get reviews based on user role
  const getReviews = () => {
    if (!user) return [];

    if (user.role === "admin" || user.role === "official") {
      return reviews;
    } else {
      return userReviews[user.user_id] || [];
    }
  };

  // Filter reviews
  const filteredReviews = getReviews().filter((review) => {
    // Search filter
    const matchesSearch =
      review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.office_name &&
        review.office_name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Rating filter
    const matchesRating =
      ratingFilter === "all" || review.rating === parseInt(ratingFilter);

    // Office filter
    const matchesOffice =
      officeFilter === "all" || review.office_id === officeFilter;

    // Date filter
    let matchesDate = true;
    const reviewDate = new Date(review.created_at);
    const now = new Date();

    if (dateFilter === "today") {
      matchesDate = reviewDate.toDateString() === now.toDateString();
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      matchesDate = reviewDate >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      matchesDate = reviewDate >= monthAgo;
    }

    // Status filter (for admin/official)
    const matchesStatus =
      statusFilter === "all" || review.status === statusFilter;

    return (
      matchesSearch &&
      matchesRating &&
      matchesOffice &&
      matchesDate &&
      matchesStatus
    );
  });

  // Calculate statistics
  const totalReviews = getReviews().length;
  const averageRating =
    totalReviews > 0
      ? getReviews().reduce((sum, review) => sum + review.rating, 0) /
        totalReviews
      : 0;

  // Handle edit review
  const handleEditReview = async () => {
    if (!selectedReview) return;

    try {
      await dispatch(
        updateReview({
          reviewId: selectedReview.review_id,
          data: {
            rating: editFormState.rating,
            content: editFormState.content,
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
        description: t("review_update_failed"),
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
        description: t("review_delete_failed"),
        variant: "destructive",
      });
    }
  };

  // Handle review status update (for admin/official)
  const handleUpdateStatus = async (
    reviewId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      await dispatch(
        updateReviewStatus({
          reviewId,
          data: { status },
        })
      ).unwrap();

      toast({
        title: t("success"),
        description: t(`review_${status}`),
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("status_update_failed"),
        variant: "destructive",
      });
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>{t("must_be_logged_in")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t("review_management")}
        </h2>
        <p className="text-muted-foreground">
          {user.role === "admin" || user.role === "official"
            ? t("manage_all_reviews")
            : t("manage_your_reviews")}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("total_reviews")}
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("average_rating")}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("filter_reviews")}</CardTitle>
          <CardDescription>{t("filter_reviews_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">{t("search")}</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="search"
                  placeholder={t("search_reviews")}
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">{t("rating")}</Label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger id="rating">
                  <SelectValue placeholder={t("all_ratings")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all_ratings")}</SelectItem>
                  <SelectItem value="5">★★★★★ (5)</SelectItem>
                  <SelectItem value="4">★★★★☆ (4)</SelectItem>
                  <SelectItem value="3">★★★☆☆ (3)</SelectItem>
                  <SelectItem value="2">★★☆☆☆ (2)</SelectItem>
                  <SelectItem value="1">★☆☆☆☆ (1)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="office">{t("office")}</Label>
              <Select value={officeFilter} onValueChange={setOfficeFilter}>
                <SelectTrigger id="office">
                  <SelectValue placeholder={t("all_offices")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all_offices")}</SelectItem>
                  {offices.map((office) => (
                    <SelectItem key={office.office_id} value={office.office_id}>
                      {office.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">{t("date")}</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger id="date">
                  <SelectValue placeholder={t("all_time")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all_time")}</SelectItem>
                  <SelectItem value="today">{t("today")}</SelectItem>
                  <SelectItem value="week">{t("past_week")}</SelectItem>
                  <SelectItem value="month">{t("past_month")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(user.role === "admin" || user.role === "official") && (
              <div className="space-y-2">
                <Label htmlFor="status">{t("status")}</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder={t("all_statuses")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_statuses")}</SelectItem>
                    <SelectItem value="pending">{t("pending")}</SelectItem>
                    <SelectItem value="approved">{t("approved")}</SelectItem>
                    <SelectItem value="rejected">{t("rejected")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t("reviews")}</h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-destructive">
                <p>{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    if (user.role === "admin" || user.role === "official") {
                      dispatch(fetchAllReviews());
                    } else {
                      dispatch(fetchReviewsByUser(user.user_id));
                    }
                  }}
                >
                  {t("retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <p>{t("no_reviews_found")}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.review_id}>
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
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {(user.role === "admin" ||
                          user.role === "official" ||
                          user.user_id === review.user_id) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedReview(review);
                                setEditFormState({
                                  rating: review.rating,
                                  content: review.content,
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
                          </>
                        )}
                      </div>
                    </div>

                    <p>{review.content}</p>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {t("office")}: {review.office_name}
                      </div>

                      {(user.role === "admin" || user.role === "official") && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {t("status")}: {t(review.status)}
                          </span>

                          {review.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(
                                    review.review_id,
                                    "approved"
                                  )
                                }
                              >
                                {t("approve")}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(
                                    review.review_id,
                                    "rejected"
                                  )
                                }
                              >
                                {t("reject")}
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Review Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("edit_review")}</DialogTitle>
            <DialogDescription>{t("edit_review_desc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-rating">{t("rating")}</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setEditFormState({ ...editFormState, rating: star })
                    }
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= editFormState.rating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">{t("review")}</Label>
              <Textarea
                id="edit-content"
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
            <DialogDescription>{t("delete_review_desc")}</DialogDescription>
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
