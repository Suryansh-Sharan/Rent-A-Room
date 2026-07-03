'use client';

import { useState } from 'react';
import { mockUsers } from '@/lib/mock/users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Shield, Search, MoreVertical } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');

  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const tenants = filtered.filter((u) => u.role === 'tenant');
  const owners = filtered.filter((u) => u.role === 'owner');
  const admins = filtered.filter((u) => u.role === 'admin');

  const UserRow = ({ user }: { user: typeof mockUsers[0] }) => (
    <tr className="border-b border-border/40 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge className={
          user.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]' :
          user.role === 'owner' ? 'bg-gold/10 text-gold border-gold/30 text-[10px]' :
          'bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]'
        }>
          {user.role}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge className={
          user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]' :
          user.status === 'suspended' ? 'bg-red-500/20 text-red-400 border-red-500/30 text-[10px]' :
          'bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]'
        }>
          {user.status}
        </Badge>
      </td>
      <td className="px-4 py-3">
        {user.verified ? (
          <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle className="h-3 w-3" />Verified</span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="h-3 w-3" />Unverified</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {format(new Date(user.joinedDate), 'dd MMM yyyy')}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{user.location}</td>
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>Verify User</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive">Suspend</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );

  const UserTable = ({ users }: { users: typeof mockUsers }) => (
    <div className="luxury-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Verified</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => <UserRow key={user.id} user={user} />)}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center py-10 text-sm text-muted-foreground">No users found</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{mockUsers.length} registered users</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/50 border-border/60 focus:border-gold/50"
          />
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
          <TabsTrigger value="tenants">Tenants ({tenants.length})</TabsTrigger>
          <TabsTrigger value="owners">Owners ({owners.length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-5"><UserTable users={filtered} /></TabsContent>
        <TabsContent value="tenants" className="mt-5"><UserTable users={tenants} /></TabsContent>
        <TabsContent value="owners" className="mt-5"><UserTable users={owners} /></TabsContent>
        <TabsContent value="admins" className="mt-5"><UserTable users={admins} /></TabsContent>
      </Tabs>
    </div>
  );
}
