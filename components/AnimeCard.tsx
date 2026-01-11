// components/AnimeCard.tsx - SEO UPDATED VERSION WITH SEO-FRIENDLY URLS
import React from 'react';
import type { Anime } from '../src/types';
import { PlayIcon } from './icons/PlayIcon';
import { useNavigate } from 'react-router-dom';

interface AnimeCardProps {
  anime: Anime;
  onClick?: (anime: Anime) => void; // Optional now since we use navigate
  index: number;
  showStatus?: boolean;
}

// Helper function to optimize Cloudinary image URLs
const optimizeImageUrl = (url: string, width: number, height: number): string => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  try {
    // Remove existing transformations and add optimized ones
    const baseUrl = url.split('/upload/')[0];
    const rest = url.split('/upload/')[1];
    const imagePath = rest.split('/').slice(1).join('/');
    
    return `${baseUrl}/upload/f_webp,q_auto:good,w_${width},h_${height},c_fill/${imagePath}`;
  } catch (error) {
    console.error('Error optimizing image URL:', error);
    return url;
  }
};

// Generate srcset for responsive images
const generateSrcSet = (url: string, baseWidth: number, baseHeight: number): string => {
  if (!url || !url.includes('cloudinary.com')) return '';
  
  try {
    const baseUrl = url.split('/upload/')[0];
    const rest = url.split('/upload/')[1];
    const imagePath = rest.split('/').slice(1).join('/');
    
    return `
      ${baseUrl}/upload/f_webp,q_auto:good,w_${baseWidth},h_${baseHeight},c_fill/${imagePath} ${baseWidth}w,
      ${baseUrl}/upload/f_webp,q_auto:good,w_${baseWidth * 2},h_${baseHeight * 2},c_fill/${imagePath} ${baseWidth * 2}w
    `;
  } catch (error) {
    console.error('Error generating srcset:', error);
    return '';
  }
};

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onClick, index, showStatus = false }) => {
  const navigate = useNavigate();
  
  // Define display dimensions
  const displayWidth = 193;
  const displayHeight = 289;
  
  // Optimize the thumbnail URL
  const optimizedThumbnail = optimizeImageUrl(anime.thumbnail, displayWidth, displayHeight);
  const thumbnailSrcSet = generateSrcSet(anime.thumbnail, displayWidth, displayHeight);
  
  // ✅ SEO-FRIENDLY URL GENERATION
  const getAnimeDetailUrl = () => {
    // Priority 1: Use slug if available (for SEO)
    if (anime.slug && anime.slug.trim() !== '') {
      return `/detail/${anime.slug}`;
    }
    // Priority 2: Use SEO-friendly title slug as fallback
    else if (anime.title) {
      const titleSlug = anime.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
      return `/detail/${titleSlug}`;
    }
    // Priority 3: Fallback to ID
    else {
      return `/detail/${anime._id || anime.id}`;
    }
  };
  
  const handleCardClick = () => {
    const detailUrl = getAnimeDetailUrl();
    
    // ✅ Use navigate for SEO-friendly URLs
    navigate(detailUrl);
    window.scrollTo(0, 0);
    
    // Call original onClick if provided (for backward compatibility)
    if (onClick) {
      onClick(anime);
    }
  };
  
  // ✅ Get proper link for accessibility
  const detailUrl = getAnimeDetailUrl();

  return (
    <div
      className="anime-card group relative overflow-hidden rounded-lg shadow-lg cursor-pointer transition-all duration-300 card-load-animate opacity-0 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-800/40 aspect-[2/3] w-full"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View details for ${anime.title}`}
    >
      
      {/* Image Container */}
      <div className="w-full h-full relative">
        <img
          src={optimizedThumbnail}
          srcSet={thumbnailSrcSet}
          alt={`${anime.title} - ${anime.contentType || 'Anime'} ${anime.releaseYear ? anime.releaseYear + '' : ''} ${anime.subDubStatus || ''}`}
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          loading="lazy"
          width={displayWidth}
          height={displayHeight}
          sizes="(max-width: 640px) 48vw, (max-width: 768px) 32vw, (max-width: 1024px) 24vw, (max-width: 1280px) 20vw, 193px"
          onError={(e) => {
            // Fallback to original if optimization fails
            e.currentTarget.src = anime.thumbnail;
            console.warn('Failed to load optimized image, using original');
          }}
        />

        {/* Status Badge */}
        {showStatus && (
          <div className="absolute top-0 left-2 z-10">
            <span className="bg-purple-600 text-white text-[11px] font-medium px-2 py-0.5 rounded-md shadow-md whitespace-nowrap">
              {anime.contentType || 'Anime'}
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-colors duration-300 group-hover:from-black/95 flex flex-col justify-end p-2 sm:p-3 md:p-4">

          {/* Card Text */}
          <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
            
            {/* Title */}
            <h3 className="text-white font-bold line-clamp-2 mb-1 text-xs sm:text-sm md:text-base leading-tight drop-shadow-md">
              {anime.title}
            </h3>

            {/* Year + SubDub + SEO Hidden Info */}
            <div className="flex justify-between items-center">
              <p className="text-slate-300 text-xs sm:text-sm">{anime.releaseYear}</p>
              <span className="bg-purple-600 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md shadow-md whitespace-nowrap">
                {anime.subDubStatus}
              </span>
            </div>
            
            {/* ✅ Hidden SEO Information for Google */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <span>Watch {anime.title} online</span>
              <span>{anime.contentType} in {anime.subDubStatus}</span>
              <span>AnimeBing.in - Free anime streaming</span>
            </div>

          </div>
        </div>

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
          <div className="transform scale-75 sm:scale-90 group-hover:scale-100 transition-transform duration-300">
            <PlayIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
          </div>
        </div>
        
        {/* ✅ Hidden Link for SEO Crawlers */}
        <a 
          href={detailUrl} 
          style={{ display: 'none' }} 
          aria-hidden="true"
          data-seo="true"
        >
          Watch {anime.title} full episodes in {anime.subDubStatus} - AnimeBing
        </a>

      </div>
    </div>
  );
};

export default AnimeCard;