"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UsersTable } from "@/components/users/users-table";
import { UserDialog } from "@/components/users/user-dialog";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import type { User } from "@/lib/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEditUser = (user: User) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === user.id ? user : u))
    );
    setIsEditUserOpen(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users/all"); // ✅ correct route
        const data = await res.json();

        if (data.success) {
          setUsers(data.users); // ✅ setUsers to data.users, not full data
        } else {
          console.error("User fetch error:", data.error);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== selectedUser.id)
      );
      setIsDeleteUserOpen(false);
      setSelectedUser(null);
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
      <UsersTable
        users={users}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
      />

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
