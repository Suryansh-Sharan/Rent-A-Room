'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import ImageGallery from '@/components/rooms/ImageGallery';
import CompatibilityBadge from '@/components/rooms/CompatibilityBadge';
import AIExplanationCard from '@/components/rooms/AIExplanationCard';
import RoomCard from '@/components/rooms/RoomCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin, Home, Layers, Calendar, Eye, Heart, MessageSquare,
  Star, CheckCircle, ArrowLeft, Share2, Flag, Wifi, Car
} from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';

const amenityIcons: Record<string, string> = {
  WiFi: '📶', Parking: '🚗', Balcony: '🏡', Kitchen: '🍳', Laundry: '🧺',
  'Attached Bathroom': '🚿', 'Pet Friendly': '🐾', 'Near College': '🎓',
  'Near Metro': '🚇', 'Quiet Area': '🤫', 'Study Friendly': '📚',
  Vegetarian: '🥗', 'Non Smoking': '🚭', Sunlight: '☀️',
};

export default function RoomDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { currentUser, savedRooms, toggleSaveRoom, rooms, fetchRooms, submitRequest, requests, fetchRequests } = useAppStore();

  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingInterest, setSendingInterest] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    fetch(`http://localhost:8000/api/rooms/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Room not found");
      })
      .then((data) => {
        setRoom(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
      
    fetchRequests();
    if (rooms.length === 0) {
      fetchRooms();
    }
  }, [id, rooms.length, fetchRooms, fetchRequests]);

  const handleSendInterest = async () => {
    if (!room) return;
    setSendingInterest(true);
    try {
      await submitRequest(room.id, "I am interested in this room listing!");
      alert("Interest request submitted successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to submit request.");
    } finally {
      setSendingInterest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!room) return notFound();

  // Dynamic compatibility and owner details from database response
  const compat = (room.compatibilityScore !== null && room.compatibilityScore !== undefined) ? {
    roomId: room.id,
    userId: currentUser?.id || '',
    overallScore: room.compatibilityScore,
    matchQuality: (room.compatibilityScore >= 90 ? 'Excellent' : room.compatibilityScore >= 75 ? 'Good' : 'Average') as any,
    strengths: room.strengths || [],
    missing: room.missingPreferences || [],
    aiExplanation: room.summary || "No AI explanation available.",
    breakdown: {
      lifestyle: room.compatibilityScore,
      location: room.ruleScore !== null ? Math.min(100, Math.max(0, room.ruleScore)) : room.compatibilityScore,
      budget: room.compatibilityScore,
      amenities: room.compatibilityScore
    },
    isAIBased: room.summary ? !room.summary.toLowerCase().includes("fallback") : true
  } : null;
  const owner = {
    name: room.ownerName,
    avatar: room.ownerAvatar,
    rating: room.ownerRating,
    verified: true,
    totalListings: 1,
    bio: "Property owner committed to providing high-quality housing and excellent tenant support."
  };
  
  const isSaved = savedRooms.includes(room.id);
  const hasSubmitted = requests.some((r) => r.roomId === room.id);
  const similar = rooms.filter((r) => r.id !== room.id && r.city === room.city).slice(0, 3);

  const highlights = room.highlights || [
    room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1),
    room.furnishing.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    "Deposit: ₹" + room.deposit.toLocaleString()
  ];



  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* Back */}
      <Link href="/tenant/search" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to results
      </Link>

      {/* Image Gallery */}
      <ImageGallery images={room.images} alt={room.title} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & meta */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <div>
                <Badge className={room.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-2' : 'bg-red-500/20 text-red-400 mb-2'}>
                  {room.status === 'active' ? 'Available' : room.status}
                </Badge>
                <h1 className="text-2xl font-bold">{room.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleSaveRoom(room.id)} className={`h-9 w-9 rounded-full border flex items-center justify-center transition-all ${isSaved ? 'bg-gold/10 border-gold/40 text-gold' : 'border-border/60 text-muted-foreground hover:border-gold/40 hover:text-gold'}`}>
                  <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
                <button className="h-9 w-9 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:border-gold/40 hover:text-gold transition-all">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{room.location}</span>
              <span className="flex items-center gap-1"><Home className="h-3.5 w-3.5" />{room.floorArea} sq ft</span>
              <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" />Floor {room.floor} of {room.totalFloors}</span>
              <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{room.views} views</span>
            </div>
          </div>

          {/* Highlights */}
          <div className="flex flex-wrap gap-2">
            {highlights.map((h: string) => (
              <Badge key={h} className="bg-gold/10 text-gold border-gold/30 text-xs">{h}</Badge>
            ))}
          </div>

          {/* Description */}
          <div>
            <h2 className="font-semibold mb-2">About this room</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{room.description}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Room Type', value: room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1) },
              { label: 'Furnishing', value: room.furnishing.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') },
              { label: 'Available From', value: format(new Date(room.availableFrom), 'dd MMM yyyy') },
              { label: 'Deposit', value: `₹${room.deposit.toLocaleString()}` },
            ].map(({ label, value }) => (
              <div key={label} className="glass rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>

          {/* Amenities */}
          <div>
            <h2 className="font-semibold mb-3">Amenities & Preferences</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {room.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2 glass rounded-lg px-3 py-2">
                  <span className="text-base">{amenityIcons[amenity] || '✓'}</span>
                  <span className="text-sm">{amenity}</span>
                  <CheckCircle className="h-3 w-3 text-emerald-400 ml-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          {compat && (
            <div>
              <h2 className="font-semibold mb-3">AI Compatibility Analysis</h2>
              <AIExplanationCard breakdown={compat} />
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Price card */}
          <div className="luxury-card rounded-xl p-5 sticky top-20">
            <div className="mb-4">
              <span className="text-3xl font-bold gold-text">₹{room.rent.toLocaleString()}</span>
              <span className="text-muted-foreground text-sm">/month</span>
              <p className="text-xs text-muted-foreground mt-1">+ ₹{room.deposit.toLocaleString()} deposit</p>
            </div>

            {compat && (
              <div className="mb-4 p-3 rounded-lg bg-muted/40">
                <CompatibilityBadge score={compat.overallScore} size="md" isRuleBased={!compat.isAIBased} />
              </div>
            )}

            <div className="space-y-2">
              <Button 
                onClick={handleSendInterest} 
                disabled={sendingInterest || hasSubmitted} 
                className="w-full bg-gold-gradient text-obsidian font-bold hover:opacity-90 disabled:opacity-50"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {hasSubmitted ? "Interest Sent" : sendingInterest ? "Sending..." : "Send Interest"}
              </Button>
              <Link href="/tenant/chat">
                <Button variant="outline" className="w-full border-border/60 hover:border-gold/40">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Owner
                </Button>
              </Link>
              <button
                onClick={() => toggleSaveRoom(room.id)}
                className={`w-full h-9 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${isSaved ? 'border-gold/40 bg-gold/10 text-gold' : 'border-border/60 text-muted-foreground hover:border-gold/40 hover:text-gold'}`}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save Room'}
              </button>
            </div>
          </div>

          {/* Owner card */}
          {owner && (
            <div className="luxury-card rounded-xl p-5">
              <h3 className="font-semibold mb-4 text-sm">About the Owner</h3>
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-11 w-11 ring-1 ring-gold/30">
                  <AvatarImage src={owner.avatar} />
                  <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{owner.name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-gold text-gold" />
                    <span className="text-xs font-medium">{owner.rating}</span>
                    <span className="text-xs text-muted-foreground">• {owner.totalListings} listings</span>
                  </div>
                </div>
                {owner.verified && (
                  <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{owner.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Similar Rooms */}
      {similar.length > 0 && (
        <section>
          <h2 className="font-bold text-xl mb-5">Similar Rooms in {room.city}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.map((r) => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
