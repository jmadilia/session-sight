"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AppointmentsFilterProps {
  statusFilter: string[];
  dateRange: { start: string; end: string };
  onStatusFilterChange: (status: string[]) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onClearFilters: () => void;
}

export function AppointmentsFilter({
  statusFilter,
  dateRange,
  onStatusFilterChange,
  onDateRangeChange,
  onClearFilters,
}: AppointmentsFilterProps) {
  const statuses = ["scheduled", "confirmed", "cancelled", "completed"];

  const toggleStatus = (status: string) => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange(statusFilter.filter((s) => s !== status));
    } else {
      onStatusFilterChange([...statusFilter, status]);
    }
  };

  const hasActiveFilters =
    statusFilter.length > 0 || dateRange.start || dateRange.end;

  const activeFilterCount =
    statusFilter.length + (dateRange.start || dateRange.end ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="ml-1 px-1 min-w-[1.25rem] h-5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statuses.map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={statusFilter.includes(status)}
              onCheckedChange={() => toggleStatus(status)}
              onSelect={(e) => e.preventDefault()}
              className="capitalize">
              {status}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Filter by Date Range</DropdownMenuLabel>
          <div
            className="p-2 space-y-2"
            onSelect={(e: any) => e.preventDefault()}>
            <div>
              <Label htmlFor="appt-start-date" className="text-xs">
                Start Date
              </Label>
              <Input
                id="appt-start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  onDateRangeChange({ ...dateRange, start: e.target.value })
                }
                className="h-8 w-full"
              />
            </div>
            <div>
              <Label htmlFor="appt-end-date" className="text-xs">
                End Date
              </Label>
              <Input
                id="appt-end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  onDateRangeChange({ ...dateRange, end: e.target.value })
                }
                className="h-8 w-full"
              />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="gap-2">
          <X className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  );
}

