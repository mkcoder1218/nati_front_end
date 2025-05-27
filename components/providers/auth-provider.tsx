"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { getProfile, hydrateAuth } from "@/store/slices/authSlice";

// Define routes that don't require authentication
const publicRoutes = ["/", "/sign-in", "/sign-up", "/forgot-password"];

// Define role-based route access
const roleBasedRoutes: Record<string, string[]> = {
  citizen: ["/dashboard"],
  official: ["/government"],
  admin: ["/admin"],
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, loading } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Hydrate auth state from localStorage on client side
    dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    // Only verify token with backend if we have a token but need to validate it
    const verifyToken = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");

        // If we have a token but are on a protected route and don't have user data,
        // verify the token with the backend
        if (token && !publicRoutes.includes(pathname) && !user) {
          try {
            await dispatch(getProfile()).unwrap();
          } catch (error) {
            // If token verification fails, clear localStorage and auth state
            console.error("Token verification failed:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            dispatch(hydrateAuth()); // Re-hydrate to clear state
          }
        }
      }
    };

    // Only run verification if we have been hydrated (isAuthenticated state is set)
    if (
      isAuthenticated ||
      (!isAuthenticated && typeof window !== "undefined")
    ) {
      verifyToken();
    }
  }, [dispatch, pathname, user, isAuthenticated]);

  useEffect(() => {
    // Skip route protection during loading
    if (loading) return;

    // Allow access to public routes
    if (publicRoutes.includes(pathname)) return;

    // If not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    // Check role-based access
    if (user) {
      const { role } = user;

      // Check if user is trying to access a route restricted to a specific role
      const isAdminRoute = pathname.startsWith("/admin");
      const isGovernmentRoute = pathname.startsWith("/government");
      const isDashboardRoute = pathname.startsWith("/dashboard");

      if (isAdminRoute && role !== "admin") {
        router.push("/dashboard");
      } else if (isGovernmentRoute && role !== "official" && role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, pathname, router, loading]);

  return <>{children}</>;
}
