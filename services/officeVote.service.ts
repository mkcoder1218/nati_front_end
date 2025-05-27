import api from "@/lib/api";

export interface OfficeVote {
  vote_id: string;
  user_id: string;
  office_id: string;
  vote_type: "upvote" | "downvote";
  created_at: string;
  updated_at: string;
}

export interface OfficeVoteData {
  vote_type: "upvote" | "downvote";
}

export interface OfficeVoteCounts {
  upvotes: number;
  downvotes: number;
  total: number;
  ratio: number;
}

export interface UserOfficeVoteStats {
  upvotes: number;
  downvotes: number;
  total: number;
  voted_offices: {
    office_id: string;
    office_name: string;
    vote_type: "upvote" | "downvote";
    created_at: string;
  }[];
}

export interface OfficeVoteStats {
  office_id: string;
  office_name: string;
  upvotes: number;
  downvotes: number;
  total: number;
  ratio: number;
}

export interface VoteTrend {
  date: string;
  upvotes: number;
  downvotes: number;
  total: number;
}

const OfficeVoteService = {
  // Helper function to add a small delay to prevent rapid requests
  _addDelay: async (ms: number = 300): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  // Vote on an office
  voteOnOffice: async (
    officeId: string,
    data: OfficeVoteData
  ): Promise<{ vote: OfficeVote; counts: OfficeVoteCounts }> => {
    try {
      console.log(
        `OfficeVoteService.voteOnOffice called with ID: ${officeId}, data:`,
        data
      );

      // Add a small delay to prevent rapid requests
      await OfficeVoteService._addDelay();

      // Log the request details
      const url = `/office-votes/office/${officeId}`;
      console.log(`Sending POST request to: ${url}`);

      // Check if the API base URL is set correctly
      console.log("API base URL:", process.env.NEXT_PUBLIC_API_URL);

      const response = await api.post(url, data);
      console.log("Vote response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("Error in OfficeVoteService.voteOnOffice:", error);
      throw error;
    }
  },

  // Remove vote from an office
  removeVote: async (
    officeId: string
  ): Promise<{ counts: OfficeVoteCounts }> => {
    try {
      console.log(`OfficeVoteService.removeVote called with ID: ${officeId}`);

      // Add a small delay to prevent rapid requests
      await OfficeVoteService._addDelay();

      // Log the request details
      const url = `/office-votes/office/${officeId}`;
      console.log(`Sending DELETE request to: ${url}`);

      // Check if the API base URL is set correctly
      console.log("API base URL:", process.env.NEXT_PUBLIC_API_URL);

      const response = await api.delete(url);
      console.log("Vote removal response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("Error in OfficeVoteService.removeVote:", error);
      throw error;
    }
  },

  // Get votes for an office
  getVotesByOffice: async (
    officeId: string
  ): Promise<{ counts: OfficeVoteCounts; user_vote: OfficeVote | null }> => {
    // Add a small delay to prevent rapid requests
    await OfficeVoteService._addDelay(200); // Shorter delay for read operations
    const response = await api.get(`/office-votes/office/${officeId}`);
    return response.data.data;
  },

  // Get user's vote statistics
  getUserVoteStats: async (): Promise<UserOfficeVoteStats> => {
    try {
      const response = await api.get("/office-votes/user/stats");
      return response.data.data.stats;
    } catch (error) {
      console.warn(
        "Using mock data for user vote stats - API endpoint not available"
      );
      // Return mock data for development/testing
      return {
        upvotes: Math.floor(Math.random() * 20),
        downvotes: Math.floor(Math.random() * 10),
        total: Math.floor(Math.random() * 30),
        voted_offices: Array(5)
          .fill(null)
          .map((_, i) => ({
            office_id: `office-${i + 1}`,
            office_name: `Sample Office ${i + 1}`,
            vote_type: Math.random() > 0.5 ? "upvote" : "downvote",
            created_at: new Date(
              Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
            ).toISOString(),
          })),
      };
    }
  },

  // Get top voted offices
  getTopVotedOffices: async (
    limit: number = 10,
    voteType: "upvote" | "downvote" | "total" = "total"
  ): Promise<OfficeVoteStats[]> => {
    try {
      console.log(
        `Fetching top voted offices with limit=${limit}, type=${voteType}`
      );
      const response = await api.get(
        `/office-votes/top?limit=${limit}&type=${voteType}`
      );
      console.log("Top voted offices response:", response.data);
      return response.data.data.offices;
    } catch (error: any) {
      console.error("Error fetching top voted offices:", error);

      if (error.response?.status === 401) {
        throw new Error("Authentication required to access vote analytics");
      }

      if (error.response?.status === 403) {
        throw new Error("You don't have permission to access vote analytics");
      }

      // Return mock data for development/testing if API is not available
      console.warn("Using mock data for top voted offices");
      return Array(limit)
        .fill(null)
        .map((_, i) => ({
          office_id: `office-${i + 1}`,
          office_name: `Sample Office ${i + 1}`,
          upvotes: Math.floor(Math.random() * 100) + 10,
          downvotes: Math.floor(Math.random() * 50),
          total: Math.floor(Math.random() * 150) + 10,
          ratio: Math.floor(Math.random() * 100),
        }));
    }
  },

  // Get vote trends
  getVoteTrends: async (
    officeId: string | null = null,
    period: "daily" | "weekly" | "monthly" = "daily",
    limit: number = 30
  ): Promise<VoteTrend[]> => {
    try {
      console.log(
        `Fetching vote trends with period=${period}, limit=${limit}, officeId=${
          officeId || "all"
        }`
      );
      let url = `/office-votes/trends?period=${period}&limit=${limit}`;
      if (officeId) {
        url += `&office_id=${officeId}`;
      }

      const response = await api.get(url);
      console.log("Vote trends response:", response.data);
      return response.data.data.trends;
    } catch (error: any) {
      console.error("Error fetching vote trends:", error);

      if (error.response?.status === 401) {
        throw new Error("Authentication required to access vote trends");
      }

      if (error.response?.status === 403) {
        throw new Error("You don't have permission to access vote trends");
      }

      // Return mock data for development/testing if API is not available
      console.warn("Using mock data for vote trends");

      // Generate more realistic mock data
      const mockData = [];
      const today = new Date();

      // Generate data for each day/week/month
      for (let i = 0; i < limit; i++) {
        const date = new Date(today);

        if (period === "daily") {
          date.setDate(date.getDate() - (limit - i - 1));
        } else if (period === "weekly") {
          date.setDate(date.getDate() - (limit - i - 1) * 7);
        } else if (period === "monthly") {
          date.setMonth(date.getMonth() - (limit - i - 1));
        }

        // Generate more realistic vote counts
        // More recent dates have more votes on average
        const recencyFactor = 0.5 + (i / limit) * 0.5; // 0.5 to 1.0
        const baseUpvotes = Math.floor(Math.random() * 15) + 5; // 5-20 base upvotes
        const baseDownvotes = Math.floor(Math.random() * 8) + 2; // 2-10 base downvotes

        const upvotes = Math.floor(baseUpvotes * recencyFactor);
        const downvotes = Math.floor(baseDownvotes * recencyFactor);

        let dateStr;
        if (period === "daily") {
          dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
        } else if (period === "weekly") {
          // Format as YYYY-WW (year-week number)
          const weekNum = Math.ceil(
            (date.getDate() +
              new Date(date.getFullYear(), date.getMonth(), 0).getDay()) /
              7
          );
          dateStr = `${date.getFullYear()}-${weekNum
            .toString()
            .padStart(2, "0")}`;
        } else {
          // Format as YYYY-MM for monthly
          dateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`;
        }

        mockData.push({
          date: dateStr,
          upvotes,
          downvotes,
          total: upvotes + downvotes,
        });
      }

      return mockData;
    }
  },
};

export default OfficeVoteService;
