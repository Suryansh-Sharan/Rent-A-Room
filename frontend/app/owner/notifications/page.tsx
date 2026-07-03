'use client';

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { CheckCheck, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { EmptyNotifications } from '@/components/ui/EmptyStates';

const typeConfig = {
  success: { icon: CheckCircle, className: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  warning: { icon: AlertTriangle, className: 'text-amber-400', bg: 'bg-amber-400/10' },
  info: { icon: Info, className: 'text-blue-400', bg: 'bg-blue-400/10' },
  error: { icon: XCircle, className: 'text-red-400', bg: 'bg-red-400/10' },
};

export default function OwnerNotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">{unread} unread notifications</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" className="border-border/60 gap-2" onClick={markAllNotificationsRead}>
            <CheckCheck className="h-4 w-4" />Mark all read
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <EmptyNotifications />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const { icon: Icon, className, bg } = typeConfig[notif.type];
            return (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={cn('luxury-card rounded-xl p-4 flex gap-4 cursor-pointer transition-all', !notif.read && 'border-gold/20')}
              >
                <div className={cn('h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center', bg)}>
                  <Icon className={cn('h-5 w-5', className)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-semibold', !notif.read && 'text-foreground')}>{notif.title}</p>
                    {!notif.read && <div className="h-2 w-2 rounded-full bg-gold flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1.5">
                    {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
