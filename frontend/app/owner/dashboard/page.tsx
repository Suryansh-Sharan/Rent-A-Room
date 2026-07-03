'use client';

import Link from 'next/link';
import { mockRooms } from '@/lib/mock/rooms';
import { mockRequests } from '@/lib/mock/requests';
import { mockConversations } from '@/lib/mock/messages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Building2, Users, MessageSquare, CheckCircle, PlusSquare,
  Eye, ArrowRight, TrendingUp, Star, BarChart3
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';

export default function OwnerDashboard() {
  const { currentUser } = useAppStore();
  const ownerListings = mockRooms.filter((r) => r.ownerId === 'u2');
  const ownerRequests = mockRequests.filter((r) => r.ownerId === 'u2');
  const pendingRequests = ownerRequests.filter((r) => r.status === 'pending');

  const stats = [
    { label: 'Active Listings', value: ownerListings.filter((l) => l.status === 'active').length, icon: Building2, color: 'text-gold', bg: 'bg-gold/10', href: '/owner/listings' },
    { label: 'Interested Tenants', value: ownerRequests.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', href: '/owner/requests' },
    { label: 'Active Chats', value: mockConversations.filter((c) => c.participantIds.includes('u2')).length, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-400/10', href: '/owner/chat' },
    { label: 'Filled Listings', value: ownerListings.filter((l) => l.status === 'filled').length, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', href: '/owner/listings' },
  ];

  const totalViews = ownerListings.reduce((sum, l) => sum + l.views, 0);
  const totalSaves = ownerListings.reduce((sum, l) => sum + l.saves, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Owner Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your listings and tenant interactions.
          </p>
        </div>
        <Link href="/owner/create-listing">
          <Button className="bg-gold-gradient text-obsidian font-semibold hover:opacity-90 gap-2">
            <PlusSquare className="h-4 w-4" />
            Create Listing
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}>
            <div className="luxury-card rounded-xl p-5 cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${bg}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
              </div>
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Analytics overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="luxury-card rounded-xl p-5 text-center">
          <Eye className="h-5 w-5 text-gold mx-auto mb-2" />
          <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total Listing Views</div>
        </div>
        <div className="luxury-card rounded-xl p-5 text-center">
          <Star className="h-5 w-5 text-gold mx-auto mb-2" />
          <div className="text-2xl font-bold">{totalSaves}</div>
          <div className="text-xs text-muted-foreground">Total Saves</div>
        </div>
        <div className="luxury-card rounded-xl p-5 text-center">
          <BarChart3 className="h-5 w-5 text-gold mx-auto mb-2" />
          <div className="text-2xl font-bold text-emerald-400">{pendingRequests.length}</div>
          <div className="text-xs text-muted-foreground">Pending Requests</div>
        </div>
      </div>

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Pending Requests</h2>
            <Link href="/owner/requests" className="text-sm text-gold hover:text-gold-light flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="luxury-card rounded-xl p-4 flex items-center gap-4">
                <Avatar className="h-10 w-10 ring-1 ring-border/60">
                  <AvatarImage src={req.tenantAvatar} />
                  <AvatarFallback>{req.tenantName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{req.tenantName}</p>
                  <p className="text-xs text-muted-foreground truncate">Re: {req.roomTitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  {req.compatibilityScore && (
                    <Badge className="bg-gold/10 text-gold border-gold/30 text-[10px]">
                      {req.compatibilityScore}% match
                    </Badge>
                  )}
                  <Button size="sm" className="h-7 text-xs bg-gold-gradient text-obsidian font-semibold hover:opacity-90">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My listings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">My Listings</h2>
          <Link href="/owner/listings" className="text-sm text-gold hover:text-gold-light flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {ownerListings.map((listing) => (
            <div key={listing.id} className="luxury-card rounded-xl p-4 flex items-center gap-4">
              <img src={listing.images[0]} alt={listing.title} className="h-14 w-20 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{listing.title}</p>
                <p className="text-xs text-muted-foreground">{listing.location}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gold font-medium">₹{listing.rent.toLocaleString()}/mo</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <Eye className="h-2.5 w-2.5" />{listing.views} views
                  </span>
                </div>
              </div>
              <Badge className={listing.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-muted text-muted-foreground'}>
                {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
              </Badge>
            </div>
          ))}
          {ownerListings.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No listings yet.{' '}
              <Link href="/owner/create-listing" className="text-gold hover:underline">Create one</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
