'use client';

import { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { CheckCheck, AlertTriangle, Info, XCircle } from 'lucide-react';

const typeConfig = {
  success: { icon: Check, className: 'text-emerald-400 bg-emerald-400/10' },
  warning: { icon: AlertTriangle, className: 'text-amber-400 bg-amber-400/10' },
  info: { icon: Info, className: 'text-blue-400 bg-blue-400/10' },
  error: { icon: XCircle, className: 'text-red-400 bg-red-400/10' },
};

export default function NotificationDropdown() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-gold text-obsidian text-[9px] font-bold flex items-center justify-center pulse-gold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-gold hover:text-gold-light flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.slice(0, 6).map((notif) => {
            const { icon: Icon, className } = typeConfig[notif.type];
            return (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={cn(
                  'flex gap-3 px-4 py-3 cursor-pointer border-b border-border/40 hover:bg-muted/40 transition-colors',
                  !notif.read && 'bg-gold/4'
                )}
              >
                <div className={cn('h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center', className)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={cn('text-xs font-medium truncate', !notif.read && 'text-foreground')}>{notif.title}</p>
                    {!notif.read && <div className="h-1.5 w-1.5 rounded-full bg-gold flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-2 border-t border-border/60">
          <a href="/tenant/notifications" className="block text-center text-xs text-gold hover:text-gold-light transition-colors py-1.5">
            View all notifications
          </a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
