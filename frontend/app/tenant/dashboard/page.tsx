'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import RoomCard from '@/components/rooms/RoomCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, Heart, FileText, MessageSquare, Sparkles, TrendingUp,
  Clock, CheckCircle, XCircle, ArrowRight, Bell
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TenantDashboard() {
  const { 
    currentUser, savedRooms, notifications, rooms, requests, fetchRooms, fetchRequests 
  } = useAppStore();

  useEffect(() => {
    fetchRooms(currentUser?.location || '');
    fetchRequests();
  }, [currentUser?.location, fetchRooms, fetchRequests]);

  const unread = notifications.filter((n) => !n.read).length;

  const myRequests = requests;
  const pending = myRequests.filter((r) => r.status === 'pending').length;
  const accepted = myRequests.filter((r) => r.status === 'accepted').length;

  const recommendedRooms = rooms.slice(0, 3);

  const savedRoomsList = rooms.filter((r) => savedRooms.includes(r.id)).slice(0, 3);

  const statCards = [
    { label: 'Recommended Rooms', value: rooms.length, icon: Sparkles, color: 'text-gold', bg: 'bg-gold/10', href: '/tenant/search' },
    { label: 'Saved Rooms', value: savedRooms.length, icon: Heart, color: 'text-red-400', bg: 'bg-red-400/10', href: '/tenant/saved' },
    { label: 'Pending Requests', value: pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', href: '/tenant/requests' },
    { label: 'Accepted Requests', value: accepted, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', href: '/tenant/requests' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, <span className="gold-text">{currentUser?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {rooms.length} rooms match your profile today.
          </p>
        </div>
        <div className="flex gap-3">
          {unread > 0 && (
            <Link href="/tenant/notifications">
              <Button variant="outline" size="sm" className="border-border/60 gap-2">
                <Bell className="h-4 w-4 text-gold" />
                {unread} new
              </Button>
            </Link>
          )}
          <Link href="/tenant/search">
            <Button className="bg-gold-gradient text-obsidian font-semibold hover:opacity-90 gap-2">
              <Search className="h-4 w-4" />
              Search Rooms
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}>
            <div className="luxury-card rounded-xl p-5 cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${bg}`}>
                  <Icon className={`h-4.5 w-4.5 ${color}`} style={{ height: '18px', width: '18px' }} />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
              </div>
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* AI Preferences Reminder */}
      {!currentUser?.preferences?.length && (
        <div className="glass-gold rounded-xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Set Your AI Preferences</p>
            <p className="text-xs text-muted-foreground">Complete your profile to get better room matches powered by AI.</p>
          </div>
          <Link href="/tenant/profile">
            <Button size="sm" className="bg-gold-gradient text-obsidian font-semibold hover:opacity-90 flex-shrink-0">
              Complete Profile
            </Button>
          </Link>
        </div>
      )}

      {/* Recent requests */}
      {myRequests.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Recent Requests</h2>
            <Link href="/tenant/requests" className="text-sm text-gold hover:text-gold-light flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {myRequests.slice(0, 3).map((req) => (
              <div key={req.id} className="luxury-card rounded-xl p-4 flex items-center gap-4">
                <img src={req.roomImage} alt={req.roomTitle} className="h-12 w-16 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{req.roomTitle}</p>
                  <p className="text-xs text-muted-foreground">{req.roomLocation}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={
                    req.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    req.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-red-500/20 text-red-400 border-red-500/30'
                  }>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(req.updatedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Rooms */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-gold" style={{ height: '18px', width: '18px' }} />
              AI Recommended Rooms
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Ranked by your compatibility score</p>
          </div>
          <Link href="/tenant/search" className="text-sm text-gold hover:text-gold-light flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>

      {/* Saved rooms */}
      {savedRoomsList.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Heart className="h-4.5 w-4.5 text-red-400" style={{ height: '18px', width: '18px' }} />
              Saved Rooms
            </h2>
            <Link href="/tenant/saved" className="text-sm text-gold hover:text-gold-light flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRoomsList.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
