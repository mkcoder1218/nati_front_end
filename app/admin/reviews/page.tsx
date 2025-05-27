"use client";

import { useEffect, useState } from "react";
import { HydratedDate } from "@/lib/date-utils";
import {
  Check,
  Flag,
  MessageSquare,
  Star,
  Trash2,
  X,
  Reply,
  Filter,
  Search,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchAdminDashboardStats } from "@/store/slices/adminSlice";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/translation-context";
import ReviewService from "@/services/review.service";
import { ReviewCard } from "@/components/admin/review-card";

export default function AdminReviewsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  // Local state
  const [allReviews, setAllReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOffice, setSelectedOffice] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [showResponseForm, setShowResponseForm] = useState({});
  const [responseText, setResponseText] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [offices, setOffices] = useState([]);

  // Fetch reviews on component mount
  useEffect(() => {
    fetchAllReviews();
    fetchOffices();
  }, []);

  // Filter reviews when filters change
  useEffect(() => {
    filterReviews();
  }, [allReviews, searchTerm, selectedOffice, selectedStatus, selectedRating]);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const reviewsData = await ReviewService.getAllReviews({
        includeReplies: true,
      });
      setAllReviews(reviewsData.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchOffices = async () => {
    try {
      // TODO: Add office service call
      // const officesData = await OfficeService.getAllOffices();
      // setOffices(officesData);
      setOffices([]); // Mock for now
    } catch (error) {
      console.error("Error fetching offices:", error);
    }
  };

  const filterReviews = () => {
    let filtered = [...allReviews];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.office_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          review.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Office filter
    if (selectedOffice !== "all") {
      filtered = filtered.filter(
        (review) => review.office_id === selectedOffice
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((review) => review.status === selectedStatus);
    }

    // Rating filter
    if (selectedRating !== "all") {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(selectedRating)
      );
    }

    setFilteredReviews(filtered);
  };

  const handleApprove = async (reviewId: string) => {
    try {
      setSubmitting(true);
      await ReviewService.updateReviewStatus(reviewId, "approved");
      await fetchAllReviews(); // Refresh the list
      dispatch(fetchAdminDashboardStats()); // Refresh dashboard stats
      toast({
        title: t("success"),
        description: "Review approved successfully",
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: "Failed to approve review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      setSubmitting(true);
      await ReviewService.updateReviewStatus(reviewId, "rejected");
      await fetchAllReviews(); // Refresh the list
      dispatch(fetchAdminDashboardStats()); // Refresh dashboard stats
      toast({
        title: t("success"),
        description: "Review rejected successfully",
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: "Failed to reject review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFlag = async (reviewId: string) => {
    try {
      setSubmitting(true);
      await ReviewService.flagReview(reviewId, "Admin flagged for review");
      await fetchAllReviews(); // Refresh the list
      dispatch(fetchAdminDashboardStats()); // Refresh dashboard stats
      toast({
        title: t("success"),
        description: "Review flagged successfully",
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: "Failed to flag review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddResponse = async (reviewId: string) => {
    const response = responseText[reviewId];
    if (!response || response.trim() === "") {
      toast({
        title: t("error"),
        description: "Please enter a response",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await ReviewService.addAdminResponse(reviewId, response);
      await fetchAllReviews(); // Refresh the list

      setResponseText((prev) => ({ ...prev, [reviewId]: "" }));
      setShowResponseForm((prev) => ({ ...prev, [reviewId]: false }));

      toast({
        title: t("success"),
        description: "Response added successfully",
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: "Failed to add response",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleResponseForm = (reviewId: string) => {
    setShowResponseForm((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  const getFilteredReviewsByStatus = (status: string) => {
    return filteredReviews.filter((review) => review.status === status);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "flagged":
        return (
          <Badge variant="destructive" className="bg-amber-100 text-amber-800">
            Flagged
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Reviews</h1>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p>Loading reviews...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Reviews</h1>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-red-600">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={fetchAllReviews}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Reviews</h1>
          <p className="text-muted-foreground">
            View, respond to, and moderate all office reviews
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Office</label>
              <Select value={selectedOffice} onValueChange={setSelectedOffice}>
                <SelectTrigger>
                  <SelectValue placeholder="All Offices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Offices</SelectItem>
                  {offices.map((office) => (
                    <SelectItem key={office.office_id} value={office.office_id}>
                      {office.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reviews</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No reviews found
                  </h3>
                  <p className="text-muted-foreground">
                    No reviews match your current filters.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review.review_id}
                  review={review}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onFlag={handleFlag}
                  onAddResponse={handleAddResponse}
                  onToggleResponseForm={toggleResponseForm}
                  showResponseForm={showResponseForm}
                  responseText={responseText}
                  setResponseText={setResponseText}
                  submitting={submitting}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Other tab contents */}
        <TabsContent value="pending" className="space-y-4">
          {getFilteredReviewsByStatus("pending").length === 0 ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No pending reviews
                  </h3>
                  <p className="text-muted-foreground">
                    No pending reviews found.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {getFilteredReviewsByStatus("pending").map((review) => (
                <ReviewCard
                  key={review.review_id}
                  review={review}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onFlag={handleFlag}
                  onAddResponse={handleAddResponse}
                  onToggleResponseForm={toggleResponseForm}
                  showResponseForm={showResponseForm}
                  responseText={responseText}
                  setResponseText={setResponseText}
                  submitting={submitting}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          {getFilteredReviewsByStatus("flagged").length === 0 ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <Flag className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No flagged reviews
                  </h3>
                  <p className="text-muted-foreground">
                    No flagged reviews found.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {getFilteredReviewsByStatus("flagged").map((review) => (
                <ReviewCard
                  key={review.review_id}
                  review={review}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onFlag={handleFlag}
                  onAddResponse={handleAddResponse}
                  onToggleResponseForm={toggleResponseForm}
                  showResponseForm={showResponseForm}
                  responseText={responseText}
                  setResponseText={setResponseText}
                  submitting={submitting}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {getFilteredReviewsByStatus("approved").length === 0 ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <Check className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No approved reviews
                  </h3>
                  <p className="text-muted-foreground">
                    No approved reviews found.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {getFilteredReviewsByStatus("approved").map((review) => (
                <ReviewCard
                  key={review.review_id}
                  review={review}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onFlag={handleFlag}
                  onAddResponse={handleAddResponse}
                  onToggleResponseForm={toggleResponseForm}
                  showResponseForm={showResponseForm}
                  responseText={responseText}
                  setResponseText={setResponseText}
                  submitting={submitting}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
