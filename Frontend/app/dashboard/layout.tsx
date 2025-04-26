import type React from "react";
import { MainNav } from "@/components/dashboard/main-nav";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-background border-b">
        <div className="flex items-center px-4 md:px-8 h-16">
          <MainNav />
        </div>
      </div>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
