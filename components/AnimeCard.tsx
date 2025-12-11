  // components/AnimeCard.tsx - FINAL FIXED VERSION
import React from 'react';
import type { Anime } from '../src/types';       // ← Correct path for your folder structure
import { PlayIcon } from './icons/PlayIcon';

interface AnimeCardProps {
  anime: Anime;
  onClick: (anime: Anime) => void;
  index: number;
  showStatus?: boolean;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onClick, index, showStatus = false }) => {
  return (
    <div
      className="anime-card group relative overflow-hidden rounded-lg shadow-lg cursor-pointer transition-all duration-300 card-load-animate opacity-0 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-800/40 aspect-[2/3] w-full"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onClick(anime)}
    >
      
      {/* Image Container */}
      <div className="w-full h-full relative">
        <img
          src={anime.thumbnail}
          alt={anime.title}
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          loading="lazy"
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

            {/* Year + SubDub */}
            <div className="flex justify-between items-center">
              <p className="text-slate-300 text-xs sm:text-sm">{anime.releaseYear}</p>
              <span className="bg-purple-600 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md shadow-md whitespace-nowrap">
                {anime.subDubStatus}
              </span>
            </div>

          </div>
        </div>

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
          <div className="transform scale-75 sm:scale-90 group-hover:scale-100 transition-transform duration-300">
            <PlayIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnimeCard;
