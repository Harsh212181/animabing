// src/components/admin/AddAnimeForm.tsx - UPDATED WITH SEO FIELDS
import React, { useState } from 'react';
import axios from 'axios';
import type { SubDubStatus } from '../../types';
import Spinner from '../Spinner';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
const token = localStorage.getItem('adminToken') || '';

const AddAnimeForm: React.FC = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    thumbnail: '',
    releaseYear: new Date().getFullYear(),
    subDubStatus: 'Hindi Sub' as SubDubStatus,
    genreList: [],
    status: 'Ongoing',
    contentType: 'Anime' as 'Anime' | 'Movie' | 'Manga',
    
    // ✅ SEO FIELDS ADDED
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    slug: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [autoGenerateSEO, setAutoGenerateSEO] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    
    try {
      // Prepare form data
      const formData = { ...form };
      
      // If auto-generate SEO is enabled, generate SEO data from title
      if (autoGenerateSEO && form.title.trim()) {
        // Generate SEO Title
        if (!formData.seoTitle) {
          formData.seoTitle = `Watch ${form.title} Online in ${form.subDubStatus} | AnimeBing`;
        }
        
        // Generate SEO Description
        if (!formData.seoDescription) {
          formData.seoDescription = `Watch ${form.title} online in ${form.subDubStatus}. HD quality streaming and downloads. All episodes available.`;
        }
        
        // Generate SEO Keywords
        if (!formData.seoKeywords) {
          const keywords = [];
          
          // Title-based keywords
          keywords.push(`${form.title} anime`, `watch ${form.title} online`, `${form.title} ${form.subDubStatus.toLowerCase()}`);
          
          // Genre-based keywords
          if (form.genreList && form.genreList.length > 0) {
            form.genreList.forEach((genre: string) => {
              keywords.push(`${genre.toLowerCase()} anime`, `${form.title} ${genre.toLowerCase()}`);
            });
          }
          
          // Language/Type based keywords
          if (form.subDubStatus.includes('Hindi Dub')) {
            keywords.push('hindi dubbed anime', 'anime in hindi', 'hindi dub');
          }
          if (form.subDubStatus.includes('Hindi Sub')) {
            keywords.push('hindi subbed anime', 'anime with hindi subtitles', 'hindi sub');
          }
          if (form.subDubStatus.includes('English Sub')) {
            keywords.push('english subbed anime', 'anime in english', 'english sub');
          }
          
          // Content type keywords
          if (form.contentType === 'Movie') {
            keywords.push(`${form.title} movie`, 'anime movies', 'full anime movie');
          }
          
          // Remove duplicates and join
          const uniqueKeywords = [...new Set(keywords)];
          formData.seoKeywords = uniqueKeywords.join(', ');
        }
        
        // Generate slug if not provided
        if (!formData.slug) {
          formData.slug = form.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        }
      }
      
      await axios.post(`${API_BASE}/admin/protected/add-anime`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Anime added successfully! Check the list tab.');
      setForm({
        title: '',
        description: '',
        thumbnail: '',
        releaseYear: new Date().getFullYear(),
        subDubStatus: 'Hindi Sub',
        genreList: [],
        status: 'Ongoing',
        contentType: 'Anime',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        slug: ''
      });
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add anime');
    } finally {
      setLoading(false);
    }
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const genres = e.target.value.split(',').map(g => g.trim()).filter(g => g);
    setForm({ ...form, genreList: genres });
  };

  // Auto-generate SEO fields when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setForm({ ...form, title: newTitle });
    
    // Auto-generate slug if autoGenerateSEO is enabled
    if (autoGenerateSEO && newTitle.trim()) {
      const generatedSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      setForm(prev => ({ 
        ...prev, 
        slug: generatedSlug,
        seoTitle: prev.seoTitle || `Watch ${newTitle} Online in ${prev.subDubStatus} | AnimeBing`
      }));
    }
  };

  // Auto-generate SEO fields when subDubStatus changes
  const handleSubDubStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as SubDubStatus;
    setForm({ ...form, subDubStatus: newStatus });
    
    if (autoGenerateSEO && form.title.trim()) {
      setForm(prev => ({ 
        ...prev, 
        seoTitle: `Watch ${prev.title} Online in ${newStatus} | AnimeBing`
      }));
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-white mb-6">Add New Anime</h2>
      
      {/* Auto-generate SEO toggle */}
      <div className="mb-6 bg-slate-800/50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">SEO Settings</h3>
            <p className="text-slate-400 text-sm">
              Automatically generate SEO titles, descriptions, and keywords
            </p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoGenerateSEO}
              onChange={() => setAutoGenerateSEO(!autoGenerateSEO)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            <span className="ml-3 text-sm font-medium text-slate-300">
              {autoGenerateSEO ? 'Auto SEO: ON' : 'Auto SEO: OFF'}
            </span>
          </label>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-700/50 p-6 rounded-lg">
        {/* Basic Information Section */}
        <div className="mb-6 pb-4 border-b border-slate-600">
          <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={handleTitleChange}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="e.g., Naruto Shippuden"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition h-24"
                placeholder="Brief description..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Thumbnail URL</label>
              <input
                type="url"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Release Year</label>
                <input
                  type="number"
                  value={form.releaseYear}
                  onChange={(e) => setForm({ ...form, releaseYear: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  min="1900"
                  max="2030"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Content Type</label>
                <select
                  value={form.contentType}
                  onChange={(e) => setForm({ ...form, contentType: e.target.value as 'Anime' | 'Movie' | 'Manga' })}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition"
                >
                  <option value="Anime">Anime Series</option>
                  <option value="Movie">Movie</option>
                  <option value="Manga">Manga</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Sub/Dub Status</label>
                <select
                  value={form.subDubStatus}
                  onChange={handleSubDubStatusChange}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition"
                >
                  <option value="Hindi Dub">Hindi Dub</option>
                  <option value="Hindi Sub">Hindi Sub</option>
                  <option value="English Sub">English Sub</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Genres (comma-separated) *
              </label>
              <input
                type="text"
                value={form.genreList.join(', ')}
                onChange={handleGenreChange}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="Action, Adventure, Fantasy"
                required
              />
              <p className="text-slate-400 text-xs mt-1">
                Separate multiple genres with commas
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Complete">Complete</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* SEO Section */}
        <div className="mb-6 pb-4 border-b border-slate-600">
          <h3 className="text-lg font-semibold text-white mb-4">SEO Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                SEO Title
                <span className="text-slate-400 text-xs ml-2">(For Google Search Results)</span>
              </label>
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="e.g., Watch Naruto Shippuden Online in Hindi Dub | AnimeBing"
              />
              <p className="text-slate-400 text-xs mt-1">
                Character count: {form.seoTitle.length} (Recommended: 50-60 characters)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                SEO Description
                <span className="text-slate-400 text-xs ml-2">(For Google Search Results)</span>
              </label>
              <textarea
                value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition h-24"
                placeholder="e.g., Watch Naruto Shippuden online in Hindi Dub. HD quality streaming and downloads. All episodes available."
              />
              <p className="text-slate-400 text-xs mt-1">
                Character count: {form.seoDescription.length} (Recommended: 150-160 characters)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                SEO Keywords
                <span className="text-slate-400 text-xs ml-2">(Comma-separated keywords for search)</span>
              </label>
              <textarea
                value={form.seoKeywords}
                onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition h-24"
                placeholder="e.g., naruto shippuden hindi dub, watch naruto shippuden online, naruto anime in hindi"
              />
              <p className="text-slate-400 text-xs mt-1">
                Separate keywords with commas. Important for Google search.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                URL Slug
                <span className="text-slate-400 text-xs ml-2">(SEO-friendly URL)</span>
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="e.g., naruto-shippuden-hindi-dub"
              />
              <p className="text-slate-400 text-xs mt-1">
                Use lowercase, hyphens instead of spaces. Example URL: animebing.in/anime/{form.slug || 'naruto-shippuden-hindi-dub'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !form.title.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center"
        >
          {loading ? (
            <>
              <Spinner className="inline h-5 w-5 mr-2" />
              Adding Anime...
            </>
          ) : (
            'Add Anime'
          )}
        </button>
        
        {success && (
          <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
            <p className="text-green-400 text-sm text-center">{success}</p>
            <p className="text-green-300 text-xs text-center mt-1">
              This anime will now appear in Google search results for: {form.seoKeywords.split(',').slice(0, 3).join(', ')}...
            </p>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddAnimeForm;