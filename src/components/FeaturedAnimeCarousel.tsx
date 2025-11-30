 // src/components/FeaturedAnimeCarousel.tsx - FIXED RED LINE ERROR
import React, { useRef } from 'react';
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

const FeaturedAnimeCarousel: React.FC<Props> = ({ featuredAnimes, onAnimeSelect }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const isDragging = useRef(false);

  // ✅ FIXED: Better empty state handling
  if (!featuredAnimes || featuredAnimes.length === 0) {
    return (
      <div className="mb-6 lg:mb-8 text-center py-8">
        <p className="text-gray-500 text-lg">No featured anime available</p>
        <p className="text-gray-400 text-sm">Check back later for updates</p>
      </div>
    );
  }

  // ✅ FIXED: Better click handler with type safety
  const handleCardClick = (anime: Anime, event: React.MouseEvent) => {
    event.preventDefault();
    if (!isDragging.current && swiperRef.current && !swiperRef.current.dragging) {
      onAnimeSelect(anime);
    }
  };

  // ✅ FIXED: Better image error handling
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://via.placeholder.com/300x400/374151/FFFFFF?text=No+Image';
    target.alt = 'Image not available';
  };

  return (
    <div className="mb-6 lg:mb-8 featured-carousel-container">
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
            slidesPerView: 4,
            spaceBetween: 12,
          },
          1280: {
            slidesPerView: 5,
            spaceBetween: 14,
          }
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true, // ✅ ADDED: Better UX
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          dynamicMainBullets: 3, // ✅ ADDED: Limit bullet count
        }}
        loop={featuredAnimes.length >= 4}
        speed={800} // ✅ ADDED: Smoother transitions
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={() => {
          isDragging.current = false;
        }}
        onTouchStart={() => {
          isDragging.current = true;
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            isDragging.current = false;
          }, 100);
        }}
        // ✅ ADDED: Mouse events for desktop
        onSliderMove={() => {
          isDragging.current = true;
        }}
        className="featured-swiper rounded-lg"
      >
        {featuredAnimes.map((anime) => (
          <SwiperSlide key={anime.id || anime._id} className="!h-auto"> {/* ✅ FIXED: Key and height */}
            <div 
              className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl h-full"
              onClick={(e) => handleCardClick(anime, e)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(anime, e as any);
                }
              }}
            >
              {/* Anime Card */}
              <div className="relative overflow-hidden rounded-lg aspect-[3/4] bg-gradient-to-br from-slate-800 to-slate-900 h-full">
                
                {/* Anime Image */}
                <img
                  src={anime.thumbnail || anime.bannerImage || 'https://via.placeholder.com/300x400/374151/FFFFFF?text=No+Image'}
                  alt={anime.title || 'Anime image'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onError={handleImageError}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 text-white">
                  
                  {/* Anime Title */}
                  <h3 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2 leading-tight group-hover:text-purple-200 transition-colors">
                    {anime.title || 'Untitled Anime'}
                  </h3>
                  
                  {/* Anime Details */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300 text-xs">
                      {anime.releaseYear || 'N/A'}
                    </span>
                    <span className="px-1 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-purple-500 sm:bg-purple-600">
                      {anime.subDubStatus || 'Unknown'}
                    </span>
                  </div>

                  {/* ✅ ADDED: Rating if available */}
                  {anime.rating && (
                    <div className="mt-1 flex items-center">
                      <span className="text-yellow-400 text-xs">⭐</span>
                      <span className="text-yellow-400 text-xs ml-1">
                        {typeof anime.rating === 'number' ? anime.rating.toFixed(1) : anime.rating}
                      </span>
                    </div>
                  )}
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500 rounded-lg transition-all duration-300" />
                
                {/* ✅ ADDED: Featured Badge */}
                <div className="absolute top-2 left-2">
                  <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                    Featured
                  </span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FeaturedAnimeCarousel;
