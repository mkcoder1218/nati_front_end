"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  fetchServiceGuideById,
  updateServiceGuide,
} from "@/store/slices/serviceGuideSlice";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/translation-context";
import { UpdateServiceGuideData } from "@/services/serviceGuide.service";

interface EditServiceGuidePageProps {
  params: {
    id: string;
  };
}

export default function EditServiceGuidePage({
  params,
}: EditServiceGuidePageProps) {
  const guideId = params.id;
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const {
    selectedGuide: guide,
    loading,
    error,
  } = useAppSelector((state) => state.serviceGuide);
  const { offices } = useAppSelector((state) => state.office);
  const { user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<UpdateServiceGuideData>({
    office_id: "",
    title: "",
    description: "",
    requirements: [""],
    steps: [{ title: "", description: "" }],
    estimated_time: "",
    fees: "",
    documents: [],
    category: "General",
  });

  // Fetch service guide and offices
  useEffect(() => {
    if (guideId) {
      dispatch(fetchServiceGuideById(guideId));
      dispatch(fetchAllOffices());
    }
  }, [dispatch, guideId]);

  // Populate form when guide data is loaded
  useEffect(() => {
    if (guide) {
      setFormData({
        office_id: guide.office_id,
        title: guide.title,
        description: guide.description,
        requirements: guide.requirements.length ? guide.requirements : [""],
        steps: guide.steps.length
          ? guide.steps
          : [{ title: "", description: "" }],
        estimated_time: guide.estimated_time,
        fees: guide.fees,
        documents: guide.documents,
        category: guide.category,
      });
    }
  }, [guide]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const updatedRequirements = [...formData.requirements!];
    updatedRequirements[index] = value;
    setFormData((prev) => ({
      ...prev,
      requirements: updatedRequirements,
    }));
  };

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...(prev.requirements || []), ""],
    }));
  };

  const removeRequirement = (index: number) => {
    const updatedRequirements = [...formData.requirements!];
    updatedRequirements.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      requirements: updatedRequirements,
    }));
  };

  const handleStepChange = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const updatedSteps = [...formData.steps!];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      steps: updatedSteps,
    }));
  };

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...(prev.steps || []), { title: "", description: "" }],
    }));
  };

  const removeStep = (index: number) => {
    const updatedSteps = [...formData.steps!];
    updatedSteps.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      steps: updatedSteps,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.title?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a title for the service guide.",
        variant: "destructive",
      });
      return;
    }

    // Filter out empty requirements and steps
    const cleanedData = {
      ...formData,
      requirements: formData.requirements?.filter((req) => req.trim()),
      steps: formData.steps?.filter(
        (step) => step.title.trim() || step.description.trim()
      ),
    };

    try {
      await dispatch(
        updateServiceGuide({
          guideId,
          data: cleanedData,
        })
      ).unwrap();

      toast({
        title: "Success",
        description: "Service guide updated successfully.",
      });

      router.push(`/government/services/${guideId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update service guide. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">
              {t("error_loading_service")}
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button asChild>
              <Link href="/government/services">{t("back_to_services")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/government/services/${guideId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
          {t("edit_service")}
        </h2>
      </div>

      {loading && !guide ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>{t("service_information")}</CardTitle>
              <CardDescription>{t("update_service_details")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="office_id">{t("office")}</Label>
                <Select
                  value={formData.office_id}
                  onValueChange={(value) =>
                    handleSelectChange("office_id", value)
                  }
                  disabled={
                    user?.role === "official" &&
                    user?.offices &&
                    user.offices.length === 1
                  } // Only disable if official has exactly one office
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_office")} />
                  </SelectTrigger>
                  <SelectContent>
                    {user?.role === "official" && user?.offices
                      ? // Show only assigned offices for government officials
                        user.offices.map((assignment) => (
                          <SelectItem
                            key={assignment.office_id}
                            value={assignment.office_id}
                          >
                            {assignment.office_name}
                            {assignment.is_primary && (
                              <span className="ml-2 text-xs text-blue-600">
                                ({t("primary")})
                              </span>
                            )}
                          </SelectItem>
                        ))
                      : // Show all offices for admins and other users
                        offices.map((office) => (
                          <SelectItem
                            key={office.office_id}
                            value={office.office_id}
                          >
                            {office.name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
                {user?.role === "official" && user?.offices && (
                  <div className="text-sm text-muted-foreground">
                    {user.offices.length === 1 ? (
                      <p>{t("office_pre_selected_single_assignment")}</p>
                    ) : (
                      <p>
                        {t("select_from_assigned_offices", {
                          count: user.offices.length,
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">{t("service_name")}</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={t("service_name_placeholder")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t("description_placeholder")}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t("category")}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">{t("general")}</SelectItem>
                    <SelectItem value="ID & Documentation">
                      {t("id_documentation")}
                    </SelectItem>
                    <SelectItem value="Business">{t("business")}</SelectItem>
                    <SelectItem value="Property">{t("property")}</SelectItem>
                    <SelectItem value="Education">{t("education")}</SelectItem>
                    <SelectItem value="Health">{t("health")}</SelectItem>
                    <SelectItem value="Transportation">
                      {t("transportation")}
                    </SelectItem>
                    <SelectItem value="Taxes">{t("taxes")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t("requirements")}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRequirement}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t("add")}
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.requirements?.map((req, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={req}
                        onChange={(e) =>
                          handleRequirementChange(index, e.target.value)
                        }
                        placeholder={t("requirement_placeholder")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeRequirement(index)}
                        disabled={formData.requirements?.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t("steps")}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStep}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t("add")}
                  </Button>
                </div>
                <div className="space-y-4">
                  {formData.steps?.map((step, index) => (
                    <Card key={index}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">
                            {t("step")} {index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStep(index)}
                            disabled={formData.steps?.length <= 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-2">
                        <div className="space-y-1">
                          <Label htmlFor={`step-title-${index}`}>
                            {t("title")}
                          </Label>
                          <Input
                            id={`step-title-${index}`}
                            value={step.title}
                            onChange={(e) =>
                              handleStepChange(index, "title", e.target.value)
                            }
                            placeholder={t("step_title_placeholder")}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`step-description-${index}`}>
                            {t("description")}
                          </Label>
                          <Textarea
                            id={`step-description-${index}`}
                            value={step.description}
                            onChange={(e) =>
                              handleStepChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder={t("step_description_placeholder")}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="estimated_time">{t("estimated_time")}</Label>
                  <Input
                    id="estimated_time"
                    name="estimated_time"
                    value={formData.estimated_time}
                    onChange={handleInputChange}
                    placeholder={t("estimated_time_placeholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fees">{t("fees")}</Label>
                  <Input
                    id="fees"
                    name="fees"
                    value={formData.fees}
                    onChange={handleInputChange}
                    placeholder={t("fees_placeholder")}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/government/services/${guideId}`}>
                  {t("cancel")}
                </Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t("saving") : t("save_changes")}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
