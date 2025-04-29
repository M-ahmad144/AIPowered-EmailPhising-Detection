"use client";
import axios from "axios";
import useSWR, { mutate } from "swr";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UsersTable } from "@/components/users/users-table";
import { UserDialog } from "@/components/users/user-dialog";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import type { User } from "@/lib/types";

// SWR fetcher function
const fetcher = async (url: string) => {
  const response = await axios.get(url);
  if (response.data.success) {
    return response.data.users;
  }
  throw new Error(response.data.error || "Error fetching users");
};

export default function UsersPage() {
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Use SWR for data fetching
  const {
    data: users = [],
    error,
    isLoading,
  } = useSWR("/api/admin/users/all", fetcher);

  if (error) {
    console.error("Error loading users:", error);
  }

  const handleEditUser = async (user: User) => {
    try {
      // You would typically update the user on the server here
      // const response = await axios.put(`/api/admin/users/${user.id}`, user);

      // Optimistically update the UI
      const updatedUsers = users.map((u: User) =>
        u.id === user.id ? user : u
      );

      // Update SWR cache and revalidate
      mutate("/api/admin/users/all", updatedUsers, false);

      // Then revalidate to ensure our data is correct
      mutate("/api/admin/users/all");

      // Close dialog
      setIsEditUserOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await axios.delete("/api/admin/users/deleteUser", {
        data: { userId: selectedUser.id },
      });

      if (response.data.success) {
        // Revalidate the users data after deletion
        mutate("/api/admin/users/all");

        // Close delete dialog
        setIsDeleteUserOpen(false);
        setSelectedUser(null);
      } else {
        console.error("Failed to delete user:", response.data.error);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteUserOpen(true);
  };

  return (
    <DashboardShell>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading users...</p>
        </div>
      ) : (
        <UsersTable
          users={users}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
        />
      )}

      <UserDialog
        open={isEditUserOpen}
        onOpenChange={setIsEditUserOpen}
        onSave={handleEditUser}
        user={selectedUser}
        title="Edit User"
        description="Edit user information"
      />

      <DeleteUserDialog
        open={isDeleteUserOpen}
        onOpenChange={setIsDeleteUserOpen}
        onDelete={handleDeleteUser}
        userName={selectedUser?.name || ""}
      />
    </DashboardShell>
  );
}
