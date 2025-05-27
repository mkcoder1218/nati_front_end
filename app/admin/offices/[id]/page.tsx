"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Clock,
  Edit,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Trash2,
  Users,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchOfficeById, deleteOffice } from "@/store/slices/officeSlice";
import { fetchServiceGuidesByOffice } from "@/store/slices/serviceGuideSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useTranslation } from "@/lib/translation-context";
import { toast } from "sonner";

// Helper function to validate UUID format
const isValidUUID = (str: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export default function AdminOfficeDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const officeId = params.id as string;

  const {
    selectedOffice: office,
    loading: officeLoading,
    error: officeError,
  } = useAppSelector((state) => state.office);
  const {
    guides,
    loading: guidesLoading,
    error: guidesError,
  } = useAppSelector((state) => state.serviceGuide);

  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch office data on component mount
  useEffect(() => {
    if (officeId && isValidUUID(officeId)) {
      dispatch(fetchOfficeById(officeId));
      dispatch(fetchServiceGuidesByOffice(officeId));
    } else if (officeId && !isValidUUID(officeId)) {
      // If the officeId is not a valid UUID (like "new"), redirect to offices page
      console.error("Invalid office ID format:", officeId);
      router.push("/admin/offices");
    }
  }, [dispatch, officeId, router]);

  const loading = officeLoading || guidesLoading;
  const error = officeError || guidesError;

  // Handle office deletion
  const handleDeleteOffice = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteOffice(officeId)).unwrap();
      toast.success(t("office_deleted_successfully"));
      router.push("/admin/offices");
    } catch (error) {
      console.error("Failed to delete office:", error);
      toast.error(t("failed_to_delete_office"));
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Get office type display name
  const getOfficeTypeDisplay = (type: string) => {
    switch (type) {
      case "kebele":
        return t("kebele_office");
      case "woreda":
        return t("woreda_office");
      case "municipal":
        return t("municipal_office");
      case "regional":
        return t("regional_office");
      case "federal":
        return t("federal_office");
      default:
        return type;
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
          {office ? office.name : t("office_details")}
        </h2>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="mr-2 h-4 w-4" />
              {t("error")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => {
                dispatch(fetchOfficeById(officeId));
                dispatch(fetchServiceGuidesByOffice(officeId));
              }}
            >
              {t("retry")}
            </Button>
          </CardFooter>
        </Card>
      )}

      {!loading && !error && office && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-2">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {getOfficeTypeDisplay(office.type)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href={`/admin/offices/${officeId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t("edit_office")}
                </Link>
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("delete_office")}
              </Button>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
              <TabsTrigger value="services">{t("services")}</TabsTrigger>
              <TabsTrigger value="staff">{t("staff")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("office_information")}</CardTitle>
                  <CardDescription>
                    {t("basic_details_about_office")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{office.address}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{office.phone_number}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{office.email}</span>
                      </div>
                      {office.website && (
                        <div className="flex items-center text-sm">
                          <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                          <a
                            href={office.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {office.website}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {office.operating_hours || t("not_specified")}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-md border p-4">
                      <h3 className="mb-2 font-medium">
                        {t("office_description")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {office.description || t("no_description_available")}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-2 font-medium">
                      {t("additional_information")}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t("office_id")}:
                          </span>
                          <span className="font-mono">{office.office_id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t("created_at")}:
                          </span>
                          <span>
                            {office.created_at
                              ? new Date(office.created_at).toLocaleDateString()
                              : t("not_available")}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t("last_updated")}:
                          </span>
                          <span>
                            {office.updated_at
                              ? new Date(office.updated_at).toLocaleDateString()
                              : t("not_available")}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t("parent_office")}:
                          </span>
                          <span>
                            {office.parent_office_id
                              ? office.parent_office_id
                              : t("none")}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t("services_offered")}:
                          </span>
                          <span className="font-medium">{guides.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{t("services_offered")}</h3>
                <Button asChild>
                  <Link href={`/admin/services/new?office_id=${officeId}`}>
                    {t("add_service")}
                  </Link>
                </Button>
              </div>

              {guides.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">
                      <p>{t("no_services_found")}</p>
                      <Button variant="outline" className="mt-4" asChild>
                        <Link
                          href={`/admin/services/new?office_id=${officeId}`}
                        >
                          {t("add_first_service")}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {guides.map((guide) => (
                    <Card key={guide.guide_id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {guide.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {guide.description}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <div className="flex w-full justify-between">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/services/${guide.guide_id}`}>
                              {t("view_details")}
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={`/admin/services/${guide.guide_id}/edit`}
                            >
                              <Edit className="mr-2 h-3 w-3" />
                              {t("edit")}
                            </Link>
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="staff" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{t("office_staff")}</h3>
                <Button asChild>
                  <Link href={`/admin/users/new?office_id=${officeId}`}>
                    {t("add_staff_member")}
                  </Link>
                </Button>
              </div>

              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    <Users className="mx-auto h-10 w-10" />
                    <p className="mt-2">{t("staff_management_coming_soon")}</p>
                    <p className="text-sm">
                      {t("staff_management_description")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Delete Office Confirmation Dialog */}
          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("confirm_delete_office")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("delete_office_warning")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  {t("cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteOffice}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("deleting")}
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("delete")}
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
