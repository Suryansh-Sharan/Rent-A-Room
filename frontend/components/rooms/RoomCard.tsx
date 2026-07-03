'use client';

import Link from 'next/link';
import { Heart, MapPin, Wifi, Car, Star, Eye, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import type { Room } from '@/lib/mock/rooms';
import CompatibilityBadge from './CompatibilityBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const amenityIcons: Record<string, string> = {
  WiFi: '📶', Parking: '🚗', Balcony: '🏡', Kitchen: '🍳', Laundry: '🧺',
  'Attached Bathroom': '🚿', 'Pet Friendly': '🐾', 'Near College': '🎓',
  'Near Metro': '🚇', 'Quiet Area': '🤫', 'Study Friendly': '📚',
  Vegetarian: '🥗', 'Non Smoking': '🚭', Sunlight: '☀️',
};

interface RoomCardProps {
  room: Room;
  showActions?: boolean;
  onInterested?: (id: string) => void;
}

export default function RoomCard({ room, showActions = true, onInterested }: RoomCardProps) {
  const { savedRooms, toggleSaveRoom } = useAppStore();
  const isSaved = savedRooms.includes(room.id);

  return (
    <div className="luxury-card rounded-xl overflow-hidden group flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={room.images[0]}
            alt={room.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status badge */}
        <Badge
          className={cn(
            'absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wide',
            room.status === 'active' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
          )}
        >
          {room.status === 'active' ? 'Available' : room.status}
        </Badge>

        {/* Compatibility badge overlay */}
        {room.compatibilityScore !== undefined && (
          <div className="absolute top-3 right-3 bg-black/70 rounded-full px-2 py-1 backdrop-blur-sm">
            <span className="text-xs font-bold text-gold">{room.compatibilityScore}% Match</span>
          </div>
        )}

        {/* Rent */}
        <div className="absolute bottom-3 left-3">
          <span className="text-white font-bold text-lg drop-shadow-lg">
            ₹{room.rent.toLocaleString()}
            <span className="text-sm font-normal opacity-80">/mo</span>
          </span>
        </div>

        {/* Save button */}
        <button
          onClick={() => toggleSaveRoom(room.id)}
          className={cn(
            'absolute bottom-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition-all',
            isSaved
              ? 'bg-gold text-obsidian shadow-lg'
              : 'bg-black/60 text-white hover:bg-gold/80 hover:text-obsidian'
          )}
        >
          <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-gold transition-colors">
            {room.title}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            {room.location}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {room.roomType && (
            <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5 capitalize">
              {room.roomType}
            </span>
          )}
          <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5 capitalize">
            {room.furnishing}
          </span>
          <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">
            {room.floorArea} sq ft
          </span>
        </div>

        {/* Amenity icons */}
        <div className="flex flex-wrap gap-1">
          {room.amenities.slice(0, 5).map((amenity) => (
            <span key={amenity} title={amenity} className="text-sm" role="img" aria-label={amenity}>
              {amenityIcons[amenity] || '✓'}
            </span>
          ))}
          {room.amenities.length > 5 && (
            <span className="text-[10px] text-muted-foreground">+{room.amenities.length - 5}</span>
          )}
        </div>

        {/* AI Summary */}
        {room.compatibilityScore !== undefined && (
          <div className="flex items-start gap-2 bg-gold/5 border border-gold/15 rounded-lg p-2.5">
            <Sparkles className="h-3.5 w-3.5 text-gold flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground line-clamp-2">
              <span className="text-gold font-medium">AI: </span>
              {room.compatibilityScore >= 90 ? 'Excellent match for your preferences.' : room.compatibilityScore >= 75 ? 'Good match with some minor gaps.' : 'Partial match — review before deciding.'}
            </p>
          </div>
        )}

        {/* Compatibility */}
        {room.compatibilityScore !== undefined && (
          <CompatibilityBadge score={room.compatibilityScore} size="sm" />
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 mt-auto pt-1">
            <Link href={`/tenant/rooms/${room.id}`} className="flex-1">
              <Button size="sm" className="w-full bg-gold-gradient text-obsidian font-semibold hover:opacity-90 text-xs">
                View Details
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-gold/30 text-gold hover:bg-gold/10"
              onClick={() => onInterested?.(room.id)}
            >
              Interested
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
