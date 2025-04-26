"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UsersTable } from "@/components/users/users-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { UserDialog } from "@/components/users/user-dialog";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { mockUsers } from "@/lib/mock-data";
import type { User } from "@/lib/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleAddUser = (user: User) => {
    setUsers([...users, { ...user, id: (users.length + 1).toString() }]);
    setIsAddUserOpen(false);
  };

  const handleEditUser = (user: User) => {
    setUsers(users.map((u) => (u.id === user.id ? user : u)));
    setIsEditUserOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter((user) => user.id !== selectedUser.id));
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
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        onSave={handleAddUser}
        title="Add User"
        description="Add a new user to the system"
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
