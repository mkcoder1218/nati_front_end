"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { register, clearError } from "@/store/slices/authSlice";

export default function SignUpPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    woreda: "",
    kebele: "",
    subcity: "",
    password: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Clear any auth errors when component mounts or unmounts
  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Redirect if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // For phone number, only allow numeric input starting with 0
    if (name === "phoneNumber") {
      // Only allow digits and ensure it starts with 0
      const numericValue = value.replace(/[^0-9]/g, "");

      // If the first character is not 0 and the field is not empty, force it to start with 0
      const formattedValue =
        numericValue.length > 0 && numericValue[0] !== "0"
          ? "0" + numericValue
          : numericValue;

      // Limit to 10 digits (Ethiopian phone number format)
      const truncatedValue = formattedValue.slice(0, 10);

      setFormData((prev) => ({ ...prev, [name]: truncatedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field when user selects a value
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required field validation
    const requiredFields: Array<[string, string]> = [
      ["firstName", "First name is required"],
      ["lastName", "Last name is required"],
      ["email", "Email is required"],
      ["phoneNumber", "Phone number is required"],
      ["password", "Password is required"],
      ["confirmPassword", "Please confirm your password"],
    ];

    requiredFields.forEach(([field, message]) => {
      if (!formData[field as keyof typeof formData]?.trim()) {
        errors[field] = message;
      }
    });

    // Email format validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone number validation (Ethiopian format)
    if (!formData.phoneNumber) {
      errors.phoneNumber = "Phone number is required";
    } else if (formData.phoneNumber.length !== 10) {
      errors.phoneNumber = "Phone number must be 10 digits (e.g., 0911234567)";
    } else if (!/^0[0-9]{9}$/.test(formData.phoneNumber)) {
      errors.phoneNumber =
        "Phone number must start with 0 followed by 9 digits";
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Prepare data for API
    const userData = {
      email: formData.email,
      password: formData.password,
      full_name: `${formData.firstName} ${formData.lastName}`,
      phone_number: formData.phoneNumber,
    };

    try {
      await dispatch(register(userData)).unwrap();
      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error(error || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 font-bold text-lg text-primary"
      >
        <Building2 className="h-5 w-5" />
        <span>Negari</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your information to create your Negari account
          </CardDescription>
        </CardHeader>

        {error && (
          <Alert className="mx-6 mb-2 bg-red-50 border-red-200">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              Fields marked with <span className="text-red-500">*</span> are
              required
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={validationErrors.firstName ? "border-red-500" : ""}
                />
                {validationErrors.firstName && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={validationErrors.lastName ? "border-red-500" : ""}
                />
                {validationErrors.lastName && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={validationErrors.email ? "border-red-500" : ""}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                Phone number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                inputMode="numeric"
                placeholder="e.g., 0911234567"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={validationErrors.phoneNumber ? "border-red-500" : ""}
              />
              {validationErrors.phoneNumber && (
                <p className="text-sm text-red-500 mt-1">
                  {validationErrors.phoneNumber}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be a valid Ethiopian phone number (10 digits starting with
                0)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="woreda">Woreda</Label>
                <Select
                  value={formData.woreda}
                  onValueChange={(value) => handleSelectChange("woreda", value)}
                >
                  <SelectTrigger id="woreda">
                    <SelectValue placeholder="Select woreda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="woreda-1">Woreda 1</SelectItem>
                    <SelectItem value="woreda-2">Woreda 2</SelectItem>
                    <SelectItem value="woreda-3">Woreda 3</SelectItem>
                    <SelectItem value="woreda-4">Woreda 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kebele">Kebele</Label>
                <Select
                  value={formData.kebele}
                  onValueChange={(value) => handleSelectChange("kebele", value)}
                  disabled={!formData.woreda} // Disable if no woreda selected
                >
                  <SelectTrigger id="kebele">
                    <SelectValue placeholder="Select kebele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kebele-01">Kebele 01</SelectItem>
                    <SelectItem value="kebele-02">Kebele 02</SelectItem>
                    <SelectItem value="kebele-03">Kebele 03</SelectItem>
                    <SelectItem value="kebele-04">Kebele 04</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcity">Subcity (for urban areas)</Label>
              <Select
                value={formData.subcity}
                onValueChange={(value) => handleSelectChange("subcity", value)}
              >
                <SelectTrigger id="subcity">
                  <SelectValue placeholder="Select subcity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="addis-ketema">Addis Ketema</SelectItem>
                  <SelectItem value="akaky-kaliti">Akaky Kaliti</SelectItem>
                  <SelectItem value="arada">Arada</SelectItem>
                  <SelectItem value="bole">Bole</SelectItem>
                  <SelectItem value="kirkos">Kirkos</SelectItem>
                  <SelectItem value="lideta">Lideta</SelectItem>
                  <SelectItem value="nifas-silk-lafto">
                    Nifas Silk-Lafto
                  </SelectItem>
                  <SelectItem value="kolfe-keranio">Kolfe Keranio</SelectItem>
                  <SelectItem value="yeka">Yeka</SelectItem>
                  <SelectItem value="lemi-kura">Lemi Kura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={validationErrors.password ? "border-red-500" : ""}
              />
              {validationErrors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {validationErrors.password}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={
                  validationErrors.confirmPassword ? "border-red-500" : ""
                }
              />
              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
