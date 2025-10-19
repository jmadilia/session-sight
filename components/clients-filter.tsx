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

interface ClientsFilterProps {
  statusFilter: string[];
  onStatusFilterChange: (status: string[]) => void;
  onClearFilters: () => void;
}

export function ClientsFilter({
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
}: ClientsFilterProps) {
  const statuses = ["active", "inactive", "archived"];

  const toggleStatus = (status: string) => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange(statusFilter.filter((s) => s !== status));
    } else {
      onStatusFilterChange([...statusFilter, status]);
    }
  };

  const hasActiveFilters = statusFilter.length > 0;

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
                {statusFilter.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
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

