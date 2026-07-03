'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Eye, EyeOff, ArrowRight, Building2, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'owner' | 'admin'>('tenant');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await loginWithEmail(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      router.push(`/${user.role}/dashboard`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'tenant' as const, email: 'aryan@example.com', icon: User, label: 'Tenant Demo' },
    { role: 'owner' as const, email: 'rajesh@example.com', icon: Building2, label: 'Owner Demo' },
    { role: 'admin' as const, email: 'admin@airentfinder.com', icon: Shield, label: 'Admin Demo' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden">
        <img
          src="https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg"
          alt="Modern apartment"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/70" />
        <div className="relative z-10 p-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-gradient">
              <Sparkles className="h-4 w-4 text-obsidian" />
            </div>
            <span className="font-bold text-lg text-white">
              <span className="gold-text">AI</span> Rent Finder
            </span>
          </Link>
        </div>
        <div className="relative z-10 p-10">
          <blockquote className="text-white">
            <p className="text-xl font-medium mb-4 leading-relaxed">
              "Found my perfect studio in Bandra with a 94% compatibility score. The AI truly understood what I needed."
            </p>
            <footer className="text-white/70 text-sm">
              — Aryan Singh, Software Engineer
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-gradient">
              <Sparkles className="h-4 w-4 text-obsidian" />
            </div>
            <span className="font-bold text-lg">
              <span className="gold-text">AI</span> Rent Finder
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your account to continue.</p>

          {/* Demo quick-access */}
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-2">Quick demo access:</p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map(({ role, email: demoEmail, icon: Icon, label }) => (
                <button
                  key={role}
                  onClick={() => { setSelectedRole(role); setEmail(demoEmail); setPassword('demo123'); }}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border text-xs transition-all ${selectedRole === role ? 'border-gold bg-gold/10 text-gold' : 'border-border/60 text-muted-foreground hover:border-gold/40 hover:text-foreground'}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted/50 border-border/60 focus:border-gold/50"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-gold hover:text-gold-light transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-muted/50 border-border/60 focus:border-gold/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-gradient text-obsidian font-bold h-11 hover:opacity-90 gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-obsidian/30 border-t-obsidian animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-gold hover:text-gold-light font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
