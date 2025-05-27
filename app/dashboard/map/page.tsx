"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Search } from "lucide-react";
import "../../../styles/map-animations.css";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white/50 to-indigo-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-indigo-600/80 text-white backdrop-blur-sm">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-6 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="hero-title text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {t("offices_map")}
              </h1>
              <p className="hero-subtitle mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
                {t("find_offices_on_map")} - Discover government services near
                you with our interactive map
              </p>
              <div className="hero-badge mt-8 flex justify-center">
                <div className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-medium hover-lift animate-pulse-gentle">
                  <Building2 className="mr-2 h-5 w-5" />
                  {offices?.length || 0} Offices Available
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="floating-decoration absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          <div className="floating-decoration absolute top-20 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="floating-decoration absolute bottom-10 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Main Map Section */}
            <div className="lg:col-span-3 map-search-container">
              <Card className="overflow-hidden border-0 shadow-2xl bg-white/60 backdrop-blur-md hover-lift">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold flex items-center">
                        <div className="p-2 bg-white/20 rounded-lg mr-3">
                          <Building2 className="h-6 w-6" />
                        </div>
                        {t("interactive_map")}
                      </CardTitle>
                      <CardDescription className="text-blue-100 mt-2">
                        {t("search_map_description") ||
                          "Search for locations and find nearby offices"}
                      </CardDescription>
                    </div>
                    <div className="hidden sm:block">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <div className="text-sm font-medium">Live Map</div>
                        <div className="text-xs text-blue-100">
                          Real-time data
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[600px] w-full relative">
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
                        searchQuery={searchQuery}
                        onSearchQueryChange={setSearchQuery}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 map-sidebar">
              <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-md sticky top-8 hover-lift">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
                  <CardTitle className="text-xl font-bold flex items-center">
                    <div className="p-2 bg-white/20 rounded-lg mr-3">
                      <Search className="h-5 w-5" />
                    </div>
                    {t("nearby_offices")}
                  </CardTitle>
                  <CardDescription className="text-indigo-100">
                    {t("offices_near_you")}
                  </CardDescription>
                </CardHeader>
                <div className="p-6 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder={t("search_offices")}
                      className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <CardContent className="p-0">
                  <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                    {!isMounted ? (
                      <div className="flex justify-center py-12">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    ) : loading ? (
                      <div className="flex justify-center py-12">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="text-center py-12 px-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Building2 className="h-8 w-8 text-red-600" />
                        </div>
                        <p className="text-red-600 font-medium mb-4">{error}</p>
                        <Button
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => dispatch(fetchAllOffices())}
                        >
                          {t("retry")}
                        </Button>
                      </div>
                    ) : filteredOffices.length === 0 ? (
                      <div className="text-center py-12 px-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          {searchQuery
                            ? t("no_matching_offices")
                            : t("no_offices_found")}
                        </p>
                        {searchQuery && (
                          <p className="text-sm text-gray-400 mt-2">
                            Try adjusting your search terms
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 space-y-3">
                        {filteredOffices.map((office, index) => (
                          <div
                            key={office.office_id}
                            className={`office-card stagger-item group relative overflow-hidden rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                              selectedOffice === office.office_id
                                ? "border-blue-500 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 shadow-md backdrop-blur-sm"
                                : "border-gray-200/50 bg-white/40 hover:border-blue-300 hover:bg-blue-50/30 backdrop-blur-sm"
                            }`}
                            onClick={() => setSelectedOffice(office.office_id)}
                            style={{
                              animationDelay: `${index * 100}ms`,
                            }}
                          >
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-10 translate-x-10 opacity-50 group-hover:opacity-70 transition-opacity"></div>

                            <div className="relative">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    selectedOffice === office.office_id
                                      ? "bg-blue-500 text-white"
                                      : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                                  } transition-colors`}
                                >
                                  <Building2 className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 truncate">
                                    {office.name}
                                  </h3>
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {office.address}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 flex items-center justify-between">
                                {office.average_rating !== undefined &&
                                  office.average_rating !== null && (
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                                      <svg
                                        className="h-3 w-3 fill-yellow-400 text-yellow-400"
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
                                      <span className="text-xs font-medium text-yellow-700">
                                        {typeof office.average_rating ===
                                        "number"
                                          ? office.average_rating.toFixed(1)
                                          : parseFloat(
                                              String(office.average_rating || 0)
                                            ).toFixed(1)}
                                      </span>
                                    </div>
                                  )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                  className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                                >
                                  <Link
                                    href={`/dashboard/offices/${office.office_id}`}
                                  >
                                    {t("view_details")}
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
