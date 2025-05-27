"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  Edit, 
  FileText, 
  Trash2 
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchServiceGuideById, deleteServiceGuide } from "@/store/slices/serviceGuideSlice";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/translation-context";

interface ServiceDetailPageProps {
  params: {
    id: string;
  };
}

export default function AdminServiceDetailPage({ params }: ServiceDetailPageProps) {
  const guideId = params.id;
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  const { selectedGuide: guide, loading, error } = useAppSelector(
    (state) => state.serviceGuide
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (guideId) {
      dispatch(fetchServiceGuideById(guideId));
    }
  }, [dispatch, guideId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteServiceGuide(guideId)).unwrap();
      toast({
        title: "Service guide deleted",
        description: "The service guide has been successfully deleted.",
      });
      router.push("/admin/services");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the service guide. Please try again.",
        variant: "destructive",
      });
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">
              {t("error_loading_service")}
            </h2>
            <p className="text-muted-foreground mb-6">{error || t("service_not_found")}</p>
            <Button asChild>
              <Link href="/admin/services">{t("back_to_services")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedDate = new Date(guide.created_at).toLocaleDateString();
  const formattedUpdateDate = new Date(guide.updated_at).toLocaleDateString();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/services">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{guide.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/services/${guideId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              {t("edit")}
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="text-destructive hover:text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("delete")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{guide.title}</CardTitle>
                  <CardDescription className="pt-1">{guide.description}</CardDescription>
                </div>
                <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {guide.category}
                </div>
              </div>
            </CardHeader>
            <Separator />
            <Tabs defaultValue="guide">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="guide">{t("step_by_step_guide")}</TabsTrigger>
                <TabsTrigger value="requirements">{t("requirements")}</TabsTrigger>
              </TabsList>
              <TabsContent value="guide" className="p-4 pt-6">
                <div className="space-y-6">
                  {guide.steps && guide.steps.length > 0 ? (
                    guide.steps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {index + 1}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">{t("no_steps_defined")}</p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="requirements" className="p-4 pt-6">
                <div className="space-y-4">
                  <h3 className="font-medium">{t("required_documents")}</h3>
                  {guide.requirements && guide.requirements.length > 0 ? (
                    <ul className="space-y-2">
                      {guide.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">{t("no_requirements_defined")}</p>
                  )}

                  {guide.documents && guide.documents.length > 0 && (
                    <>
                      <h3 className="font-medium mt-6">{t("downloadable_documents")}</h3>
                      <ul className="space-y-2">
                        {guide.documents.map((doc, index) => (
                          <li key={index}>
                            <Button variant="link" className="h-auto p-0" asChild>
                              <Link href={doc.url} target="_blank">
                                <FileText className="mr-2 h-4 w-4" />
                                {doc.name}
                              </Link>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("service_details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("office")}</p>
                  <p className="text-sm text-muted-foreground">{guide.office_name || t("not_specified")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("estimated_time")}</p>
                  <p className="text-sm text-muted-foreground">{guide.estimated_time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("fees")}</p>
                  <p className="text-sm text-muted-foreground">{guide.fees}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("metadata")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("created_at")}</p>
                  <p className="text-sm text-muted-foreground">{formattedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("last_updated")}</p>
                  <p className="text-sm text-muted-foreground">{formattedUpdateDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("guide_id")}</p>
                  <p className="text-sm text-muted-foreground">{guide.guide_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_service_guide")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_service_guide_confirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
