'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Heart, PlusSquare, Edit3, Trash2, MoreVertical, MapPin } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/EmptyStates';
import { Building2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function OwnerListingsPage() {
  const { ownerListings, fetchOwnerListings } = useAppStore();

  useEffect(() => {
    fetchOwnerListings();
  }, [fetchOwnerListings]);

  const active = ownerListings.filter((l) => l.status === 'active');
  const filled = ownerListings.filter((l) => l.status === 'filled');

  const ListingRow = ({ listing }: { listing: typeof ownerListings[0] }) => (
    <div className="luxury-card rounded-xl p-4 flex items-start gap-4">
      {listing.images && listing.images[0] ? (
        <img src={listing.images[0]} alt={listing.title} className="h-20 w-28 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className="h-20 w-28 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 text-[10px] text-muted-foreground">No Image</div>
      )}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm">{listing.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2"><Edit3 className="h-3.5 w-3.5" />Edit Listing</DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />{listing.location}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold gold-text">₹{listing.rent.toLocaleString()}/mo</span>
          <Badge className={listing.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]' : 'bg-muted text-muted-foreground text-[10px]'}>
            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Eye className="h-3 w-3" />{listing.views}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Heart className="h-3 w-3" />{listing.saves}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-muted-foreground text-sm mt-1">{ownerListings.length} total listings</p>
        </div>
        <Link href="/owner/create-listing">
          <Button className="bg-gold-gradient text-obsidian font-semibold hover:opacity-90 gap-2">
            <PlusSquare className="h-4 w-4" />New Listing
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="all">All ({ownerListings.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="filled">Filled ({filled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4 mt-5">
          {ownerListings.length === 0 ? <EmptyState icon={Building2} title="No listings yet" description="Create your first listing to start receiving tenant requests." /> : ownerListings.map((l) => <ListingRow key={l.id} listing={l} />)}
        </TabsContent>
        <TabsContent value="active" className="space-y-4 mt-5">
          {active.length === 0 ? <EmptyState icon={Building2} title="No active listings" description="All your listings are currently filled." /> : active.map((l) => <ListingRow key={l.id} listing={l} />)}
        </TabsContent>
        <TabsContent value="filled" className="space-y-4 mt-5">
          {filled.length === 0 ? <EmptyState icon={Building2} title="No filled listings" description="None of your rooms are filled yet." /> : filled.map((l) => <ListingRow key={l.id} listing={l} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
