"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OfficeDetail } from "@/components/dashboard/office-detail";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  fetchAllOffices,
  fetchOfficeById,
  clearSelectedOffice,
} from "@/store/slices/officeSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OfficePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    offices,
    selectedOffice,
    loading,
    error: officeError,
  } = useAppSelector((state) => state.office);
  const [officeId, setOfficeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Use a ref to track if we've already fetched the office
  const hasFetchedRef = React.useRef(false);

  // Immediately set the office ID when the component mounts
  useEffect(() => {
    setOfficeId(resolvedParams.id);
  }, [resolvedParams.id]);

  // Handle the data fetching
  useEffect(() => {
    if (!officeId) return;

    console.log("Office page data fetching for ID:", officeId);

    // Always fetch the office data when the component mounts
    const fetchData = async () => {
      try {
        console.log("Fetching office data");
        await dispatch(fetchOfficeById(officeId)).unwrap();
        console.log("Office data fetched successfully");
      } catch (err) {
        console.error("Error fetching office data:", err);
        setError("Failed to fetch office data");
      } finally {
        setInitialLoadDone(true);
      }
    };

    fetchData();

    // Cleanup function to handle component unmount
    return () => {
      console.log("Office page unmounting, clearing selected office");
      dispatch(clearSelectedOffice());
    };
  }, [dispatch, officeId]);

  // Show loading spinner while initial data is being fetched
  if (loading || (!initialLoadDone && !selectedOffice)) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error if there's an API error
  if (officeError || error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>{officeError || error}</p>
            <Button
              variant="outline"
              className="mt-4 mr-2"
              onClick={() => {
                if (officeId) {
                  dispatch(fetchOfficeById(officeId));
                }
              }}
            >
              Retry
            </Button>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/dashboard/offices">Back to Offices</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If we have an office ID but no selected office after loading is done, show not found
  if (!selectedOffice && initialLoadDone) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>Office not found</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/dashboard/offices">Back to Offices</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If we have an office ID, render the office detail component
  if (officeId) {
    return <OfficeDetail officeId={officeId} />;
  }

  // Fallback loading state
  return (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
