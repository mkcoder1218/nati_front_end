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

export interface CreateReplyData {
  content: string;
}

export interface UpdateReplyData {
  content: string;
}

const ReviewReplyService = {
  // Create a new reply to a review
  createReply: async (reviewId: string, data: CreateReplyData): Promise<ReviewReply> => {
    const response = await api.post(`/review-replies/review/${reviewId}`, data);
    return response.data.data.reply;
  },

  // Get all replies for a specific review
  getRepliesByReview: async (reviewId: string): Promise<ReviewReply[]> => {
    const response = await api.get(`/review-replies/review/${reviewId}`);
    return response.data.data.replies;
  },

  // Get all replies by a specific user
  getRepliesByUser: async (userId: string): Promise<ReviewReply[]> => {
    const response = await api.get(`/review-replies/user/${userId}`);
    return response.data.data.replies;
  },

  // Get a specific reply by ID
  getReplyById: async (replyId: string): Promise<ReviewReply> => {
    const response = await api.get(`/review-replies/${replyId}`);
    return response.data.data.reply;
  },

  // Update a reply
  updateReply: async (replyId: string, data: UpdateReplyData): Promise<ReviewReply> => {
    const response = await api.put(`/review-replies/${replyId}`, data);
    return response.data.data.reply;
  },

  // Delete a reply
  deleteReply: async (replyId: string): Promise<void> => {
    await api.delete(`/review-replies/${replyId}`);
  },

  // Get all replies (admin/official only)
  getAllReplies: async (): Promise<ReviewReply[]> => {
    const response = await api.get("/review-replies");
    return response.data.data.replies;
  },
};

export default ReviewReplyService;
