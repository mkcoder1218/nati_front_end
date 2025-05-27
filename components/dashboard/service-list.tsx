"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Filter, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  fetchAllServiceGuides,
  searchServiceGuides,
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
import { useTranslation } from "@/lib/translation-context";
import { ServiceGuide } from "@/services/serviceGuide.service";

export function ServiceList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { guides, searchResults, loading, error } = useAppSelector(
    (state) => state.serviceGuide
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
      // Clear search results when search query is empty
      dispatch(fetchAllServiceGuides());
    }
  };

  // Clear search when search query is empty
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      // Reset search results when search query is cleared
      dispatch(fetchAllServiceGuides());
    }
  }, [searchQuery, dispatch]);

  // Filter guides by category
  const filteredGuides = (
    searchQuery.trim() && searchResults.length > 0 ? searchResults : guides
  ).filter((guide) => {
    if (selectedCategory === "all") return true;
    return guide.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Get unique categories
  const categories = [...new Set(guides.map((guide) => guide.category))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("services")}</h2>
          <p className="text-muted-foreground">{t("services_subtitle")}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
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
            <Button
              type="submit"
              variant="outline"
              size="icon"
              className="shrink-0"
            >
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
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t("filter_by_category")} />
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
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredGuides.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p>{t("no_services_found")}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map((guide) => (
            <ServiceCard key={guide.guide_id} guide={guide} />
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceCard({ guide }: { guide: ServiceGuide }) {
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
          <div>
            <h4 className="text-sm font-medium">{t("requirements")}:</h4>
            <ul className="ml-4 list-disc text-sm text-muted-foreground">
              {guide.requirements && guide.requirements.length > 0 ? (
                <>
                  {guide.requirements.slice(0, 3).map((req, index) => (
                    <li key={index} className="line-clamp-1">
                      {req}
                    </li>
                  ))}
                  {guide.requirements.length > 3 && (
                    <li className="text-xs text-muted-foreground">
                      +{guide.requirements.length - 3} more
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
          <div>
            <h4 className="text-sm font-medium">{t("estimated_time")}:</h4>
            <p className="text-sm text-muted-foreground">
              {guide.estimated_time}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/services/${guide.guide_id}`}>
            <FileText className="mr-2 h-4 w-4" />
            {t("view_full_guide")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
