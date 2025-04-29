"use client";
import axios from "axios";
import useSWR from "swr";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UsersTable } from "@/components/users/users-table";
import { UserDialog } from "@/components/users/user-dialog";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import type { User } from "@/lib/types";
import { toast } from "react-hot-toast";
// SWR fetcher
const fetcher = async (url: string) => {
  const response = await axios.get(url);
  if (response.data.success) {
    return response.data.users;
  }
  throw new Error(response.data.error || "Failed to fetch users");
};

export default function UsersPage() {
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: users = [],
    error,
    isLoading,
    isValidating,
    mutate: mutateUsers,
  } = useSWR<User[]>("/api/admin/users/all", fetcher);

  const handleEditUser = async (user) => {
    if (!user?._id) {
      console.error("Invalid user data");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.put(`/api/admin/users/${user._id}`, user, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        // Optimistic update
        mutateUsers(
          (prev) =>
            prev.map((u) => (u._id === user._id ? response.data.user : u)),
          false
        );

        // Revalidate cache
        mutateUsers();

        toast.success("User updated successfully");
      } else {
        throw new Error(response.data.error || "Update failed");
      }

      setIsEditUserOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Edit error:", err);
      toast.error(err.response?.data?.error || err.message || "Update failed");

      // Revert by re-fetching original data
      mutateUsers();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);

    try {
      const response = await axios.delete(`/api/admin/users/deleteUser`, {
        data: { userId: selectedUser._id },
      });

      if (response.data.success) {
        const filteredUsers = users.filter((u) => u._id !== selectedUser._id);
        mutateUsers(filteredUsers, false);
        mutateUsers();
        setIsDeleteUserOpen(false);
        setSelectedUser(null);
      } else {
        console.error("Delete failed:", response.data.error);
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsSubmitting(false);
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
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error loading users. Please try again.</p>
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
        userName={selectedUser?.email || ""}
      />
    </DashboardShell>
  );
}
