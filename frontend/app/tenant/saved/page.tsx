'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import RoomCard from '@/components/rooms/RoomCard';
import { EmptyState } from '@/components/ui/EmptyStates';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SavedRoomsPage() {
  const { savedRooms, rooms: storeRooms, fetchRooms, currentUser } = useAppStore();

  useEffect(() => {
    fetchRooms(currentUser?.location || '');
  }, [currentUser?.location, fetchRooms]);

  const rooms = storeRooms.filter((r) => savedRooms.includes(r.id));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Saved Rooms</h1>
        <p className="text-muted-foreground text-sm mt-1">{rooms.length} rooms saved</p>
      </div>

      {rooms.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved rooms yet"
          description="Browse and save rooms you're interested in. They'll appear here for easy access."
          action={
            <Link href="/tenant/search">
              <Button className="bg-gold-gradient text-obsidian font-semibold hover:opacity-90">Browse Rooms</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
