"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchOfficeById, updateOffice } from "@/store/slices/officeSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/lib/translation-context";
import { toast } from "sonner";
import { OfficeForm } from "@/components/admin/office-form";
import { UpdateOfficeData } from "@/services/office.service";

export default function EditOfficePage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const officeId = params.id as string;

  const {
    selectedOffice: office,
    loading,
    error,
  } = useAppSelector((state) => state.office);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch office data on component mount
  useEffect(() => {
    if (officeId) {
      console.log("Fetching office data for ID:", officeId);
      dispatch(fetchOfficeById(officeId));
    }
  }, [dispatch, officeId]);

  // Debug office data when it changes
  useEffect(() => {
    if (office) {
      console.log("Office data received:", office);
      console.log("Assigned official ID:", office.assigned_official_id);
      console.log("Assigned official name:", office.assigned_official_name);
    }
  }, [office]);

  const handleSubmit = async (formData: UpdateOfficeData) => {
    setIsSubmitting(true);

    try {
      console.log("Updating office with data:", formData);
      await dispatch(updateOffice({ officeId, data: formData })).unwrap();
      toast.success(t("office_updated_successfully"));
      router.push(`/admin/offices/${officeId}`);
    } catch (error) {
      console.error("Failed to update office:", error);
      toast.error(t("failed_to_update_office"));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/offices/${officeId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
          {office
            ? t("edit_office_title", { name: office.name })
            : t("edit_office")}
        </h2>
      </div>

      {loading && !office ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => dispatch(fetchOfficeById(officeId))}
            >
              {t("retry")}
            </Button>
          </CardContent>
        </Card>
      ) : office ? (
        <OfficeForm
          initialData={office}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEditing={true}
        />
      ) : null}
    </div>
  );
}
