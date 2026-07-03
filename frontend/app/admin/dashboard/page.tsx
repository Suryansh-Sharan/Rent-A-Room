'use client';

import { mockUsers } from '@/lib/mock/users';
import { mockRooms } from '@/lib/mock/rooms';
import { mockRequests } from '@/lib/mock/requests';
import { Building2, Users, FileText, TrendingUp, Activity, ArrowRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const chartData = [
  { month: 'Jan', listings: 120, requests: 340, users: 890 },
  { month: 'Feb', listings: 145, requests: 410, users: 1050 },
  { month: 'Mar', listings: 160, requests: 380, users: 1200 },
  { month: 'Apr', listings: 190, requests: 520, users: 1400 },
  { month: 'May', listings: 210, requests: 610, users: 1700 },
  { month: 'Jun', listings: 245, requests: 740, users: 1950 },
  { month: 'Jul', listings: 280, requests: 890, users: 2200 },
];

const compatScoreData = [
  { range: '90-100%', count: 2840 },
  { range: '75-89%', count: 5120 },
  { range: '60-74%', count: 3490 },
  { range: '40-59%', count: 1890 },
  { range: '<40%', count: 620 },
];

export default function AdminDashboard() {
  const totalUsers = mockUsers.length;
  const tenants = mockUsers.filter((u) => u.role === 'tenant').length;
  const owners = mockUsers.filter((u) => u.role === 'owner').length;
  const totalListings = mockRooms.length;
  const activeListings = mockRooms.filter((r) => r.status === 'active').length;
  const totalRequests = mockRequests.length;
  const acceptedRequests = mockRequests.filter((r) => r.status === 'accepted').length;

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', href: '/admin/users' },
    { label: 'Total Listings', value: totalListings, icon: Building2, color: 'text-gold', bg: 'bg-gold/10', href: '/admin/listings' },
    { label: 'Total Requests', value: totalRequests, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10', href: '/admin/listings' },
    { label: 'Platform Growth', value: '+18%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', href: '/admin/analytics' },
  ];

  const recentUsers = mockUsers.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform overview and key metrics.</p>
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

      {/* Sub-stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tenants', value: tenants, color: 'text-blue-400' },
          { label: 'Owners', value: owners, color: 'text-gold' },
          { label: 'Active Listings', value: activeListings, color: 'text-emerald-400' },
          { label: 'Accepted Requests', value: acceptedRequests, color: 'text-purple-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-xl p-4 text-center">
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 luxury-card rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-gold" />Platform Growth
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(30 8% 9%)', border: '1px solid hsl(30 8% 18%)', borderRadius: '8px', color: '#e8dcc8' }} />
              <Line type="monotone" dataKey="users" stroke="#c8a02a" strokeWidth={2} dot={false} name="Users" />
              <Line type="monotone" dataKey="requests" stroke="#60a5fa" strokeWidth={2} dot={false} name="Requests" />
              <Line type="monotone" dataKey="listings" stroke="#34d399" strokeWidth={2} dot={false} name="Listings" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="luxury-card rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gold" />Compatibility Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compatScoreData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="range" type="category" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip contentStyle={{ background: 'hsl(30 8% 9%)', border: '1px solid hsl(30 8% 18%)', borderRadius: '8px', color: '#e8dcc8' }} />
              <Bar dataKey="count" fill="hsl(43 74% 52%)" radius={[0, 4, 4, 0]} name="Matches" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent users */}
      <div className="luxury-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Users</h3>
          <Link href="/admin/users" className="text-sm text-gold hover:text-gold-light flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {recentUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Badge className={
                user.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]' :
                user.role === 'owner' ? 'bg-gold/10 text-gold border-gold/30 text-[10px]' :
                'bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]'
              }>
                {user.role}
              </Badge>
              <Badge className={user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]' : 'bg-muted text-muted-foreground text-[10px]'}>
                {user.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
