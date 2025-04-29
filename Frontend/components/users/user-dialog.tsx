"use client";

import type React from "react";
import { useState, useEffect } from "react";
import type { User } from "@/lib/types"; // Assume full user type from your app
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: Partial<User>) => void;
  user?: User | null;
  title: string;
  description: string;
  isSubmitting?: boolean;
}

// Define a separate type for the form fields only
type UserFormData = {
  email: string;
  role: "user" | "admin";
};

export function UserDialog({
  open,
  onOpenChange,
  onSave,
  user,
  title,
  description,
  isSubmitting,
}: UserDialogProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    role: "user",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        role: "user",
      });
    } else {
      setFormData({ email: "", role: "user" });
    }
  }, [user, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value as "user" | "admin" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...user, ...formData }); // Merge edited fields with the original user
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="gap-4 grid py-4">
            <div className="items-center gap-4 grid grid-cols-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="items-center gap-4 grid grid-cols-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange("role", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
