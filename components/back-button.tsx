"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href: string;
  label?: string;
}

export function BackButton({ href, label }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        console.log("[v0] Navigating to:", href);
        router.push(href);
      }}
      aria-label={label || "Go back"}>
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}

