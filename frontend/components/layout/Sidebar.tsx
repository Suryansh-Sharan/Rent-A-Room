'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Search, Heart, FileText, MessageSquare,
  Bell, User, Building2, PlusSquare, Users, BarChart3, ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentRole } = useAppStore();
  const notifications = useAppStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  type NavLink = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number };

  const tenantLinks: NavLink[] = [
    { href: '/tenant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tenant/search', label: 'Search Rooms', icon: Search },
    { href: '/tenant/saved', label: 'Saved Rooms', icon: Heart },
    { href: '/tenant/requests', label: 'My Requests', icon: FileText },
    { href: '/tenant/chat', label: 'Chat', icon: MessageSquare },
    { href: '/tenant/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { href: '/tenant/profile', label: 'Profile', icon: User },
  ];

  const ownerLinks: NavLink[] = [
    { href: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/owner/listings', label: 'My Listings', icon: Building2 },
    { href: '/owner/create-listing', label: 'Create Listing', icon: PlusSquare },
    { href: '/owner/requests', label: 'Requests', icon: FileText, badge: 2 },
    { href: '/owner/chat', label: 'Chat', icon: MessageSquare },
    { href: '/owner/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { href: '/owner/profile', label: 'Profile', icon: User },
  ];

  const adminLinks: NavLink[] = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/listings', label: 'Listings', icon: Building2 },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const links = currentRole === 'owner' ? ownerLinks : currentRole === 'admin' ? adminLinks : tenantLinks;

  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-[calc(100vh-4rem)] border-r border-border/60 bg-card/30 pt-6 pb-8 px-3">
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-gold/10 text-gold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <Icon className={cn('h-4 w-4 flex-shrink-0', active ? 'text-gold' : 'group-hover:text-foreground')} />
              <span className="flex-1">{label}</span>
              {badge != null && badge > 0 && (
                <Badge className="h-4 min-w-[16px] p-0 px-1 text-[10px] bg-gold text-obsidian">
                  {badge}
                </Badge>
              )}
              {active && <ChevronRight className="h-3 w-3 text-gold opacity-60" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
