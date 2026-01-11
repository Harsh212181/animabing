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
      
      // ✅ FIXED: Ensure slug is generated properly
      if (!formData.slug || formData.slug.trim() === '') {
        formData.slug = generateSlug(form.title);
      }
      
      // If auto-generate SEO is enabled, generate SEO data from title
      if (autoGenerateSEO && form.title.trim()) {
        // Generate SEO Title
        if (!formData.seoTitle || formData.seoTitle.trim() === '') {
          formData.seoTitle = `Watch ${form.title} Online in ${form.subDubStatus} | AnimeBing`;
        }
        
        // Generate SEO Description
        if (!formData.seoDescription || formData.seoDescription.trim() === '') {
          formData.seoDescription = generateSEODescription(form.title, form.subDubStatus, form.contentType);
        }
        
        // Generate SEO Keywords
        if (!formData.seoKeywords || formData.seoKeywords.trim() === '') {
          formData.seoKeywords = generateSEOKeywords(form.title, form.genreList, form.subDubStatus, form.contentType);
        }
      }
      
      const response = await axios.post(`${API_BASE}/admin/protected/add-anime`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(`Anime added successfully! ✅ Details will appear in Google Search within 24-48 hours.`);
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
      console.error('Error adding anime:', err);
      setError(err.response?.data?.error || 'Failed to add anime. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Function to generate SEO-friendly slug
  const generateSlug = (title: string): string => {
    if (!title.trim()) return '';
    
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')         // Replace spaces with hyphens
      .replace(/-+/g, '-')          // Remove multiple hyphens
      .trim();
  };

  // ✅ Function to generate SEO Description
  const generateSEODescription = (title: string, subDubStatus: string, contentType: string): string => {
    const contentText = contentType === 'Movie' 
      ? 'Full movie available' 
      : contentType === 'Manga'
      ? 'Read manga online'
      : 'All episodes available';
    
    return `Watch ${title} online in ${subDubStatus}. ${contentText} in HD quality. Free streaming and downloads on AnimeBing.`;
  };

  // ✅ Function to generate SEO Keywords
  const generateSEOKeywords = (
    title: string, 
    genres: string[], 
    subDubStatus: string, 
    contentType: string
  ): string => {
    const keywords = [];
    
    // Title-based keywords
    keywords.push(
      `${title} anime`,
      `watch ${title} online`,
      `${title} ${subDubStatus.toLowerCase()}`,
      `${title} free download`
    );
    
    // Genre-based keywords
    if (genres && genres.length > 0) {
      genres.forEach((genre: string) => {
        keywords.push(
          `${title} ${genre.toLowerCase()} anime`,
          `${genre.toLowerCase()} anime`,
          `${genre.toLowerCase()} anime in hindi`
        );
      });
    }
    
    // Language/Type based keywords
    const statuses = subDubStatus.toLowerCase().split(',').map(s => s.trim());
    
    if (statuses.includes('hindi dub')) {
      keywords.push(
        'hindi dubbed anime',
        'anime in hindi',
        'hindi dub',
        `${title} hindi dubbed`,
        'watch anime in hindi'
      );
    }
    
    if (statuses.includes('hindi sub')) {
      keywords.push(
        'hindi subbed anime',
        'anime with hindi subtitles',
        'hindi sub',
        `${title} hindi subbed`,
        'hindi subtitles anime'
      );
    }
    
    if (statuses.includes('english sub')) {
      keywords.push(
        'english subbed anime',
        'anime in english',
        'english sub',
        `${title} english sub`,
        'english subtitles anime'
      );
    }
    
    // Content type keywords
    if (contentType === 'Movie') {
      keywords.push(
        `${title} movie`,
        `watch ${title} movie online`,
        `${title} anime movie`,
        'anime movies',
        'full anime movie'
      );
    } else if (contentType === 'Manga') {
      keywords.push(
        `${title} manga`,
        `read ${title} manga online`,
        `${title} manga chapters`,
        'read manga online',
        'manga in hindi'
      );
    } else {
      keywords.push(
        `${title} episodes`,
        `watch ${title} episodes`,
        `${title} all episodes`,
        'anime episodes',
        'hindi dubbed episodes'
      );
    }
    
    // Platform keywords
    keywords.push(
      'animebing',
      'animebing.in',
      'anime streaming site',
      'free anime downloads'
    );
    
    // Remove duplicates and join
    return [...new Set(keywords)].join(', ');
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const genres = e.target.value.split(',').map(g => g.trim()).filter(g => g);
    setForm({ ...form, genreList: genres });
  };

  // Auto-generate SEO fields when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setForm({ ...form, title: newTitle });
    
    // Auto-generate SEO fields if autoGenerateSEO is enabled
    if (autoGenerateSEO && newTitle.trim()) {
      const generatedSlug = generateSlug(newTitle);
      
      setForm(prev => ({ 
        ...prev, 
        slug: generatedSlug,
        seoTitle: prev.seoTitle || `Watch ${newTitle} Online in ${prev.subDubStatus} | AnimeBing`,
        seoDescription: prev.seoDescription || generateSEODescription(newTitle, prev.subDubStatus, prev.contentType),
        seoKeywords: prev.seoKeywords || generateSEOKeywords(newTitle, prev.genreList, prev.subDubStatus, prev.contentType)
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
        seoTitle: `Watch ${prev.title} Online in ${newStatus} | AnimeBing`,
        seoDescription: generateSEODescription(prev.title, newStatus, prev.contentType),
        seoKeywords: generateSEOKeywords(prev.title, prev.genreList, newStatus, prev.contentType)
      }));
    }
  };

  // Auto-generate SEO fields when contentType changes
  const handleContentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newContentType = e.target.value as 'Anime' | 'Movie' | 'Manga';
    setForm({ ...form, contentType: newContentType });
    
    if (autoGenerateSEO && form.title.trim()) {
      setForm(prev => ({ 
        ...prev, 
        seoTitle: `Watch ${prev.title} Online in ${prev.subDubStatus} | AnimeBing`,
        seoDescription: generateSEODescription(prev.title, prev.subDubStatus, newContentType),
        seoKeywords: generateSEOKeywords(prev.title, prev.genreList, prev.subDubStatus, newContentType)
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
              Automatically generate SEO titles, descriptions, and keywords for better Google search results
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
                placeholder="Brief description of the anime..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Thumbnail URL *</label>
              <input
                type="url"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="https://res.cloudinary.com/.../thumbnail.jpg"
                required
              />
              <p className="text-slate-400 text-xs mt-1">
                Recommended: Cloudinary URL with optimized image (WebP format, 193x289px)
              </p>
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
                  onChange={handleContentTypeChange}
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
                  <option value="Both">Both (Hindi Dub & Sub)</option>
                  <option value="Sub & Dub">Sub & Dub Available</option>
                  <option value="Dual Audio">Dual Audio</option>
                </select>
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
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Genres (comma-separated) *
              </label>
              <input
                type="text"
                value={form.genreList.join(', ')}
                onChange={handleGenreChange}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="Action, Adventure, Fantasy, Shounen"
                required
              />
              <p className="text-slate-400 text-xs mt-1">
                Separate multiple genres with commas. Example: Action, Adventure, Fantasy
              </p>
            </div>
          </div>
        </div>
        
        {/* SEO Section */}
        <div className="mb-6 pb-4 border-b border-slate-600">
          <h3 className="text-lg font-semibold text-white mb-4">
            SEO Settings <span className="text-xs text-purple-400">(Important for Google Search)</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                SEO Title
                <span className="text-slate-400 text-xs ml-2">(Appears in Google search results)</span>
              </label>
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="e.g., Watch Naruto Shippuden Online in Hindi Dub | AnimeBing"
                maxLength={60}
              />
              <div className="flex justify-between mt-1">
                <p className="text-slate-400 text-xs">
                  Character count: <span className={form.seoTitle.length > 60 ? 'text-red-400' : 'text-green-400'}>
                    {form.seoTitle.length}/60
                  </span>
                </p>
                <p className="text-slate-400 text-xs">
                  {form.seoTitle.length <= 60 ? '✅ Good for SEO' : '❌ Too long for Google'}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                SEO Description
                <span className="text-slate-400 text-xs ml-2">(Appears below title in Google search)</span>
              </label>
              <textarea
                value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition h-24"
                placeholder="e.g., Watch Naruto Shippuden online in Hindi Dub. HD quality streaming and downloads. All episodes available."
                maxLength={160}
              />
              <div className="flex justify-between mt-1">
                <p className="text-slate-400 text-xs">
                  Character count: <span className={form.seoDescription.length > 160 ? 'text-red-400' : 'text-green-400'}>
                    {form.seoDescription.length}/160
                  </span>
                </p>
                <p className="text-slate-400 text-xs">
                  {form.seoDescription.length <= 160 ? '✅ Good for SEO' : '❌ Too long for Google'}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                SEO Keywords
                <span className="text-slate-400 text-xs ml-2">(Important for search rankings)</span>
              </label>
              <textarea
                value={form.seoKeywords}
                onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition h-24"
                placeholder="e.g., naruto shippuden hindi dub, watch naruto shippuden online, naruto anime in hindi, shounen anime, action anime"
              />
              <p className="text-slate-400 text-xs mt-1">
                Separate keywords with commas. Important for Google search rankings.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                URL Slug <span className="text-red-400">*</span>
                <span className="text-slate-400 text-xs ml-2">(SEO-friendly URL - Auto-generated)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  placeholder="naruto-shippuden-hindi-dub"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    if (form.title.trim()) {
                      const newSlug = generateSlug(form.title);
                      setForm(prev => ({ ...prev, slug: newSlug }));
                    }
                  }}
                  className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition whitespace-nowrap"
                >
                  Generate
                </button>
              </div>
              <div className="mt-2 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-xs font-medium mb-1">Preview URL:</p>
                <p className="text-purple-300 text-sm font-mono break-all">
                  https://animebing.in/detail/{form.slug || 'your-anime-slug'}
                </p>
                <p className="text-slate-400 text-xs mt-2">
                  ✅ This URL will appear in Google Search. Make sure it's unique and descriptive.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-white font-semibold">Ready to Publish?</h4>
              <p className="text-slate-400 text-xs">This anime will appear in Google Search results</p>
            </div>
            <div className="text-right">
              <p className="text-green-400 text-sm font-medium">SEO Optimized: {autoGenerateSEO ? 'Yes' : 'No'}</p>
              <p className="text-slate-400 text-xs">Google Indexing: 24-48 hours</p>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !form.title.trim() || !form.slug.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center shadow-lg hover:shadow-purple-500/20"
          >
            {loading ? (
              <>
                <Spinner className="inline h-5 w-5 mr-2" />
                Publishing Anime...
              </>
            ) : (
              'Publish Anime & Submit to Google'
            )}
          </button>
        </div>
        
        {success && (
          <div className="p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-green-400 text-xl">✅</div>
              <div>
                <p className="text-green-400 text-sm font-semibold mb-1">Successfully Published!</p>
                <p className="text-green-300 text-sm">{success}</p>
                <div className="mt-2 p-2 bg-green-900/20 rounded">
                  <p className="text-green-300 text-xs">SEO URL: <span className="font-mono">animebing.in/detail/{form.slug}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-700 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-red-400 text-xl">❌</div>
              <div>
                <p className="text-red-400 text-sm font-semibold mb-1">Error</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddAnimeForm;