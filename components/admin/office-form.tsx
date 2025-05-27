"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Clock, MapPin, Plus, Save, Trash, User } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/translation-context";
import {
  Office,
  CreateOfficeData,
  UpdateOfficeData,
} from "@/services/office.service";
import UserService, { GovernmentOfficial } from "@/services/user.service";
import { OperatingHoursSelector } from "./operating-hours-selector";

// Dynamically import the map component to avoid SSR issues with Leaflet
const LocationMapSelector = dynamic(() => import("./location-map-selector"), {
  ssr: false,
});

interface OfficeFormProps {
  initialData?: Office;
  onSubmit: (data: CreateOfficeData | UpdateOfficeData) => void;
  isSubmitting: boolean;
  isEditing?: boolean;
}

export function OfficeForm({
  initialData,
  onSubmit,
  isSubmitting,
  isEditing = false,
}: OfficeFormProps) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<CreateOfficeData | UpdateOfficeData>(
    {
      name: "",
      type: "woreda",
      latitude: 9.0127, // Default to Addis Ababa
      longitude: 38.7861,
      address: "",
      contact_info: "",
      operating_hours: "",
      parent_office_id: undefined,
      assigned_official_id: undefined,
    }
  );

  const [availableOfficials, setAvailableOfficials] = useState<
    GovernmentOfficial[]
  >([]);
  const [loadingOfficials, setLoadingOfficials] = useState(false);
  const [currentAssignedOfficial, setCurrentAssignedOfficial] =
    useState<GovernmentOfficial | null>(null);

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      console.log("Initializing form with office data:", initialData);
      console.log(
        "Assigned official ID from initialData:",
        initialData.assigned_official_id
      );
      console.log(
        "Assigned official name from initialData:",
        initialData.assigned_official_name
      );

      const newFormData = {
        name: initialData.name || "",
        type: initialData.type || "woreda",
        latitude: initialData.latitude || 9.0127,
        longitude: initialData.longitude || 38.7861,
        address: initialData.address || "",
        contact_info: initialData.contact_info || "",
        operating_hours: initialData.operating_hours || "",
        parent_office_id: initialData.parent_office_id,
        assigned_official_id: initialData.assigned_official_id || undefined,
      };

      console.log("Setting form data:", newFormData);
      setFormData(newFormData);
    }
  }, [initialData]);

  // Fetch available government officials
  useEffect(() => {
    const fetchOfficials = async () => {
      try {
        setLoadingOfficials(true);
        console.log("Fetching available officials...");
        const officials = await UserService.getAvailableOfficials();
        console.log("Fetched officials:", officials);
        setAvailableOfficials(officials);

        // If editing and we have an assigned official ID, find that official
        if (isEditing && initialData?.assigned_official_id) {
          console.log(
            "Looking for assigned official with ID:",
            initialData.assigned_official_id
          );
          console.log("Available officials:", officials);

          const assignedOfficial = officials.find(
            (official) => official.user_id === initialData.assigned_official_id
          );

          if (assignedOfficial) {
            console.log("Found assigned official:", assignedOfficial);
            setCurrentAssignedOfficial(assignedOfficial);
          } else {
            console.log(
              "Assigned official not found in available officials list"
            );
            // If the assigned official is not in the available list, create a temporary entry
            if (initialData.assigned_official_name) {
              const tempOfficial: GovernmentOfficial = {
                user_id: initialData.assigned_official_id,
                full_name: initialData.assigned_official_name,
                email: "Loading...",
                phone_number: "Loading...",
                role: "official",
                office_id: initialData.office_id,
                created_at: "",
              };
              console.log("Creating temporary official entry:", tempOfficial);
              setCurrentAssignedOfficial(tempOfficial);
              // Add to available officials list so it appears in dropdown
              setAvailableOfficials((prev) => [...prev, tempOfficial]);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch available officials:", error);
      } finally {
        setLoadingOfficials(false);
      }
    };

    fetchOfficials();
  }, [isEditing, initialData?.assigned_official_id]);

  // Debug form data and current assigned official
  useEffect(() => {
    console.log("=== FORM DEBUG ===");
    console.log("Form data:", formData);
    console.log("Current assigned official:", currentAssignedOfficial);
    console.log(
      "Select value will be:",
      formData.assigned_official_id || "none"
    );
    console.log("Available officials count:", availableOfficials.length);

    if (formData.assigned_official_id) {
      const foundOfficial = availableOfficials.find(
        (official) => official.user_id === formData.assigned_official_id
      );
      console.log("Found official in list:", foundOfficial);
    }
    console.log("==================");
  }, [formData, currentAssignedOfficial, availableOfficials]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleOperatingHoursChange = (hoursJson: string) => {
    setFormData((prev) => ({
      ...prev,
      operating_hours: hoursJson,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting office form with data:", formData);
    onSubmit(formData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>
            {isEditing ? t("edit_office_information") : t("office_information")}
          </CardTitle>
          <CardDescription>
            {isEditing ? t("update_office_details") : t("enter_office_details")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("office_name")}</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t("office_name_placeholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">{t("office_type")}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder={t("select_office_type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kebele">{t("kebele_office")}</SelectItem>
                  <SelectItem value="woreda">{t("woreda_office")}</SelectItem>
                  <SelectItem value="municipal">
                    {t("municipal_office")}
                  </SelectItem>
                  <SelectItem value="regional">
                    {t("regional_office")}
                  </SelectItem>
                  <SelectItem value="federal">{t("federal_office")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="assigned_official_id">
                {t("assign_government_official")}
              </Label>
            </div>
            <Select
              key={`official-select-${formData.assigned_official_id || "none"}`}
              value={formData.assigned_official_id || "none"}
              onValueChange={(value) => {
                console.log("Official selection changed to:", value);
                handleSelectChange(
                  "assigned_official_id",
                  value === "none" ? undefined : value
                );
              }}
            >
              <SelectTrigger id="assigned_official_id">
                <SelectValue
                  placeholder={
                    loadingOfficials
                      ? t("loading_officials")
                      : t("select_government_official")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {t("no_official_assigned")}
                </SelectItem>
                {availableOfficials.length === 0 && !loadingOfficials && (
                  <SelectItem value="no-officials" disabled>
                    No government officials found
                  </SelectItem>
                )}
                {availableOfficials.map((official) => (
                  <SelectItem key={official.user_id} value={official.user_id}>
                    {official.full_name} ({official.email})
                    {official.office_id &&
                      official.office_id === initialData?.office_id && (
                        <span className="text-muted-foreground ml-2">
                          - Currently assigned
                        </span>
                      )}
                    {official.office_id &&
                      official.office_id !== initialData?.office_id && (
                        <span className="text-muted-foreground ml-2">
                          - Assigned to other office
                        </span>
                      )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Label>{t("office_location")}</Label>
            </div>
            <div className="h-[300px] rounded-md border overflow-hidden">
              <LocationMapSelector
                latitude={formData.latitude || 9.0127}
                longitude={formData.longitude || 38.7861}
                onLocationChange={handleLocationChange}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 mt-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">{t("latitude")}</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">{t("longitude")}</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t("full_address")}</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder={t("address_placeholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_info">{t("contact_information")}</Label>
            <Textarea
              id="contact_info"
              name="contact_info"
              value={formData.contact_info}
              onChange={handleInputChange}
              placeholder={t("contact_info_placeholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label>{t("operating_hours")}</Label>
            </div>
            <OperatingHoursSelector
              value={formData.operating_hours || ""}
              onChange={handleOperatingHoursChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link
              href={
                isEditing
                  ? `/admin/offices/${initialData?.office_id}`
                  : "/admin/offices"
              }
            >
              {t("cancel")}
            </Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting
              ? isEditing
                ? t("saving")
                : t("creating")
              : isEditing
              ? t("save_changes")
              : t("create_office")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
