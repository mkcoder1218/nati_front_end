"use client";

import { FlaggedReviews } from "@/components/dashboard/admin/flagged-reviews";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useTranslation } from "@/lib/translation-context";

export default function FlaggedReviewsPage() {
  const { t } = useTranslation();

  return (
    <DashboardShell>
      <DashboardHeader
        heading={t("flagged_reviews")}
        description={t("flagged_reviews_description")}
      />
      <div className="grid gap-8">
        <FlaggedReviews />
      </div>
    </DashboardShell>
  );
}
