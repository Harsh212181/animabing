// components/AnimeDetailWrapper.tsx - NEW FILE
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnimeDetailPage from './AnimeDetailPage';
import { getAnimeByIdOrSlug } from '../services/animeService';
import { AnimeDetailSkeleton } from './SkeletonLoader';
import type { Anime } from '../src/types';

const AnimeDetailWrapper: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnime = async () => {
      if (!idOrSlug) {
        setError('Invalid anime identifier');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching anime with identifier:', idOrSlug);
        
        // ✅ Fetch anime by ID or Slug
        const animeData = await getAnimeByIdOrSlug(idOrSlug);
        
        if (!animeData) {
          console.log('❌ Anime not found:', idOrSlug);
          setError('Anime not found');
          setAnime(null);
        } else {
          console.log('✅ Anime found:', animeData.title);
          setAnime(animeData);
        }
      } catch (err) {
        console.error('❌ Error fetching anime:', err);
        setError('Failed to load anime details. Please try again.');
        setAnime(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [idOrSlug]);

  const handleBack = () => {
    navigate(-1);
  };

  // Show loading skeleton
  if (loading) {
    return <AnimeDetailSkeleton />;
  }

  // Show error message
  if (error || !anime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={handleBack}
            className="mb-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            ← Go Back
          </button>
          
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-white mb-4">Anime Not Found</h1>
            <p className="text-slate-300 mb-6">{error || 'The anime you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pass data to AnimeDetailPage
  return (
    <AnimeDetailPage
      anime={anime}
      onBack={handleBack}
      isLoading={loading}
    />
  );
};

export default AnimeDetailWrapper;