"use client";

import { FlaggedReviews } from "@/components/dashboard/admin/flagged-reviews";
import { useTranslation } from "@/lib/translation-context";

export default function FlaggedReviewsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gradient">
            {t("flagged_reviews")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("flagged_reviews_description")}
          </p>
        </div>
      </div>
      <div className="grid gap-8">
        <FlaggedReviews />
      </div>
    </div>
  );
}
