'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex((i) => (i + 1) % images.length);

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div className="relative rounded-xl overflow-hidden group cursor-pointer" onClick={() => setLightbox(true)}>
          <div className="relative aspect-[16/9] md:aspect-[2/1] w-full bg-muted">
            <img
              src={images[activeIndex]}
              alt={`${alt} ${activeIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="h-4 w-4" />
            </button>
            <span className="absolute bottom-3 right-3 text-xs text-white bg-black/60 rounded-full px-2.5 py-1">
              {activeIndex + 1} / {images.length}
            </span>
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden ring-2 transition-all',
                  i === activeIndex ? 'ring-gold' : 'ring-transparent opacity-60 hover:opacity-80'
                )}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[activeIndex]}
              alt={alt}
              className="w-full h-full object-contain rounded-lg"
            />
            {images.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
