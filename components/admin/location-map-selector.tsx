"use client";

import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/translation-context";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet marker icon issue in Next.js
// Create a custom icon using inline SVG
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

interface LocationMapSelectorProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

interface MarkerPositionProps {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}

// Component to handle map events and marker dragging
function DraggableMarker({ position, onPositionChange }: MarkerPositionProps) {
  // Ensure position is always a valid tuple of numbers
  const validatePosition = (pos: [number, number]): [number, number] => {
    const [lat, lng] = pos;
    const validLat = typeof lat === "number" && !isNaN(lat) ? lat : 9.0127;
    const validLng = typeof lng === "number" && !isNaN(lng) ? lng : 38.7861;
    return [validLat, validLng];
  };

  const [markerPosition, setMarkerPosition] = useState<[number, number]>(
    validatePosition(position)
  );

  // Update marker position when props change
  useEffect(() => {
    setMarkerPosition(validatePosition(position));
  }, [position]);

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      onPositionChange(lat, lng);
    },
  });

  // Center map on marker position when it changes
  useEffect(() => {
    map.flyTo(markerPosition, map.getZoom());
  }, [map, markerPosition]);

  return (
    <Marker
      position={markerPosition}
      icon={customIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          setMarkerPosition([position.lat, position.lng]);
          onPositionChange(position.lat, position.lng);
        },
      }}
    >
      <Popup>
        <div className="text-center">
          <p className="font-medium">Selected Location</p>
          <p className="text-xs">
            Lat:{" "}
            {typeof markerPosition[0] === "number"
              ? markerPosition[0].toFixed(6)
              : "0.000000"}
            , Lng:{" "}
            {typeof markerPosition[1] === "number"
              ? markerPosition[1].toFixed(6)
              : "0.000000"}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function LocationMapSelector({
  latitude,
  longitude,
  onLocationChange,
}: LocationMapSelectorProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  // Ensure coordinates are always valid numbers
  const validateCoordinates = (lat: number, lng: number): [number, number] => {
    const validLat = typeof lat === "number" && !isNaN(lat) ? lat : 9.0127;
    const validLng = typeof lng === "number" && !isNaN(lng) ? lng : 38.7861;
    return [validLat, validLng];
  };

  const [position, setPosition] = useState<[number, number]>(
    validateCoordinates(latitude, longitude)
  );
  const [isSearching, setIsSearching] = useState(false);

  // Update position when props change
  useEffect(() => {
    setPosition(validateCoordinates(latitude, longitude));
  }, [latitude, longitude]);

  const handlePositionChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Use Nominatim API for geocoding (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setPosition([newLat, newLng]);
        onLocationChange(newLat, newLng);
      }
    } catch (error) {
      console.error("Error searching for location:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-2 border-b flex-shrink-0">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("search_location")}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? t("searching") : t("search")}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className="rounded-none"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker
            position={position}
            onPositionChange={handlePositionChange}
          />
        </MapContainer>
      </div>
    </div>
  );
}
