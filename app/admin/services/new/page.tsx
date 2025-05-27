"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

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
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useToast } from "@/hooks/use-toast";
import { createServiceGuide } from "@/store/slices/serviceGuideSlice";
import { fetchAllOffices } from "@/store/slices/officeSlice";
import type { CreateServiceGuideData } from "@/services/serviceGuide.service";

export default function AddServicePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const { offices, loading: officesLoading } = useAppSelector(
    (state) => state.office
  );
  const { loading: serviceLoading } = useAppSelector(
    (state) => state.serviceGuide
  );

  const [formData, setFormData] = useState<CreateServiceGuideData>({
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch offices on component mount
  useEffect(() => {
    dispatch(fetchAllOffices());
  }, [dispatch]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    field: keyof CreateServiceGuideData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Requirements management
  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req, i) =>
        i === index ? value : req
      ),
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  // Steps management
  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, { title: "", description: "" }],
    }));
  };

  const updateStep = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      ),
    }));
  };

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.office_id) {
      toast({
        title: "Validation Error",
        description: "Please select an office.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a service title.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a service description.",
        variant: "destructive",
      });
      return;
    }

    // Filter out empty requirements and steps
    const cleanedData = {
      ...formData,
      requirements: formData.requirements.filter((req) => req.trim()),
      steps: formData.steps.filter(
        (step) => step.title.trim() || step.description.trim()
      ),
    };

    setIsSubmitting(true);

    try {
      await dispatch(createServiceGuide(cleanedData)).unwrap();

      toast({
        title: "Success",
        description: "Service created successfully!",
      });

      router.push("/admin/services");
    } catch (error) {
      console.error("Error creating service:", error);
      toast({
        title: "Error",
        description: "Failed to create service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/services">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Add New Service</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
            <CardDescription>
              Enter the details of the new government service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="office_id">Office *</Label>
              <Select
                value={formData.office_id}
                onValueChange={(value) =>
                  handleSelectChange("office_id", value)
                }
                required
              >
                <SelectTrigger id="office_id">
                  <SelectValue placeholder="Select office" />
                </SelectTrigger>
                <SelectContent>
                  {offices.map((office) => (
                    <SelectItem key={office.office_id} value={office.office_id}>
                      {office.name} ({office.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Service Name *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., ID Card Application"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Personal Documents">
                    Personal Documents
                  </SelectItem>
                  <SelectItem value="Business Services">
                    Business Services
                  </SelectItem>
                  <SelectItem value="Property Services">
                    Property Services
                  </SelectItem>
                  <SelectItem value="Tax Services">Tax Services</SelectItem>
                  <SelectItem value="Other">Other Services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the service"
                rows={3}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="estimated_time">
                  Estimated Processing Time
                </Label>
                <Input
                  id="estimated_time"
                  name="estimated_time"
                  value={formData.estimated_time}
                  onChange={handleInputChange}
                  placeholder="e.g., 1-3 days"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fees">Fees</Label>
                <Input
                  id="fees"
                  name="fees"
                  value={formData.fees}
                  onChange={handleInputChange}
                  placeholder="e.g., 100 Birr"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Requirements</Label>
              <div className="space-y-2">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={req}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder="Enter a requirement"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRequirement(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRequirement}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Requirement
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Step-by-Step Guide</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
              <div className="space-y-4">
                {formData.steps.map((step, index) => (
                  <div key={index} className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Step {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`step-title-${index}`}>Title</Label>
                      <Input
                        id={`step-title-${index}`}
                        value={step.title}
                        onChange={(e) =>
                          updateStep(index, "title", e.target.value)
                        }
                        placeholder="e.g., Gather Required Documents"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`step-desc-${index}`}>Description</Label>
                      <Textarea
                        id={`step-desc-${index}`}
                        value={step.description}
                        onChange={(e) =>
                          updateStep(index, "description", e.target.value)
                        }
                        placeholder="Detailed instructions for this step"
                        rows={2}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/admin/services">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting || serviceLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Creating Service..." : "Create Service"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
