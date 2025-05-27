"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Plus, Save, X } from "lucide-react";
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
import { toast } from "sonner";
import { addDays, format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { createScheduledReport } from "@/store/slices/scheduledReportSlice";

export default function ScheduleReportPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { creating } = useAppSelector((state) => state.scheduledReport);
  const { user } = useAppSelector((state) => state.auth);

  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState("");
  const [frequency, setFrequency] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState("");
  const [notes, setNotes] = useState("");

  // Calculate next run date based on frequency
  const getNextRunDate = () => {
    const today = new Date();
    switch (frequency) {
      case "daily":
        return addDays(today, 1);
      case "weekly":
        return addDays(today, 7);
      case "monthly":
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      case "quarterly":
        const nextQuarter = new Date(today);
        nextQuarter.setMonth(nextQuarter.getMonth() + 3);
        return nextQuarter;
      default:
        return today;
    }
  };

  // Add a recipient
  const handleAddRecipient = () => {
    if (!newRecipient) return;

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient)) {
      toast.error(t("invalid_email"));
      return;
    }

    if (recipients.includes(newRecipient)) {
      toast.error(t("recipient_already_added"));
      return;
    }

    setRecipients([...recipients, newRecipient]);
    setNewRecipient("");
  };

  // Remove a recipient
  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !reportType || !frequency || recipients.length === 0) {
      toast.error(t("please_fill_all_fields"));
      return;
    }

    if (!user) {
      toast.error(t("user_not_authenticated"));
      return;
    }

    try {
      await dispatch(
        createScheduledReport({
          title,
          report_type: reportType as
            | "sentiment"
            | "feedback"
            | "performance"
            | "services",
          frequency: frequency as "daily" | "weekly" | "monthly" | "quarterly",
          office_id: user.role === "official" ? user.office_id : undefined,
          recipients,
          notes: notes || undefined,
        })
      ).unwrap();

      toast.success(t("report_scheduled"));
      router.push("/government/reports");
    } catch (error) {
      console.error("Failed to create scheduled report:", error);
      toast.error(
        typeof error === "string" ? error : t("failed_to_schedule_report")
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/government/reports">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
          {t("schedule_report")}
        </h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{t("schedule_new_report")}</CardTitle>
            <CardDescription>
              {t("schedule_report_description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("report_title")}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("enter_report_title")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-type">{t("report_type")}</Label>
              <Select value={reportType} onValueChange={setReportType} required>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder={t("select_report_type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feedback">
                    {t("feedback_analysis")}
                  </SelectItem>
                  <SelectItem value="performance">
                    {t("performance_report")}
                  </SelectItem>
                  <SelectItem value="services">{t("service_usage")}</SelectItem>
                  <SelectItem value="sentiment">
                    {t("sentiment_analysis")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">{t("frequency")}</Label>
              <Select value={frequency} onValueChange={setFrequency} required>
                <SelectTrigger id="frequency">
                  <SelectValue placeholder={t("select_frequency")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t("daily")}</SelectItem>
                  <SelectItem value="weekly">{t("weekly")}</SelectItem>
                  <SelectItem value="monthly">{t("monthly")}</SelectItem>
                  <SelectItem value="quarterly">{t("quarterly")}</SelectItem>
                </SelectContent>
              </Select>

              {frequency && (
                <p className="text-sm text-muted-foreground">
                  {t("next_run")}: {format(getNextRunDate(), "MMMM d, yyyy")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("recipients")}</Label>
              <div className="flex gap-2">
                <Input
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  placeholder={t("enter_email")}
                  type="email"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddRecipient}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {recipients.length > 0 && (
                <div className="mt-2 space-y-2">
                  {recipients.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <span className="text-sm">{email}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRecipient(email)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("notes")}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("enter_notes")}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/government/reports")}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  {t("scheduling")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t("schedule_report")}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
