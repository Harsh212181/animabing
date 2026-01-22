 // src/components/admin/AddAnimeForm.tsx - COLLAPSIBLE GENRE SECTION
import React, { useState } from 'react';
import axios from 'axios';
import type { SubDubStatus } from '../../types';
import Spinner from '../Spinner';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
const token = localStorage.getItem('adminToken') || '';

// Genre options array
const GENRE_OPTIONS = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Romance',
  'Sci-Fi',
  'Horror',
  'Mystery',
  'Thriller / Psychological',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Mecha',
  'Isekai',
  'Harem',
  'Ecchi',
  'Music',
  'School',
  'Historical'
] as const;

const AddAnimeForm: React.FC = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    thumbnail: '',
    releaseYear: new Date().getFullYear(),
    subDubStatus: 'Hindi Sub' as SubDubStatus,
    genreList: [] as string[],
    status: 'Ongoing',
    contentType: 'Anime' as 'Anime' | 'Movie' | 'Manga',
    
    // SEO FIELDS
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    slug: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [autoGenerateSEO, setAutoGenerateSEO] = useState(true);
  const [customGenre, setCustomGenre] = useState('');
  const [showGenreSelector, setShowGenreSelector] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    
    try {
      // Prepare form data
      const formData = { ...form };
      
      // Ensure slug is generated properly
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

  // Function to generate SEO-friendly slug
  const generateSlug = (title: string): string => {
    if (!title.trim()) return '';
    
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Function to generate SEO Description
  const generateSEODescription = (title: string, subDubStatus: string, contentType: string): string => {
    const contentText = contentType === 'Movie' 
      ? 'Full movie available' 
      : contentType === 'Manga'
      ? 'Read manga online'
      : 'All episodes available';
    
    return `Watch ${title} online in ${subDubStatus}. ${contentText} in HD quality. Free streaming and downloads on AnimeBing.`;
  };

  // Function to generate SEO Keywords
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

  // Handle genre selection
  const toggleGenre = (genre: string) => {
    if (form.genreList.includes(genre)) {
      // Remove genre if already selected
      setForm({
        ...form,
        genreList: form.genreList.filter(g => g !== genre)
      });
    } else {
      // Add genre if not selected
      setForm({
        ...form,
        genreList: [...form.genreList, genre]
      });
    }
  };

  // Clear all genres
  const clearAllGenres = () => {
    setForm({
      ...form,
      genreList: []
    });
  };

  // Add custom genre
  const addCustomGenre = () => {
    if (customGenre.trim() && !form.genreList.includes(customGenre.trim())) {
      setForm({
        ...form,
        genreList: [...form.genreList, customGenre.trim()]
      });
      setCustomGenre('');
    }
  };

  // Handle Enter key for custom genre
  const handleCustomGenreKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomGenre();
    }
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
      <div className="mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
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
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-700/50 p-6 rounded-lg border border-slate-600">
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
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="e.g., Naruto Shippuden"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition h-24"
                placeholder="Brief description of the anime..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Thumbnail URL *</label>
              <input
                type="url"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
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
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
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
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
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
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
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
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>
            </div>
            
            {/* Genre Selector - COLLAPSIBLE SECTION */}
            <div className="bg-slate-800/30 rounded-lg border border-slate-700 overflow-hidden">
              {/* Genre Header - Clickable */}
              <div 
                className="p-4 cursor-pointer hover:bg-slate-800/50 transition flex justify-between items-center"
                onClick={() => setShowGenreSelector(!showGenreSelector)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-slate-300">
                      Genres <span className="text-red-400">*</span>
                    </h4>
                    <span className="text-xs px-2 py-1 bg-purple-600/30 text-purple-300 rounded-full">
                      {form.genreList.length} selected
                    </span>
                    {form.genreList.length === 0 && (
                      <span className="text-xs text-red-400">(Required)</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    {showGenreSelector 
                      ? 'Click to hide genre selection' 
                      : 'Click to select genres from list or add custom'}
                  </p>
                </div>
                <div className="text-xl text-slate-400 transform transition-transform duration-300">
                  {showGenreSelector ? '▲' : '▼'}
                </div>
              </div>
              
              {/* Selected Genres Preview (Always Visible) */}
              {form.genreList.length > 0 && (
                <div className="px-4 pb-3 border-t border-slate-700/50">
                  <div className="flex items-center justify-between mt-3 mb-2">
                    <p className="text-slate-300 text-sm">Selected Genres:</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAllGenres();
                      }}
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-900/30 hover:bg-red-900/50 transition"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.genreList.map(genre => (
                      <span
                        key={genre}
                        className={`inline-flex items-center gap-1 text-white px-3 py-1.5 rounded-lg text-sm shadow-md ${
                          GENRE_OPTIONS.includes(genre as any)
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                            : 'bg-gradient-to-r from-pink-600 to-rose-600'
                        }`}
                      >
                        {genre}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleGenre(genre);
                          }}
                          className="hover:text-red-200 ml-1.5 text-lg font-bold"
                          title="Remove genre"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Collapsible Content */}
              <div 
                className={`transition-all duration-300 overflow-hidden ${
                  showGenreSelector ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-4 border-t border-slate-700/50">
                  {/* Custom Genre Input */}
                  <div className="mb-4">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={customGenre}
                        onChange={(e) => setCustomGenre(e.target.value)}
                        onKeyPress={handleCustomGenreKeyPress}
                        className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                        placeholder="Type custom genre (e.g., Martial Arts, Shounen)"
                      />
                      <button
                        type="button"
                        onClick={addCustomGenre}
                        disabled={!customGenre.trim()}
                        className="bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg transition shadow-md hover:shadow-purple-500/20"
                      >
                        + Add
                      </button>
                    </div>
                    <p className="text-slate-400 text-xs">
                      Type a custom genre and press "Add" or Enter key. Custom genres show in pink color.
                    </p>
                  </div>
                  
                  {/* Genre Checkbox Grid */}
                  <div className="mb-3">
                    <p className="text-slate-300 text-sm font-medium mb-2">Popular Genres:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 bg-slate-900/30 rounded-lg">
                      {GENRE_OPTIONS.map(genre => {
                        const isSelected = form.genreList.includes(genre);
                        
                        return (
                          <div
                            key={genre}
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                              isSelected 
                                ? 'bg-gradient-to-r from-purple-900/40 to-purple-900/20 border-purple-500 shadow-md shadow-purple-900/30' 
                                : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600'
                            }`}
                            onClick={() => toggleGenre(genre)}
                          >
                            <div className={`flex items-center justify-center w-5 h-5 mr-3 rounded border ${
                              isSelected 
                                ? 'bg-purple-500 border-purple-400' 
                                : 'bg-slate-700 border-slate-600'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-sm font-medium ${
                              isSelected ? 'text-white' : 'text-slate-300'
                            }`}>
                              {genre}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Quick Select Buttons */}
                  <div className="mt-3">
                    <p className="text-slate-300 text-sm font-medium mb-2">Quick Select:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const newGenres = ['Action', 'Adventure', 'Fantasy'];
                          setForm(prev => ({
                            ...prev,
                            genreList: [...new Set([...prev.genreList, ...newGenres])]
                          }));
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg transition border border-slate-600 hover:border-slate-500"
                      >
                        + Shounen (Action, Adventure, Fantasy)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newGenres = ['Romance', 'Comedy', 'Slice of Life'];
                          setForm(prev => ({
                            ...prev,
                            genreList: [...new Set([...prev.genreList, ...newGenres])]
                          }));
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg transition border border-slate-600 hover:border-slate-500"
                      >
                        + Romance (Romance, Comedy, Slice of Life)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newGenres = ['Horror', 'Mystery', 'Thriller / Psychological'];
                          setForm(prev => ({
                            ...prev,
                            genreList: [...new Set([...prev.genreList, ...newGenres])]
                          }));
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg transition border border-slate-600 hover:border-slate-500"
                      >
                        + Horror/Thriller
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newGenres = ['Isekai', 'Fantasy', 'Adventure'];
                          setForm(prev => ({
                            ...prev,
                            genreList: [...new Set([...prev.genreList, ...newGenres])]
                          }));
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg transition border border-slate-600 hover:border-slate-500"
                      >
                        + Isekai
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-slate-400 text-xs mt-3 text-center">
                    Select genres by clicking on them. Custom genres can be added above.
                  </p>
                </div>
              </div>
              
              {/* Footer with genre count */}
              <div className="px-4 py-3 bg-slate-900/30 border-t border-slate-700/50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-slate-300 text-sm">
                      Total: <span className="text-purple-300 font-medium">{form.genreList.length}</span> genre(s)
                    </p>
                    <p className="text-slate-400 text-xs">
                      {form.genreList.length === 0 
                        ? '⚠️ At least one genre is required' 
                        : '✅ Genres selected'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGenreSelector(!showGenreSelector)}
                    className="text-sm text-slate-400 hover:text-white px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
                  >
                    {showGenreSelector ? 'Hide' : 'Show'} Selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* SEO Section - Improved Style */}
        <div className="mb-6 pb-4 border-b border-slate-600">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-white">
              SEO Settings
            </h3>
            <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
              Important for Google Search
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <span className="flex items-center gap-2">
                  <span className="text-yellow-400">🔍</span>
                  SEO Title
                  <span className="text-slate-400 text-xs">(Appears in Google search results)</span>
                </span>
              </label>
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="e.g., Watch Naruto Shippuden Online in Hindi Dub | AnimeBing"
                maxLength={60}
              />
              <div className="flex justify-between mt-2">
                <p className="text-slate-400 text-xs">
                  Character count: <span className={form.seoTitle.length > 60 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                    {form.seoTitle.length}/60
                  </span>
                </p>
                <p className={`text-xs font-medium ${form.seoTitle.length <= 60 ? 'text-green-400' : 'text-red-400'}`}>
                  {form.seoTitle.length <= 60 ? '✅ Good for SEO' : '❌ Too long for Google'}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <span className="flex items-center gap-2">
                  <span className="text-yellow-400">📝</span>
                  SEO Description
                  <span className="text-slate-400 text-xs">(Appears below title in Google search)</span>
                </span>
              </label>
              <textarea
                value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition h-24"
                placeholder="e.g., Watch Naruto Shippuden online in Hindi Dub. HD quality streaming and downloads. All episodes available."
                maxLength={160}
              />
              <div className="flex justify-between mt-2">
                <p className="text-slate-400 text-xs">
                  Character count: <span className={form.seoDescription.length > 160 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                    {form.seoDescription.length}/160
                  </span>
                </p>
                <p className={`text-xs font-medium ${form.seoDescription.length <= 160 ? 'text-green-400' : 'text-red-400'}`}>
                  {form.seoDescription.length <= 160 ? '✅ Good for SEO' : '❌ Too long for Google'}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <span className="flex items-center gap-2">
                  <span className="text-yellow-400">🏷️</span>
                  SEO Keywords
                  <span className="text-slate-400 text-xs">(Important for search rankings)</span>
                </span>
              </label>
              <textarea
                value={form.seoKeywords}
                onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition h-24"
                placeholder="e.g., naruto shippuden hindi dub, watch naruto shippuden online, naruto anime in hindi, shounen anime, action anime"
              />
              <p className="text-slate-400 text-xs mt-2">
                Separate keywords with commas. Important for Google search rankings. Auto-generated based on title and genres.
              </p>
            </div>
            
            <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <span className="flex items-center gap-2">
                  <span className="text-yellow-400">🔗</span>
                  URL Slug <span className="text-red-400">*</span>
                  <span className="text-slate-400 text-xs">(SEO-friendly URL - Auto-generated)</span>
                </span>
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
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
                  className="bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2.5 rounded-lg transition shadow-md hover:shadow-purple-500/20 whitespace-nowrap"
                >
                  Generate
                </button>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-xs font-medium mb-1">🌐 Preview URL:</p>
                <p className="text-purple-300 text-sm font-mono break-all bg-slate-900 p-2 rounded">
                  https://animebing.in/detail/{form.slug || 'your-anime-slug'}
                </p>
                <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                  <span>✅</span> This URL will appear in Google Search. Make sure it's unique and descriptive.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-5 rounded-lg border border-purple-800/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <div>
              <h4 className="text-white font-bold text-lg">Ready to Publish?</h4>
              <p className="text-slate-400 text-sm">This anime will appear in Google Search results within 24-48 hours</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-green-400 text-sm font-medium bg-green-900/30 px-3 py-1.5 rounded-lg inline-block">
                SEO Optimized: {autoGenerateSEO ? 'Yes ✅' : 'No ⚠️'}
              </p>
              <p className="text-slate-400 text-xs mt-1">Google Indexing: 24-48 hours</p>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !form.title.trim() || !form.slug.trim() || form.genreList.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-purple-500/30 text-lg disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Spinner className="inline h-6 w-6 mr-3" />
                <span className="animate-pulse">Publishing Anime...</span>
              </>
            ) : (
              <>
                <span className="mr-2">🚀</span>
                Publish Anime & Submit to Google
              </>
            )}
          </button>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-slate-800/50 rounded">
              <p className="text-slate-300">Anime Title</p>
              <p className="text-white font-medium truncate">{form.title || 'Not set'}</p>
            </div>
            <div className="text-center p-2 bg-slate-800/50 rounded">
              <p className="text-slate-300">Genres</p>
              <p className="text-white font-medium">{form.genreList.length} selected</p>
            </div>
            <div className="text-center p-2 bg-slate-800/50 rounded">
              <p className="text-slate-300">URL Slug</p>
              <p className="text-purple-300 font-medium truncate">{form.slug || 'Not set'}</p>
            </div>
          </div>
        </div>
        
        {success && (
          <div className="p-5 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-700 rounded-lg animate-pulse">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🎉</div>
              <div>
                <p className="text-green-400 text-lg font-bold mb-2">Successfully Published!</p>
                <p className="text-green-300 text-sm mb-3">{success}</p>
                <div className="p-3 bg-green-900/30 rounded-lg border border-green-800">
                  <p className="text-green-300 text-xs font-medium mb-1">SEO URL Created:</p>
                  <p className="text-green-200 text-sm font-mono break-all">https://animebing.in/detail/{form.slug}</p>
                </div>
                <p className="text-green-400 text-xs mt-3 flex items-center gap-2">
                  <span>✅</span> This anime is now live and will appear in Google Search within 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-5 bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-700 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="text-3xl">❌</div>
              <div>
                <p className="text-red-400 text-lg font-bold mb-2">Error Publishing Anime</p>
                <p className="text-red-300 text-sm">{error}</p>
                <div className="mt-3 p-3 bg-red-900/30 rounded-lg">
                  <p className="text-red-300 text-xs font-medium">Troubleshooting:</p>
                  <ul className="text-red-300 text-xs list-disc list-inside mt-1">
                    <li>Check if the anime title already exists</li>
                    <li>Verify the thumbnail URL is valid</li>
                    <li>Ensure you're logged in as admin</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddAnimeForm;