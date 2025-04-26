"use client";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "@/components/dashboard/overview";
import { RecentUsers } from "@/components/dashboard/recent-users";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data: totalUsersData, isLoading: isLoadingTotalUsers } = useSWR(
    "/api/admin/dashboard?type=total-users",
    fetcher
  );

  const { data: newSignupsData, isLoading: isLoadingNewSignups } = useSWR(
    "/api/admin/dashboard?type=new-signups",
    fetcher
  );

  const { data: adminUsersData, isLoading: isLoadingAdminUsers } = useSWR(
    "/api/admin/dashboard?type=admin-users",
    fetcher
  );

  const { data: userActivityData, isLoading: isLoadingUserActivity } = useSWR(
    "/api/admin/dashboard?type=user-activity",
    fetcher
  );

  // Transform user activity data for the chart
  const chartData =
    userActivityData?.userActivity?.map((item) => ({
      name: item.date,
      total: item.count,
    })) || [];

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Overview of your system" />

      {/* Stats Cards Grid */}
      <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Users</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="w-4 h-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoadingTotalUsers ? (
              <Skeleton className="w-20 h-8" />
            ) : (
              <div className="font-bold text-2xl">
                {totalUsersData?.totalUsers || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">New Signups</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="w-4 h-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoadingNewSignups ? (
              <div>
                <Skeleton className="mb-1 w-20 h-8" />
                <Skeleton className="w-24 h-4" />
              </div>
            ) : (
              <>
                <div className="font-bold text-2xl">
                  {newSignupsData?.newSignups || 0}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Admin Users</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="w-4 h-4 text-admin-foreground"
            >
              <path
                d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                fill="#FFC107"
              />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoadingAdminUsers ? (
              <Skeleton className="w-20 h-8" />
            ) : (
              <div className="font-bold text-2xl">
                {adminUsersData?.adminUsers || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="gap-4 grid grid-cols-1 lg:grid-cols-7 mt-4">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>
              User activity over the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoadingUserActivity ? (
              <div className="flex justify-center items-center w-full h-80">
                <Skeleton className="w-full h-64" />
              </div>
            ) : (
              <Overview data={chartData} />
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>
              Recently added users to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentUsers />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
