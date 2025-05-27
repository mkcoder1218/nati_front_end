"use client";

import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

/**
 * Hook for hydration-safe date formatting
 * Prevents server-client mismatch by only formatting dates on the client side
 */
export function useHydratedDate(dateString: string): string {
  const [formattedDate, setFormattedDate] = useState<string>(dateString);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        const formatted = formatDistanceToNow(new Date(dateString), { 
          addSuffix: true 
        });
        setFormattedDate(formatted);
      } catch (error) {
        console.error("Error formatting date:", error);
        setFormattedDate(dateString);
      }
    }
  }, [dateString, isHydrated]);

  return formattedDate;
}

/**
 * Safe date formatter that returns the original string during SSR
 * and formatted date on the client
 */
export function formatDateSafe(dateString: string): string {
  if (typeof window === "undefined") {
    // During SSR, return the original date string
    return dateString;
  }

  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

/**
 * Component wrapper for hydration-safe date display
 */
export function HydratedDate({ 
  dateString, 
  className 
}: { 
  dateString: string; 
  className?: string; 
}) {
  const formattedDate = useHydratedDate(dateString);
  
  return <span className={className || ""}>{formattedDate}</span>;
}
