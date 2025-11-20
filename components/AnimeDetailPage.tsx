 // components/AnimeDetailPage.tsx - CLEAN DESIGN
import React, { useState, useEffect } from 'react';
import type { Anime, Episode } from '../src/types';
import ReportButton from './ReportButton';
import Spinner from './Spinner';

interface Props {
  anime: Anime;
  onBack: () => void;
}

const API_BASE = 'https://animabing.onrender.com/api';

const AnimeDetailPage: React.FC<Props> = ({ anime, onBack }) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE}/episodes/${anime.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const episodesData = await response.json();
        
        const cleanedEpisodes = episodesData.map((episode: any) => ({
          ...episode,
          cutyLink: episode.cutyLink && 
                   !episode.cutyLink.includes('localhost') && 
                   episode.cutyLink.startsWith('http') 
                   ? episode.cutyLink.trim() 
                   : ''
        }));
        
        setEpisodes(cleanedEpisodes);
      } catch (err) {
        console.error('Error fetching episodes:', err);
        setError('Failed to load episodes');
        if (anime.episodes && anime.episodes.length > 0) {
          setEpisodes(anime.episodes);
          setError(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEpisodes();
  }, [anime]);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg mb-6 flex items-center gap-2 transition-colors duration-300 font-medium"
        >
          <span>←</span>
          Back to Home
        </button>

        {/* Anime Info Card */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Anime Poster */}
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src={anime.thumbnail}
                  alt={anime.title}
                  className="w-80 h-[28rem] object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x400/1e293b/64748b?text=No+Image';
                  }}
                />
              </div>
            </div>

            {/* Anime Details */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-4">
                {anime.title}
              </h1>
              
              <p className="text-slate-300 mb-6 leading-relaxed">
                {anime.description}
              </p>

              {/* Info Grid - Clean Version */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm font-medium mb-1">Status</p>
                  <p className="text-white font-semibold">{anime.status}</p>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm font-medium mb-1">Release Year</p>
                  <p className="text-white font-semibold">{anime.releaseYear}</p>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm font-medium mb-1">Type</p>
                  <p className="text-white font-semibold">{anime.contentType}</p>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm font-medium mb-1">Audio</p>
                  <p className="text-white font-semibold">{anime.subDubStatus}</p>
                </div>
              </div>

              {/* Genres */}
              <div className="mb-6">
                <p className="text-slate-400 text-sm font-medium mb-3">Genres</p>
                <div className="flex flex-wrap gap-2">
                  {anime.genreList?.map((genre, index) => (
                    <span
                      key={index}
                      className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">
            Episodes {episodes.length > 0 && `(${episodes.length})`}
          </h2>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Spinner size="lg" text="Loading episodes..." />
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {!isLoading && episodes.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No Episodes Available</h3>
              <p className="text-slate-400">Episodes will be added soon!</p>
            </div>
          ) : (
            !isLoading && (
              <div className="space-y-3">
                {episodes
                  .sort((a, b) => {
                    if (a.session !== b.session) return a.session - b.session;
                    return a.episodeNumber - b.episodeNumber;
                  })
                  .map((episode, index) => (
                    <div
                      key={episode._id || index}
                      className="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 transition-colors duration-300 border border-slate-600"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-bold">
                              EP {episode.episodeNumber}
                            </span>
                            {episode.session > 1 && (
                              <span className="bg-slate-600 text-slate-300 px-3 py-1 rounded text-sm font-medium">
                                Session {episode.session}
                              </span>
                            )}
                          </div>
                          <h3 className="text-white font-semibold">
                            {episode.title || `Episode ${episode.episodeNumber}`}
                          </h3>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (episode.cutyLink) {
                                window.open(episode.cutyLink, '_blank');
                              } else {
                                alert(`Episode ${episode.episodeNumber} - Watch link will be added soon!`);
                              }
                            }}
                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded transition-colors duration-300 flex items-center gap-2 font-medium"
                          >
                            Watch
                          </button>
                          
                          {/* Report Button for episode only */}
                          <ReportButton 
                            animeId={anime.id}
                            episodeId={episode._id}
                            episodeNumber={episode.episodeNumber}
                            animeTitle={anime.title}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;
