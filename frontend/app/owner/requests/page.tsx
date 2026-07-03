'use client';

import { mockRequests } from '@/lib/mock/requests';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, MessageSquare, MapPin, Sparkles, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CompatibilityBadge from '@/components/rooms/CompatibilityBadge';
import { EmptyRequests } from '@/components/ui/EmptyStates';
import { toast } from 'sonner';
import { useState } from 'react';
import Link from 'next/link';

export default function OwnerRequestsPage() {
  const rawRequests = mockRequests.filter((r) => r.ownerId === 'u2');
  const [requests, setRequests] = useState(rawRequests);

  const pending = requests.filter((r) => r.status === 'pending');
  const accepted = requests.filter((r) => r.status === 'accepted');
  const rejected = requests.filter((r) => r.status === 'rejected');

  const handleAction = (id: string, action: 'accepted' | 'rejected') => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: action } : r));
    toast.success(action === 'accepted' ? 'Request accepted! Tenant notified.' : 'Request declined.');
  };

  const RequestCard = ({ req }: { req: typeof requests[0] }) => (
    <div className="luxury-card rounded-xl p-5 space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 ring-1 ring-gold/30">
          <AvatarImage src={req.tenantAvatar} />
          <AvatarFallback>{req.tenantName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">{req.tenantName}</h3>
            <Badge className={
              req.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
              req.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
              'bg-red-500/20 text-red-400 border-red-500/30'
            }>
              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Interested in: {req.roomTitle}</p>
          <div className="flex items-center gap-3 mt-1">
            {req.compatibilityScore && (
              <CompatibilityBadge score={req.compatibilityScore} size="sm" />
            )}
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {req.message && (
        <div className="bg-muted/40 rounded-lg px-3 py-2.5">
          <p className="text-xs text-muted-foreground leading-relaxed italic">"{req.message}"</p>
        </div>
      )}

      {req.status === 'pending' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
            onClick={() => handleAction(req.id, 'accepted')}
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={() => handleAction(req.id, 'rejected')}
          >
            <XCircle className="h-3.5 w-3.5 mr-1.5" />Decline
          </Button>
          <Link href="/owner/chat">
            <Button size="sm" variant="outline" className="border-border/60">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />Chat
            </Button>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Tenant Requests</h1>
        <p className="text-muted-foreground text-sm mt-1">Review and respond to tenant interest requests.</p>
      </div>
      <Tabs defaultValue="pending">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({accepted.length})</TabsTrigger>
          <TabsTrigger value="rejected">Declined ({rejected.length})</TabsTrigger>
          <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4 mt-5">
          {pending.length === 0 ? <EmptyRequests /> : pending.map((r) => <RequestCard key={r.id} req={r} />)}
        </TabsContent>
        <TabsContent value="accepted" className="space-y-4 mt-5">
          {accepted.length === 0 ? <EmptyRequests /> : accepted.map((r) => <RequestCard key={r.id} req={r} />)}
        </TabsContent>
        <TabsContent value="rejected" className="space-y-4 mt-5">
          {rejected.length === 0 ? <EmptyRequests /> : rejected.map((r) => <RequestCard key={r.id} req={r} />)}
        </TabsContent>
        <TabsContent value="all" className="space-y-4 mt-5">
          {requests.length === 0 ? <EmptyRequests /> : requests.map((r) => <RequestCard key={r.id} req={r} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
