import api from "@/lib/api";

// Backend service guide interface
interface BackendServiceGuide {
  guide_id: string;
  office_id: string;
  title: string;
  content: string;
  language: "amharic" | "english";
  created_at: string;
  updated_at: string;
}

// Frontend service guide interface
export interface ServiceGuide {
  guide_id: string;
  office_id: string;
  title: string;
  description: string;
  requirements: string[];
  steps: {
    title: string;
    description: string;
  }[];
  estimated_time: string;
  fees: string;
  documents: {
    name: string;
    url: string;
  }[];
  category: string;
  created_at: string;
  updated_at: string;
  office_name?: string;
}

export interface CreateServiceGuideData {
  office_id: string;
  title: string;
  description: string;
  requirements: string[];
  steps: {
    title: string;
    description: string;
  }[];
  estimated_time: string;
  fees: string;
  documents?: {
    name: string;
    url: string;
  }[];
  category: string;
}

export interface UpdateServiceGuideData {
  office_id?: string;
  title?: string;
  description?: string;
  requirements?: string[];
  steps?: {
    title: string;
    description: string;
  }[];
  estimated_time?: string;
  fees?: string;
  documents?: {
    name: string;
    url: string;
  }[];
  category?: string;
}

// Adapter function to transform backend data to frontend format
const adaptServiceGuide = (backendGuide: BackendServiceGuide): ServiceGuide => {
  try {
    // Try to parse the content as JSON to extract structured data
    let parsedContent: any = {};
    try {
      parsedContent = JSON.parse(backendGuide.content);
    } catch (e) {
      // If parsing fails, use default values
      console.warn(
        `Failed to parse content for guide ${backendGuide.guide_id}`,
        e
      );
    }

    return {
      guide_id: backendGuide.guide_id,
      office_id: backendGuide.office_id,
      title: backendGuide.title,
      description: parsedContent.description || backendGuide.title,
      requirements: parsedContent.requirements || [],
      steps: parsedContent.steps || [],
      estimated_time: parsedContent.estimated_time || "Not specified",
      fees: parsedContent.fees || "Not specified",
      documents: parsedContent.documents || [],
      category: parsedContent.category || "General",
      created_at: backendGuide.created_at,
      updated_at: backendGuide.updated_at,
      office_name: parsedContent.office_name,
    };
  } catch (error) {
    console.error("Error adapting service guide:", error);
    // Return a default guide with minimal data to prevent UI errors
    return {
      guide_id: backendGuide.guide_id,
      office_id: backendGuide.office_id,
      title: backendGuide.title,
      description: "No description available",
      requirements: [],
      steps: [],
      estimated_time: "Not specified",
      fees: "Not specified",
      documents: [],
      category: "General",
      created_at: backendGuide.created_at,
      updated_at: backendGuide.updated_at,
    };
  }
};

const ServiceGuideService = {
  // Get all service guides
  getAllServiceGuides: async (): Promise<ServiceGuide[]> => {
    try {
      const response = await api.get("/service-guides");
      const backendGuides = response.data.data.guides || [];
      return backendGuides.map(adaptServiceGuide);
    } catch (error) {
      console.error("Error fetching service guides:", error);
      return [];
    }
  },

  // Search service guides
  searchServiceGuides: async (query: string): Promise<ServiceGuide[]> => {
    try {
      const response = await api.get(`/service-guides/search?query=${query}`);
      const backendGuides = response.data.data.guides || [];
      return backendGuides.map(adaptServiceGuide);
    } catch (error) {
      console.error("Error searching service guides:", error);
      return [];
    }
  },

  // Get service guides by office
  getServiceGuidesByOffice: async (
    officeId: string
  ): Promise<ServiceGuide[]> => {
    try {
      const response = await api.get(`/service-guides/office/${officeId}`);
      const backendGuides = response.data.data.guides || [];
      return backendGuides.map(adaptServiceGuide);
    } catch (error) {
      console.error(
        `Error fetching service guides for office ${officeId}:`,
        error
      );
      return [];
    }
  },

  // Get service guide by ID
  getServiceGuideById: async (guideId: string): Promise<ServiceGuide> => {
    try {
      const response = await api.get(`/service-guides/${guideId}`);
      return adaptServiceGuide(response.data.data.guide);
    } catch (error) {
      console.error(`Error fetching service guide ${guideId}:`, error);
      // Return a default guide with minimal data to prevent UI errors
      return {
        guide_id: guideId,
        office_id: "",
        title: "Service Guide Not Found",
        description: "The requested service guide could not be loaded.",
        requirements: [],
        steps: [],
        estimated_time: "Not available",
        fees: "Not available",
        documents: [],
        category: "Unknown",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  },

  // Create a new service guide (admin/official only)
  createServiceGuide: async (
    data: CreateServiceGuideData
  ): Promise<ServiceGuide> => {
    try {
      // Convert frontend data to backend format
      const backendData = {
        office_id: data.office_id,
        title: data.title,
        // Store structured data as JSON in content field
        content: JSON.stringify({
          description: data.description,
          requirements: data.requirements,
          steps: data.steps,
          estimated_time: data.estimated_time,
          fees: data.fees,
          documents: data.documents || [],
          category: data.category,
        }),
        language: "english", // Default to English
      };

      const response = await api.post("/service-guides", backendData);
      return adaptServiceGuide(response.data.data.guide);
    } catch (error) {
      console.error("Error creating service guide:", error);
      throw error;
    }
  },

  // Update service guide (admin/official only)
  updateServiceGuide: async (
    guideId: string,
    data: UpdateServiceGuideData
  ): Promise<ServiceGuide> => {
    try {
      // First get the existing guide to merge with updates
      const response = await api.get(`/service-guides/${guideId}`);
      const currentGuide = adaptServiceGuide(response.data.data.guide);

      // Prepare the content object with merged data
      const contentObj = {
        description: data.description || currentGuide.description,
        requirements: data.requirements || currentGuide.requirements,
        steps: data.steps || currentGuide.steps,
        estimated_time: data.estimated_time || currentGuide.estimated_time,
        fees: data.fees || currentGuide.fees,
        documents: data.documents || currentGuide.documents,
        category: data.category || currentGuide.category,
      };

      // Convert to backend format
      const backendData = {
        office_id: data.office_id,
        title: data.title,
        content: JSON.stringify(contentObj),
        language: "english", // Default to English
      };

      const response2 = await api.put(
        `/service-guides/${guideId}`,
        backendData
      );
      return adaptServiceGuide(response2?.data?.data?.guide);
    } catch (error) {
      console.error(`Error updating service guide ${guideId}:`, error);
      throw error;
    }
  },

  // Delete service guide (admin/official only)
  deleteServiceGuide: async (guideId: string): Promise<void> => {
    await api.delete(`/service-guides/${guideId}`);
  },
};

export default ServiceGuideService;
