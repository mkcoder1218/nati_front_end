"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Filter, 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  Building2 
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  fetchAllServiceGuides,
  searchServiceGuides,
  deleteServiceGuide
} from "@/store/slices/serviceGuideSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ServiceGuide } from "@/services/serviceGuide.service";

export default function AdminServicesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  const { guides, searchResults, loading, error } = useAppSelector(
    (state) => state.serviceGuide
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [guideToDelete, setGuideToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all service guides on component mount
  useEffect(() => {
    dispatch(fetchAllServiceGuides());
  }, [dispatch]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(searchServiceGuides(searchQuery));
    } else {
      dispatch(fetchAllServiceGuides());
    }
  };

  // Filter guides by category
  const filteredGuides = (searchQuery ? searchResults : guides).filter(
    (guide) => selectedCategory === "all" || guide.category === selectedCategory
  );

  // Get unique categories from guides
  const categories = [
    ...new Set([...guides, ...searchResults].map((guide) => guide.category)),
  ];

  // Handle delete
  const handleDelete = async () => {
    if (!guideToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteServiceGuide(guideToDelete)).unwrap();
      toast({
        title: "Service guide deleted",
        description: "The service guide has been successfully deleted.",
      });
      setGuideToDelete(null);
      
      // Refresh the list
      dispatch(fetchAllServiceGuides());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the service guide. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("manage_services")}</h2>
          <p className="text-muted-foreground">{t("admin_services_subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/services/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("add_new_service")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("search_services")}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </form>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("select_category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all_categories")}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-destructive">
              <p>{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => dispatch(fetchAllServiceGuides())}
              >
                {t("retry")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredGuides.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p>{t("no_services_found")}</p>
              <Button
                variant="outline"
                className="mt-4"
                asChild
              >
                <Link href="/admin/services/new">
                  {t("create_first_service")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map((guide) => (
            <ServiceCard 
              key={guide.guide_id} 
              guide={guide} 
              onEdit={() => router.push(`/admin/services/${guide.guide_id}/edit`)}
              onDelete={() => setGuideToDelete(guide.guide_id)}
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!guideToDelete} onOpenChange={(open) => !open && setGuideToDelete(null)}>
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

interface ServiceCardProps {
  guide: ServiceGuide;
  onEdit: () => void;
  onDelete: () => void;
}

function ServiceCard({ guide, onEdit, onDelete }: ServiceCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-1">{guide.title}</CardTitle>
            <CardDescription className="line-clamp-2 pt-1">
              {guide.description}
            </CardDescription>
          </div>
          <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {guide.category}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {guide.office_name || t("unknown_office")}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium">{t("requirements")}:</h4>
            <ul className="ml-4 list-disc text-sm text-muted-foreground">
              {guide.requirements && guide.requirements.length > 0 ? (
                <>
                  {guide.requirements.slice(0, 2).map((req, index) => (
                    <li key={index} className="line-clamp-1">
                      {req}
                    </li>
                  ))}
                  {guide.requirements.length > 2 && (
                    <li className="text-xs text-muted-foreground">
                      +{guide.requirements.length - 2} {t("more")}
                    </li>
                  )}
                </>
              ) : (
                <li className="text-sm text-muted-foreground">
                  {t("no_requirements")}
                </li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button asChild variant="default" className="w-full">
          <Link href={`/admin/services/${guide.guide_id}`}>
            <FileText className="mr-2 h-4 w-4" />
            {t("view_details")}
          </Link>
        </Button>
        <div className="flex w-full gap-2">
          <Button onClick={onEdit} variant="outline" className="flex-1">
            <Edit className="mr-2 h-4 w-4" />
            {t("edit")}
          </Button>
          <Button onClick={onDelete} variant="outline" className="flex-1 text-destructive hover:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            {t("delete")}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
