import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { toast } from "sonner";

// Configure base URL from .env, default to a fallback if not provided
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create reusable API instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Crucial for sending/receiving secure HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // 10 second timeout for production reliability
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  async (error: AxiosError) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    const originalRequest = error.config;

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      // Handle 401 Unauthorized (e.g. Session expired or Not logged in)
      if (status === 401) {
        // We only show a toast. Redirection is handled in AuthContext based on the route.
        if (
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/dashboard")
        ) {
          toast.error("Session expired. Please log in again.");
        }
      }

      // Handle 403 Forbidden (e.g. Invalid role)
      else if (status === 403) {
        toast.error(
          data?.message || "You don't have permission to perform this action.",
        );
      }

      // Handle 404 Not Found
      else if (status === 404) {
        console.warn(`API Route not found: ${originalRequest?.url}`);
      }

      // Handle 429 Too Many Requests (Rate Limiting)
      else if (status === 429) {
        toast.error("Too many requests. Please try again later.");
      }

      // Handle 500+ Server Errors
      else if (status >= 500) {
        toast.error(
          "An internal server error occurred. Our team has been notified.",
        );
        console.error("Server Error:", error.response);
      }
    } else if (error.request) {
      // The request was made but no response was received (e.g. Network error)
      toast.error("Network error. Please check your internet connection.");
      console.error("Network Error:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error Message:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
