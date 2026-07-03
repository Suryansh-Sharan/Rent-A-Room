'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Bell, Menu, X, Home, Search, MessageSquare, Heart,
  FileText, User, LayoutDashboard, Building2, PlusSquare,
  Users, BarChart3, ChevronDown, LogOut, Settings,
  Sparkles, Shield
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, currentRole, sidebarOpen, setSidebarOpen, login, logout, checkAuth } = useAppStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  const notifications = useAppStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const tenantLinks = [
    { href: '/tenant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tenant/search', label: 'Search', icon: Search },
    { href: '/tenant/saved', label: 'Saved', icon: Heart },
    { href: '/tenant/requests', label: 'Requests', icon: FileText },
    { href: '/tenant/chat', label: 'Chat', icon: MessageSquare },
  ];

  const ownerLinks = [
    { href: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/owner/listings', label: 'Listings', icon: Building2 },
    { href: '/owner/create-listing', label: 'Add Room', icon: PlusSquare },
    { href: '/owner/requests', label: 'Requests', icon: FileText },
    { href: '/owner/chat', label: 'Chat', icon: MessageSquare },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/listings', label: 'Listings', icon: Building2 },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const links = currentRole === 'owner' ? ownerLinks : currentRole === 'admin' ? adminLinks : tenantLinks;
  const isPublic = !currentUser;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto max-w-screen-xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={currentUser ? `/${currentRole}/dashboard` : '/'} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-gradient">
              <Sparkles className="h-4 w-4 text-obsidian" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="gold-text">AI</span>
              <span className="text-foreground"> Rent Finder</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          {!isPublic && (
            <nav className="hidden md:flex items-center gap-1">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith(href)
                      ? 'text-gold bg-gold/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {isPublic ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-gold-gradient text-obsidian font-semibold hover:opacity-90">
                      Get Started
                    </Button>
                  </Link>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </>
            ) : (
              <>
                {/* Role switcher for demo - only admin can see/use this */}
                {currentUser?.role === 'admin' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1.5 border-border/60 text-xs">
                        {currentRole === 'admin' ? <Shield className="h-3 w-3" /> : currentRole === 'owner' ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem onClick={() => { login('tenant'); router.push('/tenant/dashboard'); }}>Tenant View</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { login('owner'); router.push('/owner/dashboard'); }}>Owner View</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { login('admin'); router.push('/admin/dashboard'); }}>Admin View</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Notifications */}
                <NotificationDropdown />

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity">
                      <Avatar className="h-8 w-8 ring-1 ring-gold/30">
                        <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                        <AvatarFallback className="bg-muted text-xs">{currentUser?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{currentUser?.name}</p>
                      <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/${currentRole}/profile`} className="flex items-center gap-2">
                        <User className="h-4 w-4" />Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/${currentRole}/notifications`} className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />Notifications
                        {unreadCount > 0 && (
                          <Badge className="ml-auto h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-gold text-obsidian">
                            {unreadCount}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        logout();
                        router.push('/');
                      }}
                      className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile menu toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {sidebarOpen && (
          <div className="md:hidden border-t border-border/60 py-3 space-y-1 animate-fade-in">
            {isPublic ? (
              <div className="flex flex-col gap-2 pb-2">
                <Link href="/login" onClick={() => setSidebarOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setSidebarOpen(false)}>
                  <Button className="w-full bg-gold-gradient text-obsidian font-semibold">Get Started</Button>
                </Link>
              </div>
            ) : (
              links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    pathname.startsWith(href)
                      ? 'text-gold bg-gold/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </header>
  );
}
