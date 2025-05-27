"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Copy, ExternalLink, MapPin, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Office } from "@/services/office.service";

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

// Add LayersControl imports
const LayersControl = dynamic(
  () => import("react-leaflet").then((mod) => mod.LayersControl),
  { ssr: false }
);

const BaseLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.LayersControl.BaseLayer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Add tooltip import for permanent labels
const Tooltip = dynamic(
  () => import("react-leaflet").then((mod) => mod.Tooltip),
  {
    ssr: false,
  }
);

interface OfficeMapProps {
  offices: Office[];
  selectedOffice: string | null;
  setSelectedOffice: (id: string) => void;
  t: (key: string) => string;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

export function OfficeMap({
  offices = [],
  selectedOffice,
  setSelectedOffice,
  t,
  searchQuery = "",
  onSearchQueryChange,
}: OfficeMapProps) {
  const [mapRef, setMapRef] = useState<any>(null);
  const [icon, setIcon] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapLayer, setMapLayer] = useState<"street" | "satellite">("satellite");
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { toast } = useToast();

  // Create custom icon on client side
  useEffect(() => {
    // Only import Leaflet on the client side
    const L = require("leaflet");

    // Import Leaflet CSS
    require("leaflet/dist/leaflet.css");

    const customIcon = L.divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 41" width="24" height="41">
        <path d="M12 0C5.383 0 0 5.383 0 12c0 6.617 12 29 12 29s12-22.383 12-29c0-6.617-5.383-12-12-12z"
        fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="#ffffff"/>
      </svg>`,
      className: "",
      iconSize: [24, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    setIcon(customIcon);
    setIsLoaded(true);
  }, []);

  // Effect to center map on selected office
  useEffect(() => {
    if (mapRef && selectedOffice) {
      const office = offices.find((o) => o.office_id === selectedOffice);
      if (office && office.latitude && office.longitude) {
        mapRef.setView([office.latitude, office.longitude], 15);
      }
    }
  }, [selectedOffice, mapRef, offices]);

  // Copy address to clipboard
  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Address has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  // Open in Google Maps
  const openInGoogleMaps = (office: Office) => {
    const query = encodeURIComponent(`${office.name}, ${office.address}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, "_blank");
  };

  // Handle location search using geocoding
  const handleLocationSearch = async () => {
    if (!locationSearchQuery.trim()) return;

    setIsSearching(true);
    setShowSearchResults(false);
    try {
      // Use Nominatim API for geocoding (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationSearchQuery + ", Ethiopia"
        )}&limit=5`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setSearchResults(data);
        setShowSearchResults(true);

        // Center map on first result
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        if (mapRef) {
          mapRef.setView([newLat, newLng], 15);
        }
      } else {
        toast({
          title: t("no_results_found") || "No results found",
          description:
            t("try_different_search") || "Try a different search term",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching for location:", error);
      toast({
        title: t("search_error") || "Search Error",
        description: t("search_failed") || "Failed to search for location",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (mapRef) {
      mapRef.setView([lat, lng], 16);
    }
    setShowSearchResults(false);
    setLocationSearchQuery(result.display_name);
  };

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Enhanced Search overlay */}
      <div className="absolute top-6 left-6 right-6 z-[1000] flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder={
                t("search_location") || "Search for a location in Ethiopia..."
              }
              className="pl-12 pr-12 py-4 text-base bg-white/95 backdrop-blur-md border-2 border-white/50 rounded-2xl shadow-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300 placeholder:text-gray-400"
              value={locationSearchQuery}
              onChange={(e) => setLocationSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLocationSearch()}
            />
            {locationSearchQuery && (
              <button
                onClick={() => {
                  setLocationSearchQuery("");
                  setShowSearchResults(false);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors z-10"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <Button
            type="button"
            onClick={handleLocationSearch}
            disabled={isSearching || !locationSearchQuery.trim()}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                {t("searching") || "Searching..."}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                {t("search")}
              </div>
            )}
          </Button>
        </div>

        {/* Enhanced Search results dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="bg-white/95 backdrop-blur-md border-2 border-white/50 rounded-2xl shadow-2xl max-h-64 overflow-y-auto">
            <div className="p-2">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchResultSelect(result)}
                  className="w-full text-left p-4 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-200 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {result.display_name.split(",")[0]}
                      </div>
                      <div className="text-gray-500 text-sm truncate mt-1">
                        {result.display_name}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <MapContainer
        center={[9.0215, 38.7795]} // Center of Addis Ababa
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        className="overflow-hidden"
        ref={setMapRef}
        eventHandlers={{
          baselayerchange: (e: any) => {
            setMapLayer(e.name === "Street Map" ? "street" : "satellite");
          },
        }}
      >
        {/* Enhanced map layer toggle */}
        <div
          className="leaflet-top leaflet-right"
          style={{ top: "100px", right: "20px" }}
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border-2 border-white/50 overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className={`px-4 py-3 rounded-none transition-all duration-300 ${
                mapLayer === "street"
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
              onClick={() => setMapLayer("street")}
            >
              Street
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-4 py-3 rounded-none transition-all duration-300 ${
                mapLayer === "satellite"
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
              onClick={() => setMapLayer("satellite")}
            >
              Satellite
            </Button>
          </div>
        </div>
        {/* Map Tiles */}
        {mapLayer === "street" ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}
        {/* Map markers for each office */}{" "}
        {offices.map((office) =>
          office.latitude && office.longitude ? (
            <Marker
              key={office.office_id}
              position={[office.latitude, office.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  setSelectedOffice(office.office_id);
                },
              }}
            >
              {/* Permanent label showing the office name */}
              <Tooltip permanent direction="top" offset={[0, -20]}>
                <span className="font-medium">{office.name}</span>
              </Tooltip>
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <p className="font-medium text-base">{office.name}</p>
                  <div className="flex items-start gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      {office.address}
                    </p>
                  </div>
                  {office.average_rating !== undefined &&
                    office.average_rating !== null && (
                      <div className="mt-2 flex items-center text-xs">
                        <svg
                          className="h-3 w-3 fill-primary text-primary"
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
                  <div className="mt-3 space-y-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-7"
                      asChild
                    >
                      <Link href={`/dashboard/offices/${office.office_id}`}>
                        {t("view_details")}
                      </Link>
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7"
                        onClick={() => copyAddress(office.address)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7"
                        onClick={() => openInGoogleMaps(office)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Maps
                      </Button>
                    </div>
                  </div>
                </div>
              </Popup>

              {/* Permanent office label */}
              <Tooltip permanent>
                <span className="text-xs font-medium">{office.name}</span>
              </Tooltip>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}
