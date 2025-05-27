"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

import { LanguageSwitcher } from "@/components/language-switcher";
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
import { useTranslation } from "@/lib/translation-context";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { login, clearError } from "@/store/slices/authSlice";

export default function SignInPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated, user } = useAppSelector(
    (state) => state.auth
  );

  // Form state
  const [formState, setFormState] = useState({
    emailOrPhone: "",
    password: "",
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple login attempts if already loading
    if (loading) {
      console.log("Login already in progress, ignoring additional submit");
      return;
    }

    // No more demo accounts with fake tokens - use the real backend authentication
    // The database has been seeded with these accounts, so they should work with the real backend

    // Determine if input is email or phone number
    const isEmail = formState.emailOrPhone.includes("@");

    // Prepare login data based on input type
    const loginData = {
      [isEmail ? "email" : "phone_number"]: formState.emailOrPhone,
      password: formState.password,
    };

    // Dispatch login action
    console.log("Dispatching login action with:", {
      [isEmail ? "email" : "phone_number"]: formState.emailOrPhone,
    });
    dispatch(login(loginData));
  };

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success(`${t("welcome_back")}, ${user.full_name}!`);

      // Redirect based on user role
      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "official") {
        router.push("/government");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, router, t]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 font-bold text-lg text-primary"
      >
        <Building2 className="h-5 w-5" />
        <span>{t("app_name")}</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t("sign_in")}</CardTitle>
          <CardDescription>{t("sign_in_desc")}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="emailOrPhone">
                {t("email")} / {t("phone_number")}
              </Label>
              <Input
                id="emailOrPhone"
                name="emailOrPhone"
                type="text"
                placeholder="example@example.com or 0911234567"
                value={formState.emailOrPhone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary underline"
                >
                  {t("forgot_password")}
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                value={formState.password}
                onChange={handleChange}
                required
              />
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? t("signing_in") : t("sign_in")}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t("dont_have_account")}{" "}
              <Link href="/sign-up" className="text-primary underline">
                {t("sign_up")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
