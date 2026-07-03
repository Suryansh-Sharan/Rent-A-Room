'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import RoomCard from '@/components/rooms/RoomCard';
import SearchFilters from '@/components/rooms/SearchFilters';
import { EmptyRooms } from '@/components/ui/EmptyStates';
import { CardSkeleton } from '@/components/ui/Skeletons';
import { Button } from '@/components/ui/button';
import { Grid, List, SortAsc } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const defaultFilters = {
  location: '',
  minBudget: 5000,
  maxBudget: 100000,
  moveInDate: '',
  roomType: '',
  furnishing: '',
  amenities: [] as string[],
  description: '',
};

export default function SearchPage() {
  const { currentUser, rooms, fetchRooms } = useAppStore();
  const [filters, setFilters] = useState(defaultFilters);
  const [sort, setSort] = useState('compatibility');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(true);

  useEffect(() => {
    fetchRooms(currentUser?.location || '');
  }, [currentUser?.location, fetchRooms]);

  const handleSearch = () => {
    setLoading(true);
    fetchRooms(filters.location).finally(() => setLoading(false));
    setSearched(true);
  };

  const filtered = rooms.filter((room) => {
    if (filters.location && 
        !room.location.toLowerCase().includes(filters.location.toLowerCase()) &&
        !room.city.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (room.rent < filters.minBudget || room.rent > filters.maxBudget) return false;
    if (filters.roomType && room.roomType !== filters.roomType) return false;
    if (filters.furnishing && room.furnishing !== filters.furnishing) return false;
    if (filters.amenities.length > 0 && !filters.amenities.every((a) => room.amenities.includes(a))) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'compatibility') return (b.compatibilityScore ?? 0) - (a.compatibilityScore ?? 0);
    if (sort === 'price-asc') return a.rent - b.rent;
    if (sort === 'price-desc') return b.rent - a.rent;
    if (sort === 'newest') return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    return 0;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Search Rooms</h1>
        <p className="text-muted-foreground text-sm mt-1">Find rooms ranked by AI compatibility with your profile.</p>
      </div>

      <SearchFilters filters={filters} onChange={setFilters} onSearch={handleSearch} />

      {searched && (
        <>
          {/* Results header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Searching...' : <><span className="font-semibold text-foreground">{sorted.length}</span> rooms found</>}
            </p>
            <div className="flex items-center gap-3">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-44 h-8 text-xs border-border/60">
                  <SortAsc className="h-3 w-3 mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compatibility">Best Match</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex rounded-lg border border-border/60 overflow-hidden">
                <button
                  onClick={() => setView('grid')}
                  className={cn('px-2.5 py-1.5 transition-colors', view === 'grid' ? 'bg-gold/10 text-gold' : 'text-muted-foreground hover:text-foreground')}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={cn('px-2.5 py-1.5 transition-colors', view === 'list' ? 'bg-gold/10 text-gold' : 'text-muted-foreground hover:text-foreground')}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className={cn('grid gap-6', view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <EmptyRooms
              action={
                <Button
                  variant="outline"
                  className="border-gold/30 text-gold hover:bg-gold/10"
                  onClick={() => setFilters(defaultFilters)}
                >
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <div className={cn('grid gap-6', view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-2xl')}>
              {sorted.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
