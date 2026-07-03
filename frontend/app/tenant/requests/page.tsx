'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyRequests } from '@/components/ui/EmptyStates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, MapPin, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';
import CompatibilityBadge from '@/components/rooms/CompatibilityBadge';

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  accepted: { label: 'Accepted', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  rejected: { label: 'Declined', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  withdrawn: { label: 'Withdrawn', className: 'bg-muted text-muted-foreground border-border' },
};

export default function TenantRequestsPage() {
  const { requests, fetchRequests } = useAppStore();

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const myRequests = requests;
  const pending = myRequests.filter((r) => r.status === 'pending');
  const accepted = myRequests.filter((r) => r.status === 'accepted');
  const others = myRequests.filter((r) => r.status !== 'pending' && r.status !== 'accepted');

  const RequestCard = ({ req }: { req: typeof myRequests[0] }) => (
    <div className="luxury-card rounded-xl p-5 flex flex-col md:flex-row gap-4">
      <img src={req.roomImage} alt={req.roomTitle} className="h-24 w-36 rounded-xl object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm">{req.roomTitle}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />{req.roomLocation}
            </p>
          </div>
          <Badge className={statusConfig[req.status].className}>
            {statusConfig[req.status].label}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold gold-text">₹{req.rent.toLocaleString()}/mo</span>
          {req.compatibilityScore && (
            <CompatibilityBadge score={req.compatibilityScore} size="sm" />
          )}
        </div>

        {req.message && (
          <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 italic">
            "{req.message}"
          </p>
        )}

        {req.ownerNote && (
          <div className="flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
            <MessageSquare className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">{req.ownerNote}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {formatDistanceToNow(new Date(req.updatedAt), { addSuffix: true })}
          </span>
          <div className="flex gap-2">
            <Link href={`/tenant/rooms/${req.roomId}`}>
              <Button size="sm" variant="outline" className="text-xs h-7 border-border/60">View Room</Button>
            </Link>
            <Link href="/tenant/chat">
              <Button size="sm" className="text-xs h-7 bg-gold-gradient text-obsidian font-semibold hover:opacity-90">
                <MessageSquare className="h-3 w-3 mr-1" />Chat
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">My Requests</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your room interest requests.</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="all">All ({myRequests.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({accepted.length})</TabsTrigger>
          <TabsTrigger value="others">Others ({others.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-5">
          {myRequests.length === 0 ? <EmptyRequests /> : myRequests.map((r) => <RequestCard key={r.id} req={r} />)}
        </TabsContent>
        <TabsContent value="pending" className="space-y-4 mt-5">
          {pending.length === 0 ? <EmptyRequests /> : pending.map((r) => <RequestCard key={r.id} req={r} />)}
        </TabsContent>
        <TabsContent value="accepted" className="space-y-4 mt-5">
          {accepted.length === 0 ? <EmptyRequests /> : accepted.map((r) => <RequestCard key={r.id} req={r} />)}
        </TabsContent>
        <TabsContent value="others" className="space-y-4 mt-5">
          {others.length === 0 ? <EmptyRequests /> : others.map((r) => <RequestCard key={r.id} req={r} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
