 // src/components/FeaturedAnimeCarousel.tsx - REMOVE VIEW ALL
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
          {/* MOBILE VIEW - Banner */}
          <div className="block md:hidden">
            <div
              className="relative overflow-hidden bg-slate-900/50 shadow-lg rounded-xl"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <div className="relative h-[180px]">
                {/* Background Image with Blur */}
                <div className="absolute inset-0">
                  <img
                    src={optimizeImageUrl(currentAnime.thumbnail, 600, 300)}
                    alt={currentAnime.title}
                    className="w-full h-full object-cover blur-xs scale-105 opacity-30"
                    loading="lazy"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/90"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                </div>

                {/* Content - Mobile Layout */}
                <div className="relative z-10 h-full flex items-center px-3">
                  <div className="flex items-center gap-3 w-full h-full">
                    {/* Thumbnail */}
                    <div className="relative w-24 flex-shrink-0">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/20">
                        <img
                          src={optimizeImageUrl(currentAnime.thumbnail, 160, 240)}
                          alt={currentAnime.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="space-y-1.5">
                        {/* Badges - EXACT SAME POSITION AS BEFORE */}
                        <div className="flex flex-wrap gap-1">
                          {currentAnime.status && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                                currentAnime.status === "Ongoing"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {currentAnime.status}
                            </span>
                          )}
                          {currentAnime.subDubStatus && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                                currentAnime.subDubStatus === "Hindi Dub"
                                  ? "bg-purple-600 text-white border border-purple-700"
                                  : currentAnime.subDubStatus === "Hindi Sub"
                                    ? "bg-purple-600 text-white border border-purple-700"
                                    : "bg-purple-600 text-white border border-purple-700"
                              }`}
                            >
                              {currentAnime.subDubStatus}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h2 className="text-sm font-bold text-white line-clamp-2 leading-tight">
                          {currentAnime.title}
                        </h2>

                        {/* Year */}
                        {currentAnime.releaseYear && (
                          <p className="text-xs text-slate-300">
                            {currentAnime.releaseYear}
                          </p>
                        )}
                      </div>

                      {/* Watch Now Button - CHANGED TO PURPLE */}
                      <button
                        onClick={() => onAnimeSelect(currentAnime)}
                        className="mt-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold text-xs shadow-md shadow-purple-500/30 hover:from-purple-500 hover:to-purple-700 transition-all duration-300"
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
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950/80 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center text-white text-xs font-bold"
                      aria-label="Previous"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950/80 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center text-white text-xs font-bold"
                      aria-label="Next"
                    >
                      →
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                      {bannerAnimes.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentIndex(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            i === currentIndex 
                              ? "w-3 bg-purple-500"
                              : "bg-slate-600/80 hover:bg-slate-500"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* PC VIEW - Banner */}
          <div className="hidden md:block">
            <div
              className="relative overflow-hidden bg-slate-900/50 shadow-lg"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <div className="relative h-[380px]">
                {/* Background Image with Blur */}
                <div className="absolute inset-0">
                  <img
                    src={optimizeImageUrl(currentAnime.thumbnail, 1200, 450)}
                    alt={currentAnime.title}
                    className="w-full h-full object-cover blur-sm scale-110 opacity-50"
                    loading="lazy"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
                </div>

                {/* Content - PC Layout */}
                <div className="relative z-10 h-full flex items-center px-10">
                  <div className="flex items-center gap-8 w-full h-full">
                    {/* Thumbnail - Larger on PC */}
                    <div className="relative w-64 flex-shrink-0 h-full">
                      <div className="relative h-full rounded-xl overflow-hidden shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500/30">
                        <img
                          src={optimizeImageUrl(currentAnime.thumbnail, 320, 480)}
                          alt={currentAnime.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 py-4 h-full flex flex-col justify-between">
                      {/* Top Section */}
                      <div className="space-y-4">
                        {/* Status and Year Badges - EXACT SAME POSITION AS BEFORE */}
                        <div className="flex flex-wrap gap-3">
                          {currentAnime.status && (
                            <span
                              className={`px-3 py-1.5 rounded-lg text-base font-bold ${
                                currentAnime.status === "Ongoing"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {currentAnime.status}
                            </span>
                          )}
                          {currentAnime.releaseYear && (
                            <span className="px-3 py-1.5 rounded-lg text-base font-bold bg-slate-700/50 text-slate-300 border border-slate-600/30">
                              {currentAnime.releaseYear}
                            </span>
                          )}
                          {currentAnime.subDubStatus && (
                            <span
                              className={`px-3 py-1.5 rounded-lg text-base font-bold ${
                                currentAnime.subDubStatus === "Hindi Dub"
                                  ? "bg-purple-600 text-white border border-purple-700"
                                  : currentAnime.subDubStatus === "Hindi Sub"
                                    ? "bg-purple-600 text-white border border-purple-700"
                                    : "bg-purple-600 text-white border border-purple-700"
                              }`}
                            >
                              {currentAnime.subDubStatus}
                            </span>
                          )}
                        </div>

                        {/* Anime Title - Larger on PC */}
                        <div>
                          <h2 className="text-3xl font-bold text-white leading-tight">
                            {currentAnime.title}
                          </h2>
                        </div>

                        {/* Description - Only on PC */}
                        {currentAnime.description && (
                          <p className="text-slate-300 text-base line-clamp-2">
                            {currentAnime.description}
                          </p>
                        )}

                        {/* Genres - Only on PC */}
                        {currentAnime.genreList && currentAnime.genreList.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {currentAnime.genreList.slice(0, 4).map((genre, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-md text-sm bg-slate-800/60 text-slate-300 border border-slate-700/50"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Section: Watch Now Button - CHANGED TO PURPLE */}
                      <div className="mt-4">
                        <button
                          onClick={() => onAnimeSelect(currentAnime)}
                          className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 text-lg"
                        >
                          Watch Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Arrows - Only show if multiple banner animes */}
                {bannerAnimes.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/80 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center text-white hover:bg-slate-800/90 transition-all z-20 text-xl font-bold"
                      aria-label="Previous"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/80 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center text-white hover:bg-slate-800/90 transition-all z-20 text-xl font-bold"
                      aria-label="Next"
                    >
                      →
                    </button>

                    {/* Dots Indicator - CHANGED TO PURPLE */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                      {bannerAnimes.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            i === currentIndex 
                              ? "w-6 bg-purple-500"
                              : "bg-slate-600/80 hover:bg-slate-500"
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
        {/* Latest Anime Title - REMOVED JUSTIFY-BETWEEN AND VIEW ALL BUTTON */}
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 sm:h-6 bg-purple-500 rounded-full"></div>
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
                      <div className="absolute top-0 left-2 z-10">
                        <span className="bg-purple-600 text-white text-[11px] font-medium px-2 py-0.5 rounded-md shadow-md whitespace-nowrap">
                          {anime.contentType || 'Anime'}
                        </span>
                      </div>
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-colors duration-300 group-hover:from-black/95 flex flex-col justify-end p-2 sm:p-3 md:p-4">
                        <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
                          <h3 className="text-white font-bold line-clamp-2 mb-1 text-xs sm:text-sm md:text-base leading-tight drop-shadow-md">
                            {anime.title}
                          </h3>
                          <div className="flex justify-between items-center">
                            <p className="text-slate-300 text-xs sm:text-sm">
                              {anime.releaseYear || 'N/A'}
                            </p>
                            <span className="bg-purple-600 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md shadow-md whitespace-nowrap">
                              {anime.subDubStatus || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover Border */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500 rounded-lg transition-all duration-300" />
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