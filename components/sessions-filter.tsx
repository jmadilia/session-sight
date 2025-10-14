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

interface SessionsFilterProps {
  statusFilter: string[];
  sessionTypeFilter: string[];
  dateRange: { start: string; end: string };
  onStatusFilterChange: (status: string[]) => void;
  onSessionTypeFilterChange: (types: string[]) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onClearFilters: () => void;
}

export function SessionsFilter({
  statusFilter,
  sessionTypeFilter,
  dateRange,
  onStatusFilterChange,
  onSessionTypeFilterChange,
  onDateRangeChange,
  onClearFilters,
}: SessionsFilterProps) {
  const statuses = ["completed", "cancelled", "no-show", "scheduled"];
  const sessionTypes = ["individual", "group", "family", "couples", "initial"];

  const toggleStatus = (status: string) => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange(statusFilter.filter((s) => s !== status));
    } else {
      onStatusFilterChange([...statusFilter, status]);
    }
  };

  const toggleSessionType = (type: string) => {
    if (sessionTypeFilter.includes(type)) {
      onSessionTypeFilterChange(sessionTypeFilter.filter((t) => t !== type));
    } else {
      onSessionTypeFilterChange([...sessionTypeFilter, type]);
    }
  };

  const hasActiveFilters =
    statusFilter.length > 0 ||
    sessionTypeFilter.length > 0 ||
    dateRange.start ||
    dateRange.end;

  const activeFilterCount =
    statusFilter.length +
    sessionTypeFilter.length +
    (dateRange.start || dateRange.end ? 1 : 0);

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
              className="capitalize">
              {status}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Filter by Session Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sessionTypes.map((type) => (
            <DropdownMenuCheckboxItem
              key={type}
              checked={sessionTypeFilter.includes(type)}
              onCheckedChange={() => toggleSessionType(type)}
              className="capitalize">
              {type}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Filter by Date Range</DropdownMenuLabel>
          <div className="p-2 space-y-2">
            <div>
              <Label htmlFor="start-date" className="text-xs">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  onDateRangeChange({ ...dateRange, start: e.target.value })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="end-date" className="text-xs">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  onDateRangeChange({ ...dateRange, end: e.target.value })
                }
                className="h-8"
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

