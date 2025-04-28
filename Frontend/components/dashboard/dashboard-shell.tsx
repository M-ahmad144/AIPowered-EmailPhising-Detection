import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface DashboardShellProps {
  children: ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className={cn("flex flex-col space-y-4 p-4 md:p-12", className)}>
      {children}
    </div>
  );
}
