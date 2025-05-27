"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAppDispatch } from "@/hooks/use-redux";
import { createOffice } from "@/store/slices/officeSlice";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/translation-context";
import { toast } from "sonner";
import { OfficeForm } from "@/components/admin/office-form";
import { CreateOfficeData } from "@/services/office.service";

export default function AddOfficePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: CreateOfficeData) => {
    setIsSubmitting(true);

    try {
      const result = await dispatch(createOffice(formData)).unwrap();
      toast.success(t("office_created_successfully"));
      router.push(`/admin/offices/${result.office_id}`);
    } catch (error) {
      console.error("Failed to create office:", error);
      toast.error(t("failed_to_create_office"));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/offices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
          {t("add_new_office")}
        </h2>
      </div>

      <OfficeForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
