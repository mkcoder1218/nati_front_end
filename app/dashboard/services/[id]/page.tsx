"use client";

import React from "react";
import { ServiceDetail } from "@/components/dashboard/service-detail";

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  return <ServiceDetail guideId={resolvedParams.id} />;
}
