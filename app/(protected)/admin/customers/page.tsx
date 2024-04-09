// @/app/(protected)/admin/customers/page.tsx
"use client"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import React, { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.post('/api/user');
        setUsers(response.data);
      } catch (error) {
        toast({
          title: "Failed to fetch users:",
          description: `${error}`,
        });
      }
    };

    fetchUsers();
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Is Admin</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Updated At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.isAdmin ? "Yes" : "No"}</TableCell>
            <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
            <TableCell>{new Date(user.updatedAt).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
