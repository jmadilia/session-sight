"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

type DateRange = "7d" | "30d" | "90d" | "custom";

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  customStartDate: Date | null;
  customEndDate: Date | null;
  onCustomStartDateChange: (date: Date | null) => void;
  onCustomEndDateChange: (date: Date | null) => void;
}

export function DateRangeFilter({
  value,
  onChange,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange,
}: DateRangeFilterProps) {
  const startDateString = customStartDate
    ? format(customStartDate, "yyyy-MM-dd")
    : "";
  const endDateString = customEndDate
    ? format(customEndDate, "yyyy-MM-dd")
    : "";

  const parseLocalDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        <Button
          variant={value === "7d" ? "default" : "outline"}
          size="sm"
          onClick={() => onChange("7d")}>
          7 Days
        </Button>
        <Button
          variant={value === "30d" ? "default" : "outline"}
          size="sm"
          onClick={() => onChange("30d")}>
          30 Days
        </Button>
        <Button
          variant={value === "90d" ? "default" : "outline"}
          size="sm"
          onClick={() => onChange("90d")}>
          90 Days
        </Button>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={value === "custom" ? "default" : "outline"}
            size="sm">
            <CalendarIcon className="w-4 h-4 mr-2" />
            {value === "custom" && customStartDate && customEndDate
              ? `${format(customStartDate, "MMM d")} - ${format(
                  customEndDate,
                  "MMM d"
                )}`
              : "Custom"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="start-date" className="text-sm font-medium">
                Start Date
              </label>
              <Input
                id="start-date"
                type="date"
                value={startDateString}
                onChange={(e) => {
                  const date = parseLocalDate(e.target.value);
                  onCustomStartDateChange(date);
                  onChange("custom");
                }}
                max={endDateString || undefined}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="end-date" className="text-sm font-medium">
                End Date
              </label>
              <Input
                id="end-date"
                type="date"
                value={endDateString}
                onChange={(e) => {
                  const date = parseLocalDate(e.target.value);
                  onCustomEndDateChange(date);
                  onChange("custom");
                }}
                min={startDateString || undefined}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

