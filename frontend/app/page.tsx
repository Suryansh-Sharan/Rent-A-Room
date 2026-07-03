'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, MapPin, Shield, Star, ArrowRight, CheckCircle,
  Building2, Users, Brain, Award, TrendingUp, ChevronRight
} from 'lucide-react';
import Footer from '@/components/layout/Footer';

const stats = [
  { value: '50,000+', label: 'Verified Rooms' },
  { value: '200,000+', label: 'Happy Tenants' },
  { value: '98%', label: 'Match Accuracy' },
  { value: '4.9/5', label: 'User Rating' },
];

const features = [
  {
    icon: Brain,
    title: 'AI Compatibility Engine',
    desc: 'Our proprietary AI analyzes 40+ lifestyle signals to match you with rooms that truly fit your life.',
    color: 'text-gold',
    bg: 'bg-gold/10',
  },
  {
    icon: Shield,
    title: 'Verified Listings',
    desc: 'Every room and owner goes through a multi-step verification process so you can search with confidence.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    icon: Sparkles,
    title: 'Smart Match Score',
    desc: 'Get a detailed compatibility breakdown — lifestyle, budget, location and amenity scores in one view.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: Building2,
    title: 'Premium Listings',
    desc: 'Curated rooms from studios to penthouses. Filter by type, furnishing, and over 14 preference tags.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    icon: Users,
    title: 'In-App Chat',
    desc: 'Chat directly with owners and tenants. WhatsApp-style interface with read receipts and typing indicators.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Analytics',
    desc: 'Owners get live dashboards with views, saves, and request analytics to optimize their listings.',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
  },
];

const testimonials = [
  {
    name: 'Aryan Singh',
    role: 'Software Engineer, Bangalore',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    text: 'Found my dream studio in Bandra with a 94% compatibility score. The AI actually understood my work-from-home requirements perfectly.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Property Owner, Koramangala',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    text: 'As an owner, I get only highly compatible tenant requests. My properties fill up within weeks now. The analytics dashboard is exceptional.',
    rating: 5,
  },
  {
    name: 'Neha Patel',
    role: 'MBA Student, Pune',
    avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg',
    text: 'The AI free-text search is brilliant. I just described my ideal room in plain English and it found exactly what I was looking for.',
    rating: 5,
  },
];

const roomShowcase = [
  {
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    title: 'Luxury Studio, Bandra',
    rent: 45000,
    score: 94,
  },
  {
    image: 'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg',
    title: 'Modern 1BHK, Koramangala',
    rent: 28000,
    score: 88,
  },
  {
    image: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg',
    title: 'Penthouse, Juhu',
    rent: 65000,
    score: 76,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-screen-xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-gradient">
              <Sparkles className="h-4 w-4 text-obsidian" />
            </div>
            <span className="font-bold text-lg">
              <span className="gold-text">AI</span> Rent Finder
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {['Features', 'Pricing', 'About', 'Blog'].map((item) => (
              <a key={item} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gold-gradient text-obsidian font-semibold hover:opacity-90">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-gold/8 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/4 h-96 w-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
          <div className="absolute top-40 right-1/4 h-64 w-64 rounded-full bg-silver/5 blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-screen-xl px-6 pt-24 pb-20 text-center">
            <Badge className="mb-6 bg-gold/10 text-gold border-gold/30 text-xs px-3 py-1 gap-1.5">
              <Sparkles className="h-3 w-3" />
              AI-Powered Room Matching
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-5xl mx-auto leading-[1.1]">
              Find Your Perfect Room with{' '}
              <span className="gold-text">AI Compatibility</span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop browsing endless listings. Our AI analyzes your lifestyle, preferences, and budget to match you with rooms that feel like home — before you even visit.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/register">
                <Button size="lg" className="bg-gold-gradient text-obsidian font-bold text-base px-8 hover:opacity-90 h-12 gap-2">
                  Start Finding Rooms
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/tenant/search">
                <Button size="lg" variant="outline" className="border-border/60 hover:border-gold/40 h-12 px-8 text-base gap-2">
                  Browse Listings
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {stats.map(({ value, label }) => (
                <div key={label} className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold gold-text">{value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Room Showcase */}
        <section className="py-16 bg-card/20">
          <div className="mx-auto max-w-screen-xl px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Premium Listings, <span className="gold-text">AI-Ranked for You</span>
              </h2>
              <p className="text-muted-foreground text-sm">Each room comes with a personalized compatibility score based on your profile.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roomShowcase.map((room) => (
                <div key={room.title} className="luxury-card rounded-xl overflow-hidden group">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={room.image} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <span className="text-xs font-bold text-gold">{room.score}% Match</span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <p className="text-white font-bold">₹{room.rent.toLocaleString()}<span className="text-sm font-normal opacity-80">/mo</span></p>
                      <p className="text-white/80 text-xs">{room.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/tenant/search">
                <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 gap-2">
                  Explore All Listings <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="mx-auto max-w-screen-xl px-6">
            <div className="text-center mb-14">
              <Badge className="mb-4 bg-muted text-muted-foreground border-border/60 text-xs">Why Choose Us</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to{' '}
                <span className="gold-text">Find Home</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                From intelligent matching to verified listings — we have built every tool to make the room-hunting process effortless.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, desc, color, bg }) => (
                <div key={title} className="luxury-card rounded-xl p-6 space-y-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-card/20">
          <div className="mx-auto max-w-screen-xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground">Three simple steps to your perfect room.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {[
                { step: '01', title: 'Build Your Profile', desc: 'Tell us about your lifestyle, budget, and preferences — or just describe your ideal room in plain text.', icon: Users },
                { step: '02', title: 'AI Finds Matches', desc: 'Our engine scores every listing against your profile and ranks them by compatibility — not just keyword matches.', icon: Brain },
                { step: '03', title: 'Connect & Move In', desc: 'Chat directly with owners, schedule visits, and move into your best match faster than ever.', icon: Building2 },
              ].map(({ step, title, desc, icon: Icon }, i) => (
                <div key={step} className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-lg">
                      <Icon className="h-7 w-7 text-obsidian" />
                    </div>
                    <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-muted border border-border text-[10px] font-bold flex items-center justify-center text-muted-foreground">
                      {step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="mx-auto max-w-screen-xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Loved by Thousands</h2>
              <p className="text-muted-foreground">Real stories from tenants and owners across India.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map(({ name, role, avatar, text, rating }) => (
                <div key={name} className="luxury-card rounded-xl p-6 space-y-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">"{text}"</p>
                  <div className="flex items-center gap-3">
                    <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover ring-1 ring-gold/30" />
                    <div>
                      <p className="text-sm font-semibold">{name}</p>
                      <p className="text-xs text-muted-foreground">{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-gold/6 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-3xl px-6 text-center">
            <div className="glass-gold rounded-2xl p-10 md:p-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Find Your <span className="gold-text">Perfect Match?</span>
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Join 200,000+ tenants and 50,000+ verified listings. Start for free today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register?role=tenant">
                  <Button size="lg" className="bg-gold-gradient text-obsidian font-bold h-12 px-8 hover:opacity-90">
                    I'm Looking for a Room
                  </Button>
                </Link>
                <Link href="/register?role=owner">
                  <Button size="lg" variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 h-12 px-8">
                    I'm Listing a Room
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
