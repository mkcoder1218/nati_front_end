"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/lib/translation-context";

interface TimeSlot {
  open: string;
  close: string;
}

interface DaySchedule {
  isOpen: boolean;
  timeSlots: TimeSlot[];
}

interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  is24x7: boolean;
}

interface OperatingHoursSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const DEFAULT_OPERATING_HOURS: OperatingHours = {
  monday: { isOpen: true, timeSlots: [{ open: "09:00", close: "17:00" }] },
  tuesday: { isOpen: true, timeSlots: [{ open: "09:00", close: "17:00" }] },
  wednesday: { isOpen: true, timeSlots: [{ open: "09:00", close: "17:00" }] },
  thursday: { isOpen: true, timeSlots: [{ open: "09:00", close: "17:00" }] },
  friday: { isOpen: true, timeSlots: [{ open: "09:00", close: "17:00" }] },
  saturday: { isOpen: false, timeSlots: [{ open: "09:00", close: "13:00" }] },
  sunday: { isOpen: false, timeSlots: [{ open: "09:00", close: "13:00" }] },
  is24x7: false,
};

export function OperatingHoursSelector({
  value,
  onChange,
}: OperatingHoursSelectorProps) {
  const { t } = useTranslation();
  const [activeDay, setActiveDay] = useState<string>("monday");
  const [hours, setHours] = useState<OperatingHours>(DEFAULT_OPERATING_HOURS);

  // Parse initial value if provided
  useEffect(() => {
    if (!value) return;

    try {
      // Handle the special case for 24/7
      if (value === "24/7") {
        setHours({
          ...DEFAULT_OPERATING_HOURS,
          is24x7: true,
        });
        return;
      }

      // Try to parse as JSON
      const parsedValue = JSON.parse(value);

      // Check if it's our compact format (keys are comma-separated day lists)
      if (parsedValue && typeof parsedValue === "object") {
        // Check if it's the compact format or the full format
        const isCompactFormat = Object.keys(parsedValue).some((key) =>
          key.includes(",")
        );

        if (isCompactFormat) {
          // Expand the compact format back to full format
          const expandedHours = { ...DEFAULT_OPERATING_HOURS };

          Object.entries(parsedValue).forEach(([daysStr, scheduleData]) => {
            const days = daysStr.split(",");
            const schedule = scheduleData as any;

            days.forEach((day) => {
              if (day in expandedHours) {
                // Set isOpen status
                expandedHours[day as keyof OperatingHours].isOpen =
                  schedule.isOpen;

                // Parse time slots
                if (schedule.slots) {
                  const timeSlots = schedule.slots
                    .split(",")
                    .map((slotStr: string) => {
                      const [open, close] = slotStr.split("-");
                      return { open, close };
                    });

                  if (timeSlots.length > 0) {
                    expandedHours[day as keyof OperatingHours].timeSlots =
                      timeSlots;
                  }
                }
              }
            });
          });

          setHours(expandedHours);
        } else {
          // It's the full format or some other object
          // Ensure the parsed object has the expected structure
          const validatedHours = {
            ...DEFAULT_OPERATING_HOURS,
            ...parsedValue,
          };
          setHours(validatedHours);
        }
      }
    } catch (error) {
      // If the value is not valid JSON, use it as a simple string description
      // This handles backward compatibility with the old format
      console.log("Using legacy operating hours format:", value);
    }
  }, [value]);

  // Update parent component when hours change
  // Using a ref to prevent infinite loops
  const isInitialMount = useRef(true);

  // Function to create a compact representation of operating hours
  const createCompactHours = (hoursData: OperatingHours): string => {
    if (hoursData.is24x7) {
      return "24/7";
    }

    // Create a compact representation that fits within VARCHAR(255)
    const compact: Record<string, any> = {};

    // Group days with the same schedule
    const scheduleMap = new Map<string, string[]>();

    Object.entries(hoursData).forEach(([day, schedule]) => {
      if (day === "is24x7") return;

      // Create a string key representing this schedule
      const scheduleKey = JSON.stringify({
        isOpen: schedule.isOpen,
        slots: schedule.timeSlots
          .map((slot) => `${slot.open}-${slot.close}`)
          .join(","),
      });

      if (!scheduleMap.has(scheduleKey)) {
        scheduleMap.set(scheduleKey, []);
      }

      scheduleMap.get(scheduleKey)!.push(day);
    });

    // Create the compact representation
    scheduleMap.forEach((days, scheduleKey) => {
      const schedule = JSON.parse(scheduleKey);
      compact[days.join(",")] = schedule;
    });

    return JSON.stringify(compact);
  };

  useEffect(() => {
    // Skip the first render to prevent circular updates
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Use a timeout to break the potential update cycle
    const timeoutId = setTimeout(() => {
      // Use the compact representation for storage
      onChange(createCompactHours(hours));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [hours, onChange]);

  const handleDayToggle = (day: string, isOpen: boolean) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day as keyof OperatingHours] as DaySchedule),
        isOpen,
      },
    }));
  };

  const handle24x7Toggle = (is24x7: boolean) => {
    setHours((prev) => ({
      ...prev,
      is24x7,
    }));
  };

  const handleTimeSlotChange = (
    day: string,
    index: number,
    field: "open" | "close",
    value: string
  ) => {
    setHours((prev) => {
      const daySchedule = prev[day as keyof OperatingHours] as DaySchedule;
      const updatedTimeSlots = [...daySchedule.timeSlots];
      updatedTimeSlots[index] = {
        ...updatedTimeSlots[index],
        [field]: value,
      };

      return {
        ...prev,
        [day]: {
          ...daySchedule,
          timeSlots: updatedTimeSlots,
        },
      };
    });
  };

  const addTimeSlot = (day: string) => {
    setHours((prev) => {
      const daySchedule = prev[day as keyof OperatingHours] as DaySchedule;
      return {
        ...prev,
        [day]: {
          ...daySchedule,
          timeSlots: [
            ...daySchedule.timeSlots,
            { open: "09:00", close: "17:00" },
          ],
        },
      };
    });
  };

  const removeTimeSlot = (day: string, index: number) => {
    setHours((prev) => {
      const daySchedule = prev[day as keyof OperatingHours] as DaySchedule;
      const updatedTimeSlots = [...daySchedule.timeSlots];
      updatedTimeSlots.splice(index, 1);

      return {
        ...prev,
        [day]: {
          ...daySchedule,
          timeSlots:
            updatedTimeSlots.length > 0
              ? updatedTimeSlots
              : [{ open: "09:00", close: "17:00" }], // Always keep at least one time slot
        },
      };
    });
  };

  const copyToAllDays = () => {
    const currentDaySchedule = hours[
      activeDay as keyof OperatingHours
    ] as DaySchedule;

    setHours((prev) => {
      const updatedHours = { ...prev };

      (Object.keys(updatedHours) as Array<keyof OperatingHours>).forEach(
        (day) => {
          if (day !== activeDay && day !== "is24x7") {
            updatedHours[day] = {
              isOpen: currentDaySchedule.isOpen,
              timeSlots: JSON.parse(
                JSON.stringify(currentDaySchedule.timeSlots)
              ),
            };
          }
        }
      );

      return updatedHours;
    });
  };

  const applyWeekdaySchedule = () => {
    const currentDaySchedule = hours[
      activeDay as keyof OperatingHours
    ] as DaySchedule;

    setHours((prev) => {
      const updatedHours = { ...prev };

      ["monday", "tuesday", "wednesday", "thursday", "friday"].forEach(
        (day) => {
          updatedHours[day as keyof OperatingHours] = {
            isOpen: currentDaySchedule.isOpen,
            timeSlots: JSON.parse(JSON.stringify(currentDaySchedule.timeSlots)),
          };
        }
      );

      return updatedHours;
    });
  };

  const applyWeekendSchedule = () => {
    const currentDaySchedule = hours[
      activeDay as keyof OperatingHours
    ] as DaySchedule;

    setHours((prev) => {
      const updatedHours = { ...prev };

      ["saturday", "sunday"].forEach((day) => {
        updatedHours[day as keyof OperatingHours] = {
          isOpen: currentDaySchedule.isOpen,
          timeSlots: JSON.parse(JSON.stringify(currentDaySchedule.timeSlots)),
        };
      });

      return updatedHours;
    });
  };

  // Generate a human-readable summary of operating hours
  const generateSummary = () => {
    if (hours.is24x7) {
      return t("open_24_7");
    }

    const daysOpen = Object.entries(hours)
      .filter(([key, value]) => key !== "is24x7" && value.isOpen)
      .map(([key]) => t(key));

    const daysClosed = Object.entries(hours)
      .filter(([key, value]) => key !== "is24x7" && !value.isOpen)
      .map(([key]) => t(key));

    if (daysOpen.length === 0) {
      return t("closed_all_week");
    }

    if (daysOpen.length === 7) {
      const mondayHours = hours.monday.timeSlots
        .map((slot) => `${slot.open} - ${slot.close}`)
        .join(", ");
      return t("open_all_week", { hours: mondayHours });
    }

    let summary = "";

    if (daysOpen.length > 0) {
      const mondayHours = hours.monday.timeSlots
        .map((slot) => `${slot.open} - ${slot.close}`)
        .join(", ");
      summary += t("open_days", {
        days: daysOpen.join(", "),
        hours: mondayHours,
      });
    }

    if (daysClosed.length > 0) {
      if (summary) summary += ". ";
      summary += t("closed_days", { days: daysClosed.join(", ") });
    }

    return summary;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="24-7-mode"
                checked={hours.is24x7}
                onCheckedChange={handle24x7Toggle}
              />
              <Label htmlFor="24-7-mode">{t("open_24_7")}</Label>
            </div>
          </div>

          {!hours.is24x7 && (
            <Tabs value={activeDay} onValueChange={setActiveDay}>
              <TabsList className="grid grid-cols-7">
                <TabsTrigger value="monday">{t("mon")}</TabsTrigger>
                <TabsTrigger value="tuesday">{t("tue")}</TabsTrigger>
                <TabsTrigger value="wednesday">{t("wed")}</TabsTrigger>
                <TabsTrigger value="thursday">{t("thu")}</TabsTrigger>
                <TabsTrigger value="friday">{t("fri")}</TabsTrigger>
                <TabsTrigger value="saturday">{t("sat")}</TabsTrigger>
                <TabsTrigger value="sunday">{t("sun")}</TabsTrigger>
              </TabsList>

              {(
                [
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday",
                ] as const
              ).map((day) => (
                <TabsContent key={day} value={day} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`${day}-open`}
                        checked={hours[day].isOpen}
                        onCheckedChange={(checked) =>
                          handleDayToggle(day, checked)
                        }
                      />
                      <Label htmlFor={`${day}-open`}>
                        {hours[day].isOpen ? t("open") : t("closed")}
                      </Label>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyToAllDays}
                      >
                        {t("copy_to_all_days")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={applyWeekdaySchedule}
                      >
                        {t("apply_to_weekdays")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={applyWeekendSchedule}
                      >
                        {t("apply_to_weekend")}
                      </Button>
                    </div>
                  </div>

                  {hours[day].isOpen && (
                    <div className="space-y-2">
                      {hours[day].timeSlots.map((slot, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {t("time_slot")} {index + 1}:
                            </span>
                          </div>
                          <Input
                            type="time"
                            value={slot.open}
                            onChange={(e) =>
                              handleTimeSlotChange(
                                day,
                                index,
                                "open",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                          <span>-</span>
                          <Input
                            type="time"
                            value={slot.close}
                            onChange={(e) =>
                              handleTimeSlotChange(
                                day,
                                index,
                                "close",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />

                          <div className="flex gap-1 ml-auto">
                            {hours[day].timeSlots.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTimeSlot(day, index)}
                              >
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                            {index === hours[day].timeSlots.length - 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => addTimeSlot(day)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}

          <div className="mt-4 rounded-md bg-muted p-3">
            <h4 className="mb-1 font-medium">{t("summary")}</h4>
            <p className="text-sm text-muted-foreground">{generateSummary()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
