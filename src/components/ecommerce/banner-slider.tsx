"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Banner {
  id: string;
  title: string | null;
  image: string;
  link: string | null;
  linkText: string | null;
}

interface BannerSliderProps {
  banners: Banner[];
}

export function BannerSlider({ banners }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">No banners available</p>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      {currentBanner.link ? (
        <Link href={currentBanner.link} className="block w-full h-full">
          <div className="relative w-full h-full min-h-[300px]">
            <Image
              src={currentBanner.image}
              alt={currentBanner.title || "Banner"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {currentBanner.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-white font-semibold text-lg">{currentBanner.title}</h3>
                {currentBanner.linkText && (
                  <p className="text-white/90 text-sm mt-1">{currentBanner.linkText}</p>
                )}
              </div>
            )}
          </div>
        </Link>
      ) : (
        <div className="relative w-full h-full min-h-[300px]">
          <Image
            src={currentBanner.image}
            alt={currentBanner.title || "Banner"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {currentBanner.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <h3 className="text-white font-semibold text-lg">{currentBanner.title}</h3>
              {currentBanner.linkText && (
                <p className="text-white/90 text-sm mt-1">{currentBanner.linkText}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

