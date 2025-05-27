"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  FileText,
  HelpCircle,
  Info,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchServiceGuideById } from "@/store/slices/serviceGuideSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/lib/translation-context";
import { downloadServiceGuidePDF } from "@/lib/pdf-generator";

interface ServiceDetailProps {
  guideId: string;
}

export function ServiceDetail({ guideId }: ServiceDetailProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    selectedGuide: guide,
    loading,
    error,
  } = useAppSelector((state) => state.serviceGuide);

  // Fetch service guide on component mount
  useEffect(() => {
    dispatch(fetchServiceGuideById(guideId));
  }, [dispatch, guideId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-destructive">
            <p>{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => dispatch(fetchServiceGuideById(guideId))}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!guide) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <p>{t("service_not_found")}</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/dashboard/services">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("back_to_services")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/services">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">{guide.title}</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{guide.title}</CardTitle>
                  <CardDescription className="pt-1">
                    {guide.description}
                  </CardDescription>
                </div>
                <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {guide.category}
                </div>
              </div>
            </CardHeader>
            <Separator />
            <Tabs defaultValue="guide">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="guide">
                  {t("step_by_step_guide")}
                </TabsTrigger>
                <TabsTrigger value="requirements">
                  {t("requirements")}
                </TabsTrigger>
                <TabsTrigger value="faqs">FAQs</TabsTrigger>
              </TabsList>
              <TabsContent value="guide" className="p-4 pt-6">
                <div className="space-y-6">
                  {guide.steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="requirements" className="p-4 pt-6">
                <div className="space-y-4">
                  <h3 className="font-medium">{t("required_documents")}</h3>
                  <ul className="space-y-2">
                    {guide.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="font-medium">{t("fees")}</h3>
                  <p className="text-sm text-muted-foreground">{guide.fees}</p>

                  <h3 className="font-medium">{t("processing_time")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {guide.estimated_time}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="faqs" className="p-4 pt-6">
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">
                      What happens if I don't have all the required documents?
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You may be asked to return with the complete set of
                      documents. In some cases, alternative documents may be
                      accepted at the discretion of the office.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">
                      Can someone else apply on my behalf?
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      In most cases, you need to apply in person. However, for
                      certain services, a representative with a power of
                      attorney may be allowed to apply on your behalf.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">
                      What if there are errors in my documents?
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You should report any errors to the issuing office as soon
                      as possible. Correction procedures vary by document type.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("quick_actions")}</CardTitle>
              <CardDescription>{t("tools_and_resources")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" asChild>
                <Link href={`/dashboard/offices`}>{t("find_offices")}</Link>
              </Button>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">{t("downloads")}</h4>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => downloadServiceGuidePDF(guide)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t("download_complete_guide_pdf")}
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() =>
                      downloadServiceGuidePDF(guide, {
                        includeSteps: true,
                        includeRequirements: false,
                        includeFees: false,
                        includeTime: false,
                      })
                    }
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {t("download_steps_only_pdf")}
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() =>
                      downloadServiceGuidePDF(guide, {
                        includeSteps: false,
                        includeRequirements: true,
                        includeFees: true,
                        includeTime: true,
                      })
                    }
                  >
                    <Info className="mr-2 h-4 w-4" />
                    {t("download_requirements_pdf")}
                  </Button>
                  {/* {guide.documents && guide.documents.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <p className="text-xs text-muted-foreground">
                        {t("additional_documents")}
                      </p>
                      {guide.documents.map((doc, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                          asChild
                        >
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="mr-2 h-3 w-3" />
                            {doc.name}
                          </a>
                        </Button>
                      ))}
                    </>
                  )} */}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  {t("related_information")}
                </h4>
                <div className="grid gap-2">
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/dashboard/services">
                      <FileText className="mr-2 h-4 w-4" />
                      {t("all_services")}
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/dashboard/offices">
                      <Info className="mr-2 h-4 w-4" />
                      {t("office_information")}
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/dashboard/help">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      {t("help_and_support")}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
