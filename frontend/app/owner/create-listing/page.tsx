'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Upload, X, CheckCircle, Plus, Sparkles, Eye, MapPin,
  Home, Layers, IndianRupee, Calendar
} from 'lucide-react';
import { allAmenities } from '@/lib/mock/rooms';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';

const sampleImages = [
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
  'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
  'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
];

export default function CreateListingPage() {
  const router = useRouter();
  const { uploadListingImage, createListing } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['WiFi', 'Kitchen']);
  const [rent, setRent] = useState(25000);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    city: '',
    area: '',
    description: '',
    roomType: '',
    furnishing: '',
    floorArea: '',
    floor: '',
    totalFloors: '',
    deposit: '',
    availableFrom: '',
  });

  const toggleAmenity = (a: string) =>
    setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploadingImage(true);
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      try {
        const url = await uploadListingImage(file);
        setImages((prev) => [...prev, url]);
        toast.success(`Image uploaded successfully!`);
      } catch (err: any) {
        toast.error(`Failed to upload image: ${err.message}`);
      }
    }
    setUploadingImage(false);
  };

  const handlePublish = async () => {
    if (images.length === 0) {
      toast.error('Please upload at least one image.');
      return;
    }
    if (!formData.title || !formData.city || !formData.area || !formData.roomType || !formData.furnishing || !formData.availableFrom) {
      toast.error('Please fill in all required basic fields.');
      return;
    }

    setLoading(true);
    try {
      await createListing({
        title: formData.title,
        description: formData.description,
        rent: rent,
        deposit: Number(formData.deposit) || rent * 2,
        location: `${formData.area}, ${formData.city}`,
        city: formData.city,
        area: formData.area,
        roomType: formData.roomType,
        furnishing: formData.furnishing,
        images: images,
        availableFrom: formData.availableFrom,
        amenities: selectedAmenities,
        floorArea: Number(formData.floorArea) || null,
        floor: Number(formData.floor) || null,
        totalFloors: Number(formData.totalFloors) || null
      });

      toast.success('Listing published successfully!', { description: 'Your room is now live for tenants to discover.' });
      router.push('/owner/listings');
    } catch (err: any) {
      toast.error(`Failed to publish listing: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Listing</h1>
          <p className="text-muted-foreground text-sm mt-1">Fill in the details to list your property.</p>
        </div>
        <Button
          variant="outline"
          className={cn('border-border/60 gap-2', previewMode && 'border-gold/40 text-gold bg-gold/10')}
          onClick={() => setPreviewMode(!previewMode)}
        >
          <Eye className="h-4 w-4" />
          {previewMode ? 'Edit Mode' : 'Preview'}
        </Button>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-1">
        {['Basic Info', 'Images', 'Amenities', 'Review'].map((label, i) => (
          <div key={label} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center">
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                i + 1 < step ? 'bg-emerald-500 text-white' : i + 1 === step ? 'bg-gold text-obsidian' : 'bg-muted text-muted-foreground'
              )}>
                {i + 1 < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn('text-[10px] mt-1 whitespace-nowrap', i + 1 === step ? 'text-gold' : 'text-muted-foreground')}>
                {label}
              </span>
            </div>
            {i < 3 && <div className={cn('flex-1 h-px mt-[-14px]', i + 1 < step ? 'bg-emerald-500' : 'bg-border/60')} />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="luxury-card rounded-xl p-6 space-y-5">
          <h2 className="font-semibold flex items-center gap-2"><Home className="h-4 w-4 text-gold" />Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label>Listing Title</Label>
              <Input placeholder="e.g. Luxury Studio with Sea View in Bandra West" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-muted/50 border-border/60 focus:border-gold/50" />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input placeholder="Mumbai" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="bg-muted/50 border-border/60 focus:border-gold/50" />
            </div>
            <div className="space-y-1.5">
              <Label>Area / Locality</Label>
              <Input placeholder="Bandra West" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className="bg-muted/50 border-border/60 focus:border-gold/50" />
            </div>
            <div className="space-y-1.5">
              <Label>Room Type</Label>
              <Select value={formData.roomType} onValueChange={(v) => setFormData({ ...formData, roomType: v })}>
                <SelectTrigger className="bg-muted/50 border-border/60"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {['single', 'double', 'studio', 'shared', 'penthouse'].map((t) => (
                    <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Furnishing</Label>
              <Select value={formData.furnishing} onValueChange={(v) => setFormData({ ...formData, furnishing: v })}>
                <SelectTrigger className="bg-muted/50 border-border/60"><SelectValue placeholder="Select furnishing" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="furnished">Furnished</SelectItem>
                  <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                  <SelectItem value="unfurnished">Unfurnished</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Floor Area (sq ft)</Label>
              <Input type="number" placeholder="650" value={formData.floorArea} onChange={(e) => setFormData({ ...formData, floorArea: e.target.value })} className="bg-muted/50 border-border/60 focus:border-gold/50" />
            </div>
            <div className="space-y-1.5">
              <Label>Available From</Label>
              <Input type="date" value={formData.availableFrom} onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })} className="bg-muted/50 border-border/60 focus:border-gold/50" />
            </div>
            <div className="space-y-1.5">
              <Label>Security Deposit (₹)</Label>
              <Input type="number" placeholder="50000" value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: e.target.value })} className="bg-muted/50 border-border/60 focus:border-gold/50" />
            </div>
            <div className="space-y-1.5">
              <Label>Floor Number</Label>
              <Input type="number" placeholder="3" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} className="bg-muted/50 border-border/60 focus:border-gold/50" />
            </div>
            <div className="space-y-1.5">
              <Label>Total Floors</Label>
              <Input type="number" placeholder="5" value={formData.totalFloors} onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })} className="bg-muted/50 border-border/60 focus:border-gold/50" />
            </div>
          </div>

          {/* Rent slider */}
          <div>
            <div className="flex justify-between mb-3">
              <Label>Monthly Rent</Label>
              <span className="text-sm font-bold gold-text">₹{rent.toLocaleString()}</span>
            </div>
            <Slider min={5000} max={150000} step={1000} value={[rent]} onValueChange={([v]) => setRent(v)} />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">₹5,000</span>
              <span className="text-xs text-muted-foreground">₹1,50,000</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your property in detail — location advantages, nearby landmarks, house rules, etc."
              className="w-full min-h-[100px] rounded-lg bg-muted/50 border border-border/60 focus:border-gold/50 p-3 text-sm resize-none outline-none transition-colors"
            />
          </div>

          <Button onClick={() => setStep(2)} className="bg-gold-gradient text-obsidian font-bold hover:opacity-90">Continue to Images</Button>
        </div>
      )}

      {/* Step 2: Images */}
      {step === 2 && (
        <div className="luxury-card rounded-xl p-6 space-y-5">
          <h2 className="font-semibold flex items-center gap-2"><Upload className="h-4 w-4 text-gold" />Property Images</h2>
          <p className="text-sm text-muted-foreground">Upload high quality images to attract more tenants. First image will be the cover photo.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((src, i) => (
              <div key={i} className="relative group aspect-[4/3] rounded-xl overflow-hidden">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="h-8 w-8 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {i === 0 && (
                  <Badge className="absolute top-2 left-2 bg-gold text-obsidian text-[10px]">Cover</Badge>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="aspect-[4/3] rounded-xl border-2 border-dashed border-border/60 hover:border-gold/40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-gold transition-colors disabled:opacity-50"
            >
              {uploadingImage ? (
                <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 border-t-gold animate-spin" />
              ) : (
                <Plus className="h-6 w-6" />
              )}
              <span className="text-xs">{uploadingImage ? 'Uploading...' : 'Add Image'}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="border-border/60" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} className="bg-gold-gradient text-obsidian font-bold hover:opacity-90">Continue to Amenities</Button>
          </div>
        </div>
      )}

      {/* Step 3: Amenities */}
      {step === 3 && (
        <div className="luxury-card rounded-xl p-6 space-y-5">
          <h2 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-gold" />Amenities & Preferences</h2>
          <p className="text-sm text-muted-foreground">Select what your property offers. This directly affects AI compatibility scoring for tenants.</p>
          <div className="flex flex-wrap gap-2">
            {allAmenities.map((a) => (
              <button
                key={a}
                onClick={() => toggleAmenity(a)}
                className={cn(
                  'px-3 py-2 rounded-xl text-sm font-medium transition-all border',
                  selectedAmenities.includes(a)
                    ? 'bg-gold/15 text-gold border-gold/40'
                    : 'border-border/60 text-muted-foreground hover:border-gold/30 hover:text-foreground'
                )}
              >
                {selectedAmenities.includes(a) && <CheckCircle className="h-3 w-3 inline mr-1.5" />}
                {a}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-border/60" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={() => setStep(4)} className="bg-gold-gradient text-obsidian font-bold hover:opacity-90">Review Listing</Button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Publish */}
      {step === 4 && (
        <div className="space-y-5">
          <div className="glass-gold rounded-xl p-5">
            <h2 className="font-semibold flex items-center gap-2 mb-4"><Eye className="h-4 w-4 text-gold" />Preview Your Listing</h2>
            <div className="luxury-card rounded-xl overflow-hidden">
              {images[0] && (
                <div className="aspect-[16/7] overflow-hidden">
                  <img src={images[0]} alt="Cover" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold">{formData.title || 'Your listing title'}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />{[formData.area, formData.city].filter(Boolean).join(', ') || 'Location'}
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold gold-text">₹{rent.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Available</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAmenities.slice(0, 6).map((a) => (
                    <Badge key={a} variant="outline" className="text-[10px] border-border/60">{a}</Badge>
                  ))}
                  {selectedAmenities.length > 6 && <Badge variant="outline" className="text-[10px] border-border/60">+{selectedAmenities.length - 6} more</Badge>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="border-border/60" onClick={() => setStep(3)}>Back</Button>
            <Button
              className="bg-gold-gradient text-obsidian font-bold hover:opacity-90 gap-2"
              onClick={handlePublish}
              disabled={loading}
            >
              {loading ? <div className="h-4 w-4 rounded-full border-2 border-obsidian/30 border-t-obsidian animate-spin" /> : null}
              {loading ? 'Publishing...' : 'Publish Listing'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
