// @/app/(protected)/admin/customers/page.tsx
"use client"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import React, { useEffect, useState, useCallback } from "react";
import { Button } from '@/components/ui/button';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetchUsers = useCallback(async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.post('/api/user');
        setUsers(response.data);
      } catch {
        setError('Unable to load customers. Please retry or sign in again.');
      } finally { setLoading(false); }
  }, []);
  useEffect(() => { void fetchUsers(); }, [fetchUsers]);

  if (loading) return <p role="status">Loading customers…</p>;
  if (error) return <div role="alert" className="space-y-3"><p>{error}</p><Button variant="outline" onClick={fetchUsers}>Retry</Button></div>;

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
        {!users.length && <TableRow><TableCell colSpan={4} className="py-8 text-center text-gray-500">No customers have registered yet.</TableCell></TableRow>}
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
