import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log the request details for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
      params: config.params,
    });

    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses for debugging
    console.log(
      `API Response (${
        response.status
      }): ${response.config.method?.toUpperCase()} ${response.config.url}`,
      {
        data: response.data,
        headers: response.headers,
      }
    );
    return response;
  },
  (error: AxiosError) => {
    // Don't log 404 errors for government dashboard endpoints during development
    // This is a temporary solution until the backend endpoints are implemented
    const isGovernmentEndpoint = error.config?.url?.includes("/government/");
    const isDevelopment = process.env.NODE_ENV === "development";

    if (
      isGovernmentEndpoint &&
      isDevelopment &&
      error.response?.status === 404
    ) {
      console.warn(
        `Development mode: API endpoint not available: ${error.config?.url}`
      );
    } else {
      console.error("API Error:", {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        headers: error.config?.headers,
      });

      // Log the full error object for more details
      console.error("Full error object:", error);

      // Log the error message
      console.error("Error message:", error.message);

      // Check if it's a network error
      if (error.message.includes("Network Error")) {
        console.error(
          "Network error detected. Check if the backend server is running."
        );
      }
    }

    // Handle unauthorized errors (401)
    if (error.response?.status === 401) {
      console.log("Unauthorized request detected");

      // Clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to login page if not already there
        if (window.location.pathname !== "/sign-in") {
          console.log("Redirecting to sign-in page");
          window.location.href = "/sign-in";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
