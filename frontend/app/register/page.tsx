'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Eye, EyeOff, ArrowRight, User, Building2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registerWithEmail } = useAppStore();

  const defaultRole = (searchParams.get('role') as 'tenant' | 'owner') || 'tenant';
  const [role, setRole] = useState<'tenant' | 'owner'>(defaultRole);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerWithEmail({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
        role,
      });
      toast.success('Account created successfully!');
      router.push(`/${role}/dashboard`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to create account. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = {
    tenant: [
      'AI-powered room compatibility scoring',
      'Free text search powered by AI',
      'Direct chat with verified owners',
      'Save & compare multiple rooms',
    ],
    owner: [
      'Reach 200,000+ verified tenants',
      'AI pre-screens compatible tenants',
      'Real-time listing analytics',
      'Professional listing management',
    ],
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden">
        <img
          src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"
          alt="Luxury apartment"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/70" />
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
        <div className="relative z-10 p-10 space-y-4">
          <h2 className="text-white text-xl font-bold">
            {role === 'tenant' ? 'Find your perfect room' : 'List your property'}
          </h2>
          <div className="space-y-3">
            {benefits[role].map((b) => (
              <div key={b} className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle className="h-4 w-4 text-gold flex-shrink-0" />
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-background overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-gradient">
              <Sparkles className="h-4 w-4 text-obsidian" />
            </div>
            <span className="font-bold text-lg">
              <span className="gold-text">AI</span> Rent Finder
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-muted-foreground text-sm mb-6">Join thousands finding their perfect room.</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['tenant', 'owner'] as const).map((r) => {
              const Icon = r === 'tenant' ? User : Building2;
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                    role === r
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-border/60 text-muted-foreground hover:border-gold/30'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium capitalize">I'm a {r}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Aryan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="bg-muted/50 border-border/60 focus:border-gold/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Singh"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="bg-muted/50 border-border/60 focus:border-gold/50"
                />
              </div>
            </div>
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
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-muted/50 border-border/60 focus:border-gold/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
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

            <p className="text-xs text-muted-foreground">
              By signing up, you agree to our{' '}
              <a href="#" className="text-gold hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-gold hover:underline">Privacy Policy</a>.
            </p>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-gradient text-obsidian font-bold h-11 hover:opacity-90 gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-obsidian/30 border-t-obsidian animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-gold hover:text-gold-light font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
