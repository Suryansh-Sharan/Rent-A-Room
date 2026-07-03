'use client';

import { mockUsers } from '@/lib/mock/users';
import { mockRooms } from '@/lib/mock/rooms';
import { mockRequests } from '@/lib/mock/requests';
import { mockNotifications } from '@/lib/mock/notifications';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Building2, CheckCircle, ArrowUp, ArrowDown, Brain, Star } from 'lucide-react';

const monthlyData = [
  { month: 'Jan', revenue: 2.4, users: 890, listings: 120 },
  { month: 'Feb', revenue: 3.1, users: 1050, listings: 145 },
  { month: 'Mar', revenue: 2.8, users: 1200, listings: 160 },
  { month: 'Apr', revenue: 4.2, users: 1400, listings: 190 },
  { month: 'May', revenue: 5.1, users: 1700, listings: 210 },
  { month: 'Jun', revenue: 6.3, users: 1950, listings: 245 },
  { month: 'Jul', revenue: 7.8, users: 2200, listings: 280 },
];

const cityData = [
  { city: 'Mumbai', listings: 42, matches: 89 },
  { city: 'Bangalore', listings: 38, matches: 76 },
  { city: 'Delhi', listings: 29, matches: 58 },
  { city: 'Pune', listings: 18, matches: 34 },
  { city: 'Hyderabad', listings: 12, matches: 22 },
];

const roleData = [
  { name: 'Tenants', value: 72, color: '#60a5fa' },
  { name: 'Owners', value: 24, color: '#c8a02a' },
  { name: 'Admins', value: 4, color: '#a78bfa' },
];

const compatData = [
  { range: '90-100', count: 2840 },
  { range: '75-89', count: 5120 },
  { range: '60-74', count: 3490 },
  { range: '40-59', count: 1890 },
  { range: '<40', count: 620 },
];

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(30 8% 9%)',
    border: '1px solid hsl(30 8% 18%)',
    borderRadius: '8px',
    color: '#e8dcc8',
    fontSize: '11px',
  },
};

export default function AdminAnalyticsPage() {
  const kpis = [
    { label: 'Total Platform Revenue', value: '₹42.8L', change: '+18%', up: true, icon: TrendingUp },
    { label: 'Avg Match Score', value: '82%', change: '+3%', up: true, icon: Brain },
    { label: 'Listing Fill Rate', value: '67%', change: '+5%', up: true, icon: Building2 },
    { label: 'User Churn Rate', value: '4.2%', change: '-1.2%', up: false, icon: Users },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform performance and insights.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, change, up, icon: Icon }) => (
          <div key={label} className="luxury-card rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="h-9 w-9 rounded-lg bg-gold/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-gold" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {change}
              </span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Revenue trend */}
      <div className="luxury-card rounded-xl p-6">
        <h3 className="font-semibold mb-4">Revenue & Growth Trend</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c8a02a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#c8a02a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="revenue" stroke="#c8a02a" strokeWidth={2} fill="url(#goldGrad)" name="Revenue (₹L)" />
            <Line type="monotone" dataKey="users" stroke="#60a5fa" strokeWidth={2} dot={false} name="Users" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* City performance + role distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 luxury-card rounded-xl p-6">
          <h3 className="font-semibold mb-4">City-wise Listings & Matches</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="city" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="listings" fill="#c8a02a" radius={[4, 4, 0, 0]} name="Listings" />
              <Bar dataKey="matches" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Matches" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 luxury-card rounded-xl p-6">
          <h3 className="font-semibold mb-4">User Distribution</h3>
          <div className="flex justify-center mb-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={roleData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {roleData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {roleData.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-xs">{name}</span>
                </div>
                <span className="text-xs font-semibold">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compatibility distribution */}
      <div className="luxury-card rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Brain className="h-4 w-4 text-gold" />AI Match Score Distribution
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={compatData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="range" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Score Range', position: 'insideBottom', fill: '#9ca3af', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="count" fill="hsl(43 74% 52%)" radius={[4, 4, 0, 0]} name="Matches" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
