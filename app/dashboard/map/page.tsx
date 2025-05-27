"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, MapPin, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchAllOffices } from "@/store/slices/officeSlice";
import { OfficeMap } from "@/components/dashboard/office-map";

export default function MapPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { offices, loading, error } = useAppSelector((state) => state.office);
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Only render the component on the client side to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch offices on component mount
  useEffect(() => {
    dispatch(fetchAllOffices());
  }, [dispatch]);

  // Filter offices based on search query
  const filteredOffices = offices
    ? offices.filter(
        (office) =>
          office &&
          office.name &&
          office.address &&
          (office.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            office.address.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t("offices_map")}
        </h2>
        <p className="text-muted-foreground">{t("find_offices_on_map")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="h-[600px] min-w-[60vw]">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{t("interactive_map")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[530px] w-full">
                {/* Leaflet Map Component */}
                {!isMounted ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : loading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="text-center">
                      <p className="text-destructive">{error}</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => dispatch(fetchAllOffices())}
                      >
                        {t("retry")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <OfficeMap
                    offices={filteredOffices}
                    selectedOffice={selectedOffice}
                    setSelectedOffice={(id) => setSelectedOffice(id)}
                    t={t}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("nearby_offices")}</CardTitle>
              <CardDescription>{t("offices_near_you")}</CardDescription>
              <div className="mt-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("search_offices")}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-auto">
              {!isMounted ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center text-destructive py-8">
                  <p>{error}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => dispatch(fetchAllOffices())}
                  >
                    {t("retry")}
                  </Button>
                </div>
              ) : filteredOffices.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>{t("no_offices_found")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOffices.map((office) => (
                    <div
                      key={office.office_id}
                      className={`rounded-lg border p-3 cursor-pointer transition-all ${
                        selectedOffice === office.office_id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedOffice(office.office_id)}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{office.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {office.address}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        {office.average_rating !== undefined &&
                          office.average_rating !== null && (
                            <div className="flex items-center text-sm">
                              <svg
                                className="h-4 w-4 fill-primary text-primary"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              <span className="ml-1">
                                {typeof office.average_rating === "number"
                                  ? office.average_rating.toFixed(1)
                                  : parseFloat(
                                      String(office.average_rating || 0)
                                    ).toFixed(1)}
                              </span>
                            </div>
                          )}
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/offices/${office.office_id}`}>
                            {t("view_details")}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  );
}
