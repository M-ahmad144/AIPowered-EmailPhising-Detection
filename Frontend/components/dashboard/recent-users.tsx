"use client";

import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function RecentUsers() {
  // Use the correct endpoint for fetching recent users
  const { data, error, isLoading } = useSWR("/api/admin/users/recent", fetcher);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="rounded-full w-9 h-9" />
            <div className="space-y-2">
              <Skeleton className="w-[150px] h-4" />
              <Skeleton className="w-[100px] h-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error)
    return <p className="text-red-500">Failed to load recent users.</p>;

  const recentUsers = data?.users || [];

  return (
    <div className="space-y-8">
      {recentUsers.map((user: any) => {
        const name = user.email.split("@")[0];
        const fallback = name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase();

        return (
          <div key={user._id} className="flex items-center">
            <Avatar className="w-9 h-9">
              <AvatarImage src="/placeholder-user.jpg" alt={name} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 ml-4">
              <p className="font-medium text-sm leading-none">{name}</p>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
            <div className="ml-auto font-medium capitalize">{user.role}</div>
          </div>
        );
      })}
    </div>
  );
}
