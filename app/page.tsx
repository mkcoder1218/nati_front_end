"use client";

import Link from "next/link";
import { ArrowRight, Building2, MessageSquare, Star } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/translation-context";
import { useAppSelector } from "@/hooks/use-redux";

export default function LandingPage() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-soft">
        <div className="container-enhanced flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-2xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <span className="text-gradient">{t("app_name")}</span>
          </div>
          <nav className="flex items-center gap-6">
            <LanguageSwitcher />

            {/* Show API Tests link only for admin users */}
            {isAuthenticated && user?.role === "admin" && (
              <Link href="/api-test" className="text-sm font-medium">
                API Tests
              </Link>
            )}

            {/* Show Government link only for government officials */}
            {isAuthenticated && user?.role === "government" && (
              <Link href="/government-test" className="text-sm font-medium">
                Government
              </Link>
            )}

            {/* Show Admin link only for admin users */}
            {isAuthenticated && user?.role === "admin" && (
              <Link href="/admin-test" className="text-sm font-medium">
                Admin
              </Link>
            )}

            {/* Show sign in/sign up links only when not authenticated */}
            {!isAuthenticated && (
              <>
                <Link href="/sign-in" className="text-sm font-medium">
                  {t("sign_in")}
                </Link>
                <Link href="/sign-up">
                  <Button>{t("get_started")}</Button>
                </Link>
              </>
            )}

            {/* Show dashboard link when authenticated */}
            {isAuthenticated && (
              <Link href="/dashboard" className="text-sm font-medium">
                {t("dashboard")}
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container-enhanced section-padding bg-gradient-primary">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center space-y-8 animate-fade-in">
              <div className="space-y-6">
                <h1 className="text-gradient font-bold leading-tight">
                  {t("hero_title")}
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                  {t("hero_subtitle")}
                </p>
              </div>
              <div className="flex flex-col gap-4 min-[400px]:flex-row">
                <Link href="/sign-up" className="flex-1">
                  <Button
                    variant="gradient"
                    size="xl"
                    className="w-full shadow-medium hover:shadow-strong"
                  >
                    {t("get_started")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard/services" className="flex-1">
                  <Button size="xl" variant="glass" className="w-full">
                    {t("explore_services")}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center animate-slide-up">
              <div className="relative h-[450px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-6 shadow-dramatic">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg">
                          {t("find_offices")}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("find_offices_desc")}
                      </p>
                    </div>
                    <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <Star className="h-6 w-6 text-accent" />
                        </div>
                        <h3 className="font-semibold text-lg">
                          {t("rate_review")}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("rate_review_desc")}
                      </p>
                    </div>
                    <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <MessageSquare className="h-6 w-6 text-success" />
                        </div>
                        <h3 className="font-semibold text-lg">
                          {t("community_feedback")}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("see_what_others_saying")}
                      </p>
                    </div>
                    <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-warning/10 rounded-lg">
                          <ArrowRight className="h-6 w-6 text-warning" />
                        </div>
                        <h3 className="font-semibold text-lg">
                          {t("service_guides")}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("step_by_step_guides")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-muted py-12 md:py-24 lg:py-32">
          <div className="container space-y-12 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t("how_it_works")}
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  {t("how_it_works_subtitle")}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{t("find_offices")}</h3>
                <p className="text-center text-muted-foreground">
                  {t("find_offices_desc")}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Star className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{t("rate_review")}</h3>
                <p className="text-center text-muted-foreground">
                  {t("rate_review_desc")}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{t("access_services")}</h3>
                <p className="text-center text-muted-foreground">
                  {t("access_services_desc")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Building2 className="h-5 w-5 text-primary" />
            <span>{t("app_name")}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Negari. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">
              {t("terms")}
            </Link>
            <Link href="#" className="hover:underline">
              {t("privacy")}
            </Link>
            <Link href="#" className="hover:underline">
              {t("contact")}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
