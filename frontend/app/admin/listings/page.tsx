'use client';

import { useState } from 'react';
import { mockRooms } from '@/lib/mock/rooms';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, MapPin, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { mockUsers } from '@/lib/mock/users';

export default function AdminListingsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockRooms.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase())
  );

  const active = filtered.filter((r) => r.status === 'active');
  const inactive = filtered.filter((r) => r.status !== 'active');

  const ListingRow = ({ room }: { room: typeof mockRooms[0] }) => {
    const owner = mockUsers.find((u) => u.id === room.ownerId);
    return (
      <tr className="border-b border-border/40 hover:bg-muted/20 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={room.images[0]} alt={room.title} className="h-10 w-14 rounded-lg object-cover flex-shrink-0" />
            <div>
              <p className="text-sm font-medium line-clamp-1">{room.title}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5" />{room.location}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-gold">₹{room.rent.toLocaleString()}</td>
        <td className="px-4 py-3">
          <Badge className={room.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]' : 'bg-muted text-muted-foreground text-[10px]'}>
            {room.status}
          </Badge>
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{room.roomType}</td>
        <td className="px-4 py-3">
          <p className="text-xs">{owner?.name}</p>
          <p className="text-[10px] text-muted-foreground">{owner?.verified ? '✓ Verified' : 'Unverified'}</p>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{room.views}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(room.postedDate), 'dd MMM yyyy')}</td>
        <td className="px-4 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Approve Listing</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive">Remove Listing</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
    );
  };

  const ListingTable = ({ rooms }: { rooms: typeof mockRooms }) => (
    <div className="luxury-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Property</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Rent</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Views</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Posted</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => <ListingRow key={r.id} room={r} />)}
          </tbody>
        </table>
        {rooms.length === 0 && <p className="text-center py-10 text-sm text-muted-foreground">No listings found</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Listings Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{mockRooms.length} total listings</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search listings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-muted/50 border-border/60 focus:border-gold/50" />
        </div>
      </div>
      <Tabs defaultValue="all">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="inactive">Others ({inactive.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-5"><ListingTable rooms={filtered} /></TabsContent>
        <TabsContent value="active" className="mt-5"><ListingTable rooms={active} /></TabsContent>
        <TabsContent value="inactive" className="mt-5"><ListingTable rooms={inactive} /></TabsContent>
      </Tabs>
    </div>
  );
}
