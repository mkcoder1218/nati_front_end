"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Filter, MapPin, Search, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchAllOffices } from "@/store/slices/officeSlice";
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
import { useTranslation } from "@/lib/translation-context";
import { Office } from "@/services/office.service";

export function OfficeList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { offices, loading, error } = useAppSelector((state) => state.office);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  // Fetch all offices on component mount and when the component is focused
  useEffect(() => {
    // Always fetch fresh data when the component mounts
    dispatch(fetchAllOffices());

    // Also refresh when the user navigates back to this page
    const handleFocus = () => {
      dispatch(fetchAllOffices());
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [dispatch]);

  // Filter offices based on search query and selected type
  const filteredOffices = offices.filter((office) => {
    const matchesSearch =
      office.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      office.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || office.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 min-w-[80vw]">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("government_offices")}
          </h2>
          <p className="text-muted-foreground">
            {t("find_government_offices")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
           
          </div>
        </div>
        <div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t("office_type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all_types")}</SelectItem>
              <SelectItem value="kebele">{t("kebele")}</SelectItem>
              <SelectItem value="woreda">{t("woreda")}</SelectItem>
              <SelectItem value="municipal">{t("municipal")}</SelectItem>
              <SelectItem value="regional">{t("regional")}</SelectItem>
              <SelectItem value="federal">{t("federal")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Office List */}
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
                onClick={() => dispatch(fetchAllOffices())}
              >
                {t("retry")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredOffices.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p>{t("no_offices_found")}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOffices.map((office) => (
            <OfficeCard key={office.office_id} office={office} />
          ))}
        </div>
      )}
    </div>
  );
}

function OfficeCard({ office }: { office: Office }) {
  const { t } = useTranslation();

  // Create a URL-friendly slug from the office name
  const getOfficeSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-1">{office.name}</CardTitle>
            <CardDescription className="line-clamp-2 pt-1">
              <div className="flex items-center">
                <MapPin className="mr-1 h-3 w-3" />
                {office.address}
              </div>
            </CardDescription>
          </div>
          <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {t(office.type)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Rating Display */}
          <div>
            <h4 className="text-sm font-medium">{t("rating")}:</h4>
            <div className="flex items-center mt-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i <
                      (office.average_rating !== undefined &&
                      office.average_rating !== null
                        ? Number(office.average_rating)
                        : 0)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-muted-foreground">
                {office.average_rating !== undefined &&
                office.average_rating !== null
                  ? Number(office.average_rating).toFixed(1)
                  : "0.0"}
                {office.review_count ? ` (${office.review_count})` : ""}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium">{t("contact_info")}:</h4>
            <p className="text-sm text-muted-foreground">
              {office.contact_info}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium">{t("operating_hours")}:</h4>
            <p className="text-sm text-muted-foreground">
              {office.operating_hours}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link
            href={`/dashboard/offices/${office.office_id}`}
            data-office-id={office.office_id}
          >
            <Building2 className="mr-2 h-4 w-4" />
            {t("view_details")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
