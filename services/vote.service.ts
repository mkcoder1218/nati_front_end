import api from "@/lib/api";

export interface Vote {
  vote_id: string;
  user_id: string;
  review_id: string;
  vote_type: "helpful" | "not_helpful" | "flag";
  created_at: string;
}

export interface VoteData {
  vote_type: "helpful" | "not_helpful" | "flag";
}

export interface VoteCounts {
  helpful: number;
  not_helpful: number;
  flag: number;
}

export interface FlaggedReview {
  review_id: string;
  content: string;
  flag_count: number;
  user_name: string;
  office_name: string;
  created_at: string;
}

export interface UserVoteStats {
  upvotes: number;
  downvotes: number;
  flags: number;
}

export interface VoteStatistics {
  total_helpful: number;
  total_not_helpful: number;
  total_flags: number;
  most_voted_reviews: {
    review_id: string;
    content: string;
    helpful_count: number;
    not_helpful_count: number;
    total_votes: number;
  }[];
}

const VoteService = {
  // Vote on a review
  voteOnReview: async (reviewId: string, data: VoteData): Promise<Vote> => {
    const response = await api.post(`/votes/review/${reviewId}`, data);
    return response.data.data.vote;
  },

  // Remove vote from a review
  removeVote: async (reviewId: string): Promise<void> => {
    await api.delete(`/votes/review/${reviewId}`);
  },

  // Get votes for a review
  getVotesByReview: async (reviewId: string): Promise<VoteCounts> => {
    const response = await api.get(`/votes/review/${reviewId}`);
    return response.data.data.votes;
  },

  // Get flagged reviews (admin/official only)
  getFlaggedReviews: async (): Promise<FlaggedReview[]> => {
    const response = await api.get("/votes/flagged");
    return response.data.data.reviews;
  },

  // Get user vote statistics
  getUserVoteStats: async (): Promise<UserVoteStats> => {
    const response = await api.get("/votes/user/stats");
    return response.data.data.stats;
  },

  // Get overall vote statistics (admin/official only)
  getVoteStatistics: async (): Promise<VoteStatistics> => {
    const response = await api.get("/votes/statistics");
    return response.data.data.statistics;
  },
};

export default VoteService;
