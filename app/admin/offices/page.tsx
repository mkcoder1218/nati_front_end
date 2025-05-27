"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  Edit,
  Filter,
  Loader2,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchAllOffices, deleteOffice } from "@/store/slices/officeSlice";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "@/lib/translation-context";
import { toast } from "sonner";
import { Office } from "@/services/office.service";

export default function AdminOfficesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { offices, loading, error } = useAppSelector((state) => state.office);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [officeToDelete, setOfficeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all offices on component mount
  useEffect(() => {
    dispatch(fetchAllOffices());
  }, [dispatch]);

  // Filter offices based on search term and type
  const filteredOffices = offices.filter((office) => {
    const matchesSearch = office.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || office.type === filterType;
    return matchesSearch && matchesType;
  });

  // Handle office deletion
  const handleDeleteOffice = async () => {
    if (!officeToDelete) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteOffice(officeToDelete)).unwrap();
      toast.success(t("office_deleted_successfully"));
    } catch (error) {
      console.error("Failed to delete office:", error);
      toast.error(t("failed_to_delete_office"));
    } finally {
      setIsDeleting(false);
      setOfficeToDelete(null);
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("manage_offices")}</h2>
          <p className="text-muted-foreground">
            {t("manage_offices_description")}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/offices/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("add_new_office")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("search_offices")}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={filterType}
          onValueChange={setFilterType}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder={t("filter_by_type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all_types")}</SelectItem>
            <SelectItem value="kebele">{t("kebele_office")}</SelectItem>
            <SelectItem value="woreda">{t("woreda_office")}</SelectItem>
            <SelectItem value="municipal">{t("municipal_office")}</SelectItem>
            <SelectItem value="regional">{t("regional_office")}</SelectItem>
            <SelectItem value="federal">{t("federal_office")}</SelectItem>
          </SelectContent>
        </Select>
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
              onClick={() => dispatch(fetchAllOffices())}
            >
              {t("retry")}
            </Button>
          </CardFooter>
        </Card>
      )}

      {!loading && !error && filteredOffices.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Building2 className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-center text-muted-foreground">
              {searchTerm || filterType !== "all"
                ? t("no_matching_offices")
                : t("no_offices_yet")}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              asChild
            >
              <Link href="/admin/offices/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("add_first_office")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && filteredOffices.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffices.map((office) => (
            <Card key={office.office_id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{office.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/offices/${office.office_id}`}>
                          {t("view_details")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/offices/${office.office_id}/edit`}>
                          {t("edit_office")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setOfficeToDelete(office.office_id)}
                      >
                        {t("delete_office")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>
                  {getOfficeTypeDisplay(office.type)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{office.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{office.phone_number}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex w-full justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/admin/offices/${office.office_id}`}>
                      {t("view_details")}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/admin/offices/${office.office_id}/edit`}>
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

      {/* Delete Office Confirmation Dialog */}
      <AlertDialog open={!!officeToDelete} onOpenChange={(open) => !open && setOfficeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm_delete_office")}</AlertDialogTitle>
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
    </div>
  );
}
