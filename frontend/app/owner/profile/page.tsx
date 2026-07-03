'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { mockUsers } from '@/lib/mock/users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Phone, MapPin, Edit3, CheckCircle, Camera, Save, Shield, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function OwnerProfilePage() {
  const { currentUser } = useAppStore();
  const user = currentUser || mockUsers[1];
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');

  const handleSave = () => {
    setEditing(false);
    toast.success('Profile updated successfully!');
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your owner profile.</p>
        </div>
        <Button
          variant={editing ? 'default' : 'outline'}
          size="sm"
          className={editing ? 'bg-gold-gradient text-obsidian font-semibold hover:opacity-90' : 'border-border/60'}
          onClick={() => editing ? handleSave() : setEditing(true)}
        >
          {editing ? <><Save className="h-4 w-4 mr-2" />Save Changes</> : <><Edit3 className="h-4 w-4 mr-2" />Edit Profile</>}
        </Button>
      </div>

      <div className="luxury-card rounded-xl p-6">
        <div className="flex items-start gap-5">
          <div className="relative">
            <Avatar className="h-20 w-20 ring-2 ring-gold/30">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {editing && (
              <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-gold text-obsidian flex items-center justify-center shadow">
                <Camera className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold">{user.name}</h2>
              {user.verified && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] gap-0.5">
                  <CheckCircle className="h-2.5 w-2.5" />Verified Owner
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              <span className="text-sm font-medium">{user.rating || 4.5}</span>
              <span className="text-xs text-muted-foreground">• {user.totalListings || 0} listings</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{user.phone}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{user.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="luxury-card rounded-xl p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><User className="h-4 w-4 text-gold" />Personal Information</h3>
        <Separator className="bg-border/60" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input defaultValue={user.name} disabled={!editing} className="bg-muted/40 border-border/60 focus:border-gold/50 disabled:opacity-70" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input defaultValue={user.email} disabled className="bg-muted/40 border-border/60 opacity-60" />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input defaultValue={user.phone} disabled={!editing} className="bg-muted/40 border-border/60 focus:border-gold/50 disabled:opacity-70" />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input defaultValue={user.location} disabled={!editing} className="bg-muted/40 border-border/60 focus:border-gold/50 disabled:opacity-70" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Bio</Label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={!editing}
            className="w-full min-h-[80px] rounded-lg bg-muted/40 border border-border/60 focus:border-gold/50 p-3 text-sm resize-none outline-none transition-colors disabled:opacity-70"
          />
        </div>
      </div>

      <div className="luxury-card rounded-xl p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><Shield className="h-4 w-4 text-gold" />Security</h3>
        <Separator className="bg-border/60" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Password</p>
            <p className="text-xs text-muted-foreground">Last changed 60 days ago</p>
          </div>
          <Button variant="outline" size="sm" className="border-border/60">Change Password</Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Identity Verification</p>
            <p className="text-xs text-muted-foreground">
              {user.verified ? 'Your identity has been verified.' : 'Not yet verified'}
            </p>
          </div>
          <Badge className={user.verified ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-muted text-muted-foreground'}>
            {user.verified ? 'Verified' : 'Verify Now'}
          </Badge>
        </div>
      </div>
    </div>
  );
}
