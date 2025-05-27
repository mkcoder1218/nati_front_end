import api from "@/lib/api";

export interface ReviewReply {
  reply_id: string;
  review_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_role?: string;
}

export interface Review {
  review_id: string;
  user_id: string;
  office_id: string;
  rating: number;
  comment: string;
  content?: string; // For backward compatibility
  status: "pending" | "approved" | "rejected" | "flagged" | "removed";
  created_at: string;
  updated_at: string;
  user_name?: string;
  office_name?: string;
  replies?: ReviewReply[];
  // Vote counts from backend
  upvote_count?: number;
  downvote_count?: number;
  flag_count?: number;
  // Legacy vote counts structure
  vote_counts?: {
    helpful: number;
    not_helpful: number;
    flag: number;
  };
}

export interface CreateReviewData {
  office_id: string;
  rating: number;
  comment: string;
  is_anonymous?: boolean;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export interface UpdateReviewStatusData {
  status: "pending" | "approved" | "rejected" | "flagged" | "resolved";
}

const ReviewService = {
  // Get all reviews (admin/official only)
  getAllReviews: async (params?: {
    limit?: number;
    offset?: number;
    status?: string;
    includeReplies?: boolean;
  }): Promise<{ reviews: Review[]; count: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.includeReplies) queryParams.append("includeReplies", "true");

    const response = await api.get(`/reviews?${queryParams.toString()}`);
    return response.data.data;
  },

  // Get public approved reviews for browsing
  getPublicReviews: async (params?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ reviews: Review[]; count: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await api.get(
      `/reviews/public/browse?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Get reviews by office
  getReviewsByOffice: async (
    officeId: string,
    includeReplies: boolean = true
  ): Promise<Review[]> => {
    const params = includeReplies ? "?includeReplies=true" : "";
    const response = await api.get(`/reviews/office/${officeId}${params}`);
    return response.data.data.reviews;
  },

  // Get reviews by user
  getReviewsByUser: async (
    userId: string,
    includeReplies: boolean = true
  ): Promise<Review[]> => {
    const params = includeReplies ? "?includeReplies=true" : "";
    const response = await api.get(`/reviews/user/${userId}${params}`);
    return response.data.data.reviews;
  },

  // Get review by ID
  getReviewById: async (reviewId: string): Promise<Review> => {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data.data.review;
  },

  // Create a new review
  createReview: async (data: CreateReviewData): Promise<Review> => {
    const response = await api.post("/reviews", data);
    return response.data.data.review;
  },

  // Update review
  updateReview: async (
    reviewId: string,
    data: UpdateReviewData
  ): Promise<Review> => {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data.data.review;
  },

  // Update review status (admin/official only)
  updateReviewStatus: async (
    reviewId: string,
    status: string
  ): Promise<Review> => {
    const response = await api.patch(`/reviews/${reviewId}/status`, { status });
    return response.data.data.review;
  },

  // Delete review
  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/reviews/${reviewId}`);
  },

  // Flag a review (admin only)
  flagReview: async (reviewId: string, reason?: string): Promise<Review> => {
    const response = await api.patch(`/reviews/${reviewId}/flag`, { reason });
    return response.data.data.review;
  },

  // Add admin response to review (admin only)
  addAdminResponse: async (
    reviewId: string,
    content: string
  ): Promise<ReviewReply> => {
    const response = await api.post(`/reviews/${reviewId}/response`, {
      content,
    });
    return response.data.data.reply;
  },
};

export default ReviewService;
