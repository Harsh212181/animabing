 // src/components/FeaturedAnimeCarousel.tsx - EVEN SMALLER INNER CARD
"use client"

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import type { Anime } from '../types';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

interface Props {
  featuredAnimes: Anime[];
  onAnimeSelect: (anime: Anime) => void;
}

const optimizeImageUrl = (url: string, width: number, height: number): string => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  try {
    const baseUrl = url.split('/upload/')[0];
    const rest = url.split('/upload/')[1];
    const imagePath = rest.split('/').slice(1).join('/');
    
    return `${baseUrl}/upload/f_webp,q_auto:best,w_${width},h_${height},c_fill,g_auto/${imagePath}`;
  } catch (error) {
    console.error('Error optimizing image URL:', error);
    return url;
  }
};

const FeaturedAnimeCarousel: React.FC<Props> = ({ featuredAnimes, onAnimeSelect }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Create bannerAnimes (reverse order of featuredAnimes) and carouselAnimes (original order)
  const { bannerAnimes, carouselAnimes } = useMemo(() => {
    if (!featuredAnimes || featuredAnimes.length === 0) {
      return { bannerAnimes: [], carouselAnimes: [] };
    }

    // For banner: take all animes in reverse order (latest first in reverse)
    const bannerAnimes = [...featuredAnimes].reverse();
    
    // For carousel: use all animes in original order
    const carouselAnimes = [...featuredAnimes];
    
    return { bannerAnimes, carouselAnimes };
  }, [featuredAnimes]);

  // Reset currentIndex when bannerAnimes changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [bannerAnimes]);

  if (!featuredAnimes || featuredAnimes.length === 0) {
    return null;
  }

  // If bannerAnimes is empty, don't render banner
  const currentAnime = bannerAnimes.length > 0 ? bannerAnimes[currentIndex] : null;

  const nextSlide = useCallback(() => {
    if (bannerAnimes.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % bannerAnimes.length);
    }
  }, [bannerAnimes.length]);

  const prevSlide = useCallback(() => {
    if (bannerAnimes.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + bannerAnimes.length) % bannerAnimes.length);
    }
  }, [bannerAnimes.length]);

  // Auto-play for featured banner - 3 SECONDS
  useEffect(() => {
    if (!isAutoPlaying || bannerAnimes.length <= 1) return;
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, bannerAnimes.length]);

  return (
    <div className="mb-4 lg:mb-6 space-y-4">
      {/* BANNER SECTION - Only show if we have banner anime */}
      {currentAnime && (
        <>
          {/* MOBILE VIEW - Banner (UNCHANGED) */}
          <div className="block md:hidden">
            <div
              className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl rounded-xl"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <div className="relative h-[200px]">
                {/* Background with gradient overlay */}
                <div className="absolute inset-0">
                  <img
                    src={optimizeImageUrl(currentAnime.thumbnail, 600, 300)}
                    alt={currentAnime.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Enhanced Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-slate-950/70"></div>
                </div>

                {/* Content - Mobile Layout */}
                <div className="relative z-10 h-full flex items-center px-4">
                  <div className="flex items-center gap-3 w-full">
                    {/* Thumbnail with better shadow */}
                    <div className="relative w-28 flex-shrink-0">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl shadow-purple-900/50 ring-2 ring-purple-500/30">
                        <img
                          src={optimizeImageUrl(currentAnime.thumbnail, 180, 270)}
                          alt={currentAnime.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="space-y-2">
                        {/* Title */}
                        <h2 className="text-base font-bold text-white line-clamp-2 leading-tight drop-shadow-lg">
                          {currentAnime.title}
                        </h2>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5">
                          {currentAnime.status && (
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                currentAnime.status === "Ongoing"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              }`}
                            >
                              {currentAnime.status}
                            </span>
                          )}
                          {currentAnime.subDubStatus && (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-600/80 text-white border border-purple-500">
                              {currentAnime.subDubStatus}
                            </span>
                          )}
                          {currentAnime.releaseYear && (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800/60 text-slate-300 border border-slate-700">
                              {currentAnime.releaseYear}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Watch Now Button */}
                      <button
                        onClick={() => onAnimeSelect(currentAnime)}
                        className="mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-500/30 hover:from-purple-500 hover:to-purple-600 transition-all duration-300 active:scale-95"
                      >
                        Watch Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Navigation Arrows - Only show if multiple banner animes */}
                {bannerAnimes.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-white text-sm font-bold hover:bg-slate-800 transition-all"
                      aria-label="Previous"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-white text-sm font-bold hover:bg-slate-800 transition-all"
                      aria-label="Next"
                    >
                      →
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                      {bannerAnimes.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentIndex(i)}
                          className={`transition-all duration-300 ${
                            i === currentIndex 
                              ? "w-5 h-1.5 bg-purple-500 rounded-full"
                              : "w-1.5 h-1.5 bg-slate-600/80 rounded-full hover:bg-slate-500"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* PC VIEW - Banner with even smaller inner card */}
          <div className="hidden md:block">
            <div
              className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl rounded-2xl"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              {/* Banner height same - 330px */}
              <div className="relative h-[330px]">
                {/* Background with cleaner overlay */}
                <div className="absolute inset-0">
                  <img
                    src={optimizeImageUrl(currentAnime.thumbnail, 1400, 400)}
                    alt={currentAnime.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Clean Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                </div>

                {/* Content - PC Layout with EVEN SMALLER anime card */}
                <div className="relative z-10 h-full flex items-center px-10">
                  <div className="flex items-center gap-8 w-full h-full">
                    {/* Thumbnail - EVEN SMALLER CARD */}
                    <div className="relative flex-shrink-0">
                      <div className="absolute -inset-1.5">
                        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent blur-xl opacity-50"></div>
                      </div>
                      {/* Container with SMALLER width - changed from w-56 to w-48 */}
                      <div className="relative w-48">
                        <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-purple-900/30 ring-2 ring-purple-500/30 aspect-[2/3]">
                          <img
                            src={optimizeImageUrl(currentAnime.thumbnail, 192, 288)}  // Reduced from 224,336
                            alt={currentAnime.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Info - Adjusted for smaller card */}
                    <div className="flex-1 min-w-0 py-4 h-full flex flex-col justify-center">
                      {/* Top Section */}
                      <div className="space-y-3">
                        {/* Anime Title - Slightly smaller font */}
                        <div>
                          <h2 className="text-2xl font-bold text-white leading-tight drop-shadow-lg">
                            {currentAnime.title}
                          </h2>
                        </div>

                        {/* Badges - Smaller padding */}
                        <div className="flex flex-wrap gap-1.5">
                          {currentAnime.status && (
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-bold ${
                                currentAnime.status === "Ongoing"
                                  ? "bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                                  : "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/30"
                              }`}
                            >
                              {currentAnime.status}
                            </span>
                          )}
                          {currentAnime.releaseYear && (
                            <span className="px-2.5 py-1 rounded text-xs font-bold bg-gradient-to-r from-slate-800/40 to-slate-900/40 text-slate-300 border border-slate-700">
                              {currentAnime.releaseYear}
                            </span>
                          )}
                          {currentAnime.subDubStatus && (
                            <span className="px-2.5 py-1 rounded text-xs font-bold bg-gradient-to-r from-purple-600 to-purple-700 text-white border border-purple-500">
                              {currentAnime.subDubStatus}
                            </span>
                          )}
                        </div>

                        {/* Description - Smaller font */}
                        {currentAnime.description && (
                          <p className="text-slate-300 text-xs leading-relaxed max-w-2xl line-clamp-2">
                            {currentAnime.description}
                          </p>
                        )}

                        {/* Genres - Smaller */}
                        {currentAnime.genreList && currentAnime.genreList.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {currentAnime.genreList.slice(0, 4).map((genre, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-xs bg-slate-800/40 text-slate-300 border border-slate-700 hover:bg-slate-700/50 transition-colors"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Section: Watch Now Button - Slightly smaller */}
                      <div className="mt-5">
                        <button
                          onClick={() => onAnimeSelect(currentAnime)}
                          className="group relative px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 text-sm active:scale-95"
                        >
                          <span className="relative z-10">Watch Now</span>
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Arrows - Slightly smaller to match */}
                {bannerAnimes.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-white hover:bg-slate-800 hover:scale-110 transition-all z-20 text-base font-bold shadow-lg"
                      aria-label="Previous"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-white hover:bg-slate-800 hover:scale-110 transition-all z-20 text-base font-bold shadow-lg"
                      aria-label="Next"
                    >
                      →
                    </button>

                    {/* Dots Indicator - Smaller */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                      {bannerAnimes.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentIndex(i)}
                          className={`transition-all duration-300 ${
                            i === currentIndex 
                              ? "w-5 h-1.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                              : "w-1.5 h-1.5 bg-slate-700 rounded-full hover:bg-slate-600 hover:w-2"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* LATEST ANIME TITLE SECTION - Same for both */}
      <div className="px-3 sm:px-4 md:px-5">
        {/* Latest Anime Title */}
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              Latest Anime
            </h2>
          </div>
        </div>

        {/* Swiper Carousel for Latest Anime - Uses carouselAnimes (original order) */}
        {carouselAnimes.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={8}
            slidesPerView={2}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 8,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 10,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 12,
              },
              1280: {
                slidesPerView: 6,
                spaceBetween: 12,
              },
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            loop={carouselAnimes.length >= 5}
            speed={800}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="featured-swiper rounded-lg"
          >
            {carouselAnimes.map((anime, index) => {
              const optimizedThumbnail = optimizeImageUrl(anime.thumbnail, 193, 289);

              return (
                <SwiperSlide key={anime.id || anime._id || index}>
                  <div
                    className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    onClick={() => onAnimeSelect(anime)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onAnimeSelect(anime);
                      }
                    }}
                  >
                    <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-gradient-to-br from-slate-800 to-slate-900">
                      <img
                        src={optimizedThumbnail}
                        alt={anime.title}
                        className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap">
                          {anime.contentType || 'Anime'}
                        </span>
                      </div>
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent transition-colors duration-300 group-hover:from-black/97 flex flex-col justify-end p-2 sm:p-3 md:p-4">
                        <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
                          <h3 className="text-white font-bold line-clamp-2 mb-1.5 text-xs sm:text-sm md:text-base leading-tight drop-shadow-lg">
                            {anime.title}
                          </h3>
                          <div className="flex justify-between items-center">
                            <p className="text-slate-300 text-xs sm:text-sm">
                              {anime.releaseYear || 'N/A'}
                            </p>
                            <span className="bg-gradient-to-r from-purple-600/90 to-purple-700/90 text-white text-xs font-medium px-2 py-1 rounded-md shadow-md whitespace-nowrap">
                              {anime.subDubStatus || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover Effect */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/50 rounded-lg transition-all duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          <div className="text-center py-8 text-slate-400">
            No anime available to display
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedAnimeCarousel;