  // components/HomePage.tsx - FIXED SORTING VERSION
import React, { useState, useEffect, useMemo } from 'react';
import type { Anime, FilterType, ContentTypeFilter } from '../src/types';
import AnimeCard from './AnimeCard';
import { SkeletonLoader } from './SkeletonLoader';
import Spinner from './Spinner';
import { getAllAnime, searchAnime } from '../services/animeService';

interface Props {
  onAnimeSelect: (anime: Anime) => void;
  searchQuery: string;
  filter: FilterType;
  contentType: ContentTypeFilter;
}

const HomePage: React.FC<Props> = ({ 
  onAnimeSelect, 
  searchQuery, 
  filter, 
  contentType 
}) => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ INITIAL LOAD - ONLY ON MOUNT
  useEffect(() => {
    const loadInitialAnime = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllAnime();
        
        // ✅ FIXED: Simple array reverse - newest items will be first
        // Since your API returns items in the order they were added to database
        // Reversing the array will show newest items first
        const reversedData = [...data].reverse();
        setAnimeList(reversedData);
      } catch (err) {
        setError('Failed to load anime data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialAnime();
  }, []);

  // ✅ SEARCH EFFECT - RUNS WHEN searchQuery CHANGES
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim() === '') {
        const data = await getAllAnime();
        // ✅ FIXED: Simple array reverse for search results too
        const reversedData = [...data].reverse();
        setAnimeList(reversedData);
        return;
      }

      try {
        setIsLoading(true);
        const data = await searchAnime(searchQuery);
        // ✅ FIXED: Simple array reverse for search results
        const reversedData = [...data].reverse();
        setAnimeList(reversedData);
      } catch (err) {
        setError('Search failed');
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // ✅ FILTER ANIME BASED ON CURRENT STATE
  const filteredAnime = useMemo(() => {
    let filtered = [...animeList];

    // Content type filter
    if (contentType !== 'All') {
      filtered = filtered.filter(anime => 
        anime.contentType === contentType
      );
    }

    // Dub/Sub filter
    if (filter !== 'All') {
      filtered = filtered.filter(anime => 
        anime.subDubStatus === filter
      );
    }

    return filtered;
  }, [animeList, filter, contentType]);

  // ✅ RENDER LOGIC
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">
            {searchQuery ? 'Searching...' : 'Latest Anime'}
          </h1>
          <SkeletonLoader type="card" count={12} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="bg-red-900/20 rounded-xl p-8 max-w-md mx-auto border border-red-500/30">
              <div className="text-6xl mb-4">😞</div>
              <h2 className="text-2xl font-semibold text-white mb-2">Error Loading Anime</h2>
              <p className="text-red-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-2 rounded-lg transition-all duration-300 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            {contentType === 'All' ? 'Latest Content' : `Latest ${contentType}`}
          </h1>
        </div>

        {filteredAnime.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-slate-800/50 rounded-xl p-8 max-w-md mx-auto border border-slate-700">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-semibold text-slate-300 mb-2">
                {searchQuery ? 'No Results Found' : 'No Anime Available'}
              </h2>
              <p className="text-slate-400">
                {searchQuery 
                  ? `No results for "${searchQuery}"`
                  : 'Check back later for new content'
                }
              </p>
            </div>
          </div>
        ) : (
          // ✅ CHANGED: 3 columns on mobile (grid-cols-3), adjusted gaps
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
            {filteredAnime.map((anime, index) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                onClick={onAnimeSelect}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
