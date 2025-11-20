 // components/AnimeDetailPage.tsx - IMPROVED DESIGN
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
        
        // Clean cutyLinks
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl mb-6 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
        >
          <span className="text-lg">←</span>
          Back to Home
        </button>

        {/* Anime Info Card */}
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-slate-700/50 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Anime Poster */}
            <div className="flex-shrink-0">
              <div className="relative group">
                <img
                  src={anime.thumbnail}
                  alt={anime.title}
                  className="w-80 h-[28rem] object-cover rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x400/1e293b/64748b?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Anime Details */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                {anime.title}
              </h1>
              
              <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                {anime.description}
              </p>

              {/* Info Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-purple-400 text-lg">📊</span>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Status</p>
                      <p className="text-white font-semibold">{anime.status}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 text-lg">📅</span>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Release Year</p>
                      <p className="text-white font-semibold">{anime.releaseYear}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-green-400 text-lg">🎬</span>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Type</p>
                      <p className="text-white font-semibold">{anime.contentType}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-orange-400 text-lg">🎧</span>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Audio</p>
                      <p className="text-white font-semibold">{anime.subDubStatus}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Genres */}
              <div className="mb-6">
                <h3 className="text-slate-400 text-sm font-semibold mb-3 uppercase tracking-wider">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genreList?.map((genre, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
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
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Episodes {episodes.length > 0 && `(${episodes.length})`}
            </h2>
          </div>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Spinner size="lg" text="Loading episodes..." />
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-900/20 border border-red-700/50 p-6 rounded-xl mb-4">
              <div className="flex items-center gap-3">
                <span className="text-red-400 text-xl">⚠️</span>
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          {!isLoading && episodes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📺</div>
              <h3 className="text-2xl font-semibold text-slate-300 mb-3">No Episodes Available</h3>
              <p className="text-slate-400 text-lg">Episodes will be added soon!</p>
            </div>
          ) : (
            !isLoading && (
              <div className="grid gap-4">
                {episodes
                  .sort((a, b) => {
                    if (a.session !== b.session) return a.session - b.session;
                    return a.episodeNumber - b.episodeNumber;
                  })
                  .map((episode, index) => (
                    <div
                      key={episode._id || index}
                      className="bg-slate-700/40 hover:bg-slate-600/40 rounded-xl p-5 transition-all duration-300 border border-slate-600/50 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                              EP {episode.episodeNumber}
                            </span>
                            {episode.session > 1 && (
                              <span className="bg-slate-600 text-slate-300 px-3 py-1 rounded-lg text-sm font-medium">
                                Session {episode.session}
                              </span>
                            )}
                          </div>
                          <h3 className="text-white font-semibold text-lg group-hover:text-purple-200 transition-colors">
                            {episode.title || `Episode ${episode.episodeNumber}`}
                          </h3>
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              if (episode.cutyLink) {
                                window.open(episode.cutyLink, '_blank');
                              } else {
                                alert(`Episode ${episode.episodeNumber} - Watch link will be added soon!`);
                              }
                            }}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center gap-2 font-semibold"
                          >
                            <span>▶️</span>
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
