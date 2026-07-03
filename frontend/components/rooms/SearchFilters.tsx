'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { allAmenities } from '@/lib/mock/rooms';

interface SearchFilters {
  location: string;
  minBudget: number;
  maxBudget: number;
  moveInDate: string;
  roomType: string;
  furnishing: string;
  amenities: string[];
  description: string;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

const roomTypes = ['Any', 'Single', 'Double', 'Studio', 'Shared', 'Penthouse'];
const furnishingTypes = ['Any', 'Furnished', 'Semi-Furnished', 'Unfurnished'];

export default function SearchFilters({ filters, onChange, onSearch }: SearchFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const setField = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const toggleAmenity = (amenity: string) => {
    const list = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    setField('amenities', list);
  };

  const activeCount = [
    filters.location,
    filters.roomType && filters.roomType !== 'Any' ? filters.roomType : '',
    filters.furnishing && filters.furnishing !== 'Any' ? filters.furnishing : '',
    ...filters.amenities,
  ].filter(Boolean).length;

  return (
    <div className="glass rounded-xl border border-border/60 p-4 space-y-4">
      {/* Top search row */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by city, area or landmark..."
            value={filters.location}
            onChange={(e) => setField('location', e.target.value)}
            className="pl-9 bg-muted/50 border-border/60 focus:border-gold/50"
          />
        </div>
        <Button
          variant="outline"
          className={cn('gap-2 border-border/60', activeCount > 0 && 'border-gold/40 text-gold')}
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <Badge className="h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-gold text-obsidian">
              {activeCount}
            </Badge>
          )}
        </Button>
        <Button className="bg-gold-gradient text-obsidian font-semibold hover:opacity-90" onClick={onSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="pt-2 border-t border-border/60 space-y-5 animate-fade-in">
          {/* Budget slider */}
          <div>
            <div className="flex justify-between mb-3">
              <span className="text-sm font-medium">Budget Range</span>
              <span className="text-sm text-gold font-semibold">
                ₹{filters.minBudget.toLocaleString()} – ₹{filters.maxBudget.toLocaleString()}
              </span>
            </div>
            <Slider
              min={5000}
              max={100000}
              step={1000}
              value={[filters.minBudget, filters.maxBudget]}
              onValueChange={([min, max]) => onChange({ ...filters, minBudget: min, maxBudget: max })}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Move-in date */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Move-in Date</label>
              <Input
                type="date"
                value={filters.moveInDate}
                onChange={(e) => setField('moveInDate', e.target.value)}
                className="bg-muted/50 border-border/60 focus:border-gold/50"
              />
            </div>

            {/* Room type */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Room Type</label>
              <div className="flex flex-wrap gap-1.5">
                {roomTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setField('roomType', type === 'Any' ? '' : type.toLowerCase())}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                      (filters.roomType === type.toLowerCase() || (type === 'Any' && !filters.roomType))
                        ? 'bg-gold text-obsidian border-gold'
                        : 'border-border/60 text-muted-foreground hover:border-gold/40 hover:text-foreground'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Furnishing */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Furnishing</label>
              <div className="flex flex-wrap gap-1.5">
                {furnishingTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setField('furnishing', type === 'Any' ? '' : type.toLowerCase().replace('-', '-'))}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                      (filters.furnishing === type.toLowerCase() || (type === 'Any' && !filters.furnishing))
                        ? 'bg-gold text-obsidian border-gold'
                        : 'border-border/60 text-muted-foreground hover:border-gold/40 hover:text-foreground'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="text-sm font-medium mb-2 block">Preferences & Amenities</label>
            <div className="flex flex-wrap gap-2">
              {allAmenities.map((amenity) => (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                    filters.amenities.includes(amenity)
                      ? 'bg-gold/15 text-gold border-gold/40'
                      : 'border-border/60 text-muted-foreground hover:border-gold/30 hover:text-foreground'
                  )}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* AI preference description */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Describe your ideal room
              <span className="ml-2 text-[10px] text-gold bg-gold/10 rounded-full px-2 py-0.5">AI Powered</span>
            </label>
            <textarea
              value={filters.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="e.g. I'm a software engineer who works from home. I need fast WiFi, a quiet environment, and a dedicated workspace. I prefer vegetarian households and non-smoking areas..."
              className="w-full min-h-[80px] rounded-lg bg-muted/50 border border-border/60 focus:border-gold/50 p-3 text-sm resize-none outline-none transition-colors placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Clear filters */}
          {activeCount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => onChange({ location: '', minBudget: 5000, maxBudget: 100000, moveInDate: '', roomType: '', furnishing: '', amenities: [], description: '' })}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
              >
                <X className="h-3 w-3" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
