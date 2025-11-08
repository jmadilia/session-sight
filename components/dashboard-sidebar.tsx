"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Home,
  Users,
  FileText,
  TrendingUp,
  Settings,
  Building2,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Sessions", href: "/dashboard/sessions", icon: FileText },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { name: "Organization", href: "/dashboard/organization", icon: Building2 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-border bg-gradient-to-b from-background to-muted/20">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 transition-transform duration-200 group-hover:scale-110" />
          <span className="font-semibold text-lg">SessionSight</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
              )}>
              <item.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
