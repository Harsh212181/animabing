 // components/Header.tsx - UPDATED WITH GREEN OUTLINE #73F58A
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FilterType, ContentType } from '../src/types';
import { SearchIcon } from './icons/SearchIcon';
import { MenuIcon } from './icons/MenuIcon';
import { CloseIcon } from './icons/CloseIcon';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onNavigate: (destination: 'home' | 'list') => void;
  onFilterAndNavigateHome: (filter: 'Hindi Dub' | 'Hindi Sub' | 'English Sub') => void;
  onContentTypeNavigate: (contentType: ContentType) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onSearchChange, 
  searchQuery, 
  onNavigate, 
  onFilterAndNavigateHome, 
  onContentTypeNavigate 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setLocalSearchQuery(searchQuery || '');
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchInputChange = useCallback((value: string) => {
    setLocalSearchQuery(value);
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 300);
  }, [onSearchChange]);

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    onSearchChange('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (isMobileSearchOpen) {
        setIsMobileSearchOpen(false);
      }
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  const handleNavClick = (destination: 'home' | 'list') => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    if (destination === 'list') {
      onNavigate('list');
    } else {
      onNavigate('home');
    }
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
    setTimeout(() => setIsNavigating(false), 800);
  };

  const handleFilterClick = (filter: 'Hindi Dub' | 'Hindi Sub' | 'English Sub') => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    window.location.href = `${window.location.origin}/?filter=${encodeURIComponent(filter)}`;
    setIsMenuOpen(false);
    setTimeout(() => setIsNavigating(false), 1500);
  };

  const handleContentTypeClick = (contentType: ContentType) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    window.location.href = `${window.location.origin}/?contentType=${encodeURIComponent(contentType)}`;
    setIsMenuOpen(false);
    setTimeout(() => setIsNavigating(false), 1500);
  };

  const toggleMobileSearch = () => {
    const newState = !isMobileSearchOpen;
    setIsMobileSearchOpen(newState);
    setIsMenuOpen(false);
    
    if (newState) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  };

  const NavigationLoader = () => (
    isNavigating ? (
      <div className="fixed inset-0 bg-purple-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <h3 className="text-white text-xl font-semibold mb-2">Loading animebing.in</h3>
          <p className="text-purple-400">Preparing your content...</p>
        </div>
      </div>
    ) : null
  );

  return (
    <>
      <NavigationLoader />
      
      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loadingBar {
          animation: loadingBar 1.5s ease-in-out infinite;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        /* Custom green outline color #73F58A */
        .border-green-custom {
          border-color: #73F58A;
        }
        .border-green-custom-30 {
          border-color: rgba(115, 245, 138, 0.3);
        }
        .border-green-custom-50 {
          border-color: rgba(115, 245, 138, 0.5);
        }
        .border-green-custom-20 {
          border-color: rgba(115, 245, 138, 0.2);
        }
        .border-green-custom-70 {
          border-color: rgba(115, 245, 138, 0.7);
        }
        .ring-green-custom {
          --tw-ring-color: #73F58A;
        }
        .shadow-green-custom {
          box-shadow: 0 0 0 1px #73F58A;
        }
        .hover\\:border-green-custom:hover {
          border-color: #73F58A;
        }
        .focus\\:ring-green-custom:focus {
          --tw-ring-color: #73F58A;
          border-color: #73F58A;
        }
        .focus\\:border-green-custom:focus {
          border-color: #73F58A;
        }
        
        /* Enhanced glow effect for green outline */
        .glow-green {
          box-shadow: 
            0 0 5px rgba(115, 245, 138, 0.5),
            0 0 10px rgba(115, 245, 138, 0.3),
            0 0 15px rgba(115, 245, 138, 0.1);
        }
        
        .hover-glow-green:hover {
          box-shadow: 
            0 0 10px rgba(115, 245, 138, 0.6),
            0 0 20px rgba(115, 245, 138, 0.4),
            0 0 30px rgba(115, 245, 138, 0.2);
          transition: box-shadow 0.3s ease;
        }
        
        /* Search section specific styles */
        .search-container {
          border: 2px solid #73F58A;
          border-radius: 0.75rem;
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(10px);
        }
        
        .search-input {
          border: 1px solid rgba(115, 245, 138, 0.4);
          transition: all 0.3s ease;
        }
        
        .search-input:focus {
          border: 2px solid #73F58A;
          box-shadow: 0 0 15px rgba(115, 245, 138, 0.4);
        }
        
        /* Anime section button styles */
        .anime-button {
          border: 1px solid rgba(115, 245, 138, 0.3);
          transition: all 0.3s ease;
        }
        
        .anime-button:hover {
          border: 1px solid #73F58A;
          box-shadow: 0 0 10px rgba(115, 245, 138, 0.4);
        }
      `}</style>
      
      <header 
        ref={headerRef}
        className={`
          fixed top-0 left-0 right-0 z-40 transition-all duration-300 glow-green
          ${isScrolled 
            ? 'bg-purple-900/95 backdrop-blur-xl shadow-lg shadow-black/20 py-2' 
            : 'bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 backdrop-blur-xl py-3'
          }
        `}
        style={{
          borderBottom: '3px solid #73F58A',
          borderBottomWidth: '3px',
          borderBottomStyle: 'solid',
          boxShadow: '0 4px 20px rgba(115, 245, 138, 0.3)'
        }}
      >
        <div className="container mx-auto px-2 md:px-3 relative">
          <div className="flex justify-between items-center h-12 md:h-16">
            
            {/* Logo with Skull Emoji - Now with green outline */}
            <button 
              onClick={() => handleNavClick('home')} 
              className="flex items-center space-x-2 group relative anime-button hover-glow-green"
              style={{
                border: '2px solid rgba(115, 245, 138, 0.5)',
                borderRadius: '0.75rem',
                padding: '0.5rem 1rem',
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(10px)'
              }}
              disabled={isNavigating}
            >
              <span 
                className="text-lg md:text-xl group-hover:scale-110 transition-transform duration-300"
                style={{
                  fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", sans-serif',
                  textShadow: '0 0 3px rgba(115, 245, 138, 0.7)',
                  filter: 'drop-shadow(0 0 2px rgba(115, 245, 138, 0.5))'
                }}
              >
                ☠️
              </span>
              
              <div className="relative">
                <h1 className="relative text-base md:text-xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                    anime<span className="text-green-400">bing.in</span>
                  </span>
                </h1>
              </div>
            </button>

            {/* Desktop Navigation - Cleaner Layout with Green Outline */}
            <nav className="hidden md:flex items-center space-x-4">
              <div 
                className="flex items-center space-x-4 bg-purple-800/50 backdrop-blur-sm rounded-lg px-3 py-2 search-container"
                style={{
                  border: '2px solid #73F58A',
                  boxShadow: '0 0 20px rgba(115, 245, 138, 0.2)'
                }}
              >
                <button 
                  onClick={() => handleNavClick('home')} 
                  className="px-3 py-1.5 rounded-md text-purple-300 hover:text-white hover:bg-green-500/20 transition-all duration-300 font-medium text-sm disabled:opacity-50 anime-button hover-glow-green"
                  style={{ border: '1px solid rgba(115, 245, 138, 0.3)' }}
                  disabled={isNavigating}
                >
                  Home
                </button>
                
                {/* Language Filters */}
                <button 
                  onClick={() => handleFilterClick('Hindi Dub')} 
                  className="px-3 py-1.5 rounded-md text-purple-300 hover:text-white hover:bg-green-500/20 transition-all duration-300 font-medium text-sm disabled:opacity-50 anime-button hover-glow-green whitespace-nowrap"
                  style={{ border: '1px solid rgba(115, 245, 138, 0.3)' }}
                  disabled={isNavigating}
                >
                  Hindi Dub
                </button>
                
                <button 
                  onClick={() => handleFilterClick('Hindi Sub')} 
                  className="px-3 py-1.5 rounded-md text-purple-300 hover:text-white hover:bg-green-500/20 transition-all duration-300 font-medium text-sm disabled:opacity-50 anime-button hover-glow-green whitespace-nowrap"
                  style={{ border: '1px solid rgba(115, 245, 138, 0.3)' }}
                  disabled={isNavigating}
                >
                  Hindi Sub
                </button>
                
                <button 
                  onClick={() => handleFilterClick('English Sub')} 
                  className="px-3 py-1.5 rounded-md text-purple-300 hover:text-white hover:bg-green-500/20 transition-all duration-300 font-medium text-sm disabled:opacity-50 anime-button hover-glow-green whitespace-nowrap"
                  style={{ border: '1px solid rgba(115, 245, 138, 0.3)' }}
                  disabled={isNavigating}
                >
                  English Sub
                </button>
                
                {/* Content Type */}
                <button 
                  onClick={() => handleContentTypeClick('Movie')} 
                  className="px-3 py-1.5 rounded-md text-purple-300 hover:text-white hover:bg-green-500/20 transition-all duration-300 font-medium text-sm disabled:opacity-50 anime-button hover-glow-green whitespace-nowrap"
                  style={{ border: '1px solid rgba(115, 245, 138, 0.3)' }}
                  disabled={isNavigating}
                >
                  Movies
                </button>
                
                <button 
                  onClick={() => handleContentTypeClick('Manga')} 
                  className="px-3 py-1.5 rounded-md text-purple-300 hover:text-white hover:bg-green-500/20 transition-all duration-300 font-medium text-sm disabled:opacity-50 anime-button hover-glow-green whitespace-nowrap"
                  style={{ border: '1px solid rgba(115, 245, 138, 0.3)' }}
                  disabled={isNavigating}
                >
                  Manga
                </button>
                
                {/* Anime List Button with green accent */}
                <button 
                  onClick={() => handleNavClick('list')} 
                  className="px-4 py-1.5 rounded-md bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-500 hover:to-green-500 text-white transition-all duration-300 font-semibold text-sm disabled:opacity-50 border-green-custom-70 hover-glow-green"
                  style={{ 
                    border: '2px solid rgba(115, 245, 138, 0.7)',
                    boxShadow: '0 0 15px rgba(115, 245, 138, 0.4)'
                  }}
                  disabled={isNavigating}
                >
                  Anime List
                </button>
              </div>
            </nav>

            {/* Desktop Search Section - Enhanced with Green Outline */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <div className="flex items-center search-container hover-glow-green"
                     style={{
                       border: '2px solid #73F58A',
                       borderRadius: '0.75rem',
                       padding: '0.25rem',
                       background: 'rgba(30, 41, 59, 0.7)',
                       backdropFilter: 'blur(10px)',
                       boxShadow: '0 0 15px rgba(115, 245, 138, 0.2)'
                     }}>
                  <div className="absolute left-3">
                    <SearchIcon className="w-4 h-4 text-green-400" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search anime/manga..."
                    value={localSearchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-48 lg:w-56 bg-transparent text-white placeholder-green-300 text-sm rounded-lg focus:outline-none pl-10 pr-8 py-2 transition-all duration-300 search-input"
                    style={{ 
                      border: '1px solid rgba(115, 245, 138, 0.4)',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.border = '2px solid #73F58A';
                      e.target.style.boxShadow = '0 0 15px rgba(115, 245, 138, 0.4)';
                    }}
                    onBlur={(e) => {
                      e.target.style.border = '1px solid rgba(115, 245, 138, 0.4)';
                      e.target.style.boxShadow = 'none';
                    }}
                    disabled={isNavigating}
                  />
                  {localSearchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-2 text-green-400 hover:text-white transition-colors"
                      type="button"
                      disabled={isNavigating}
                      aria-label="Clear search"
                      style={{
                        background: 'rgba(115, 245, 138, 0.1)',
                        borderRadius: '50%',
                        padding: '0.25rem'
                      }}
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center space-x-2">
              <button 
                onClick={toggleMobileSearch}
                className="p-2 rounded-lg bg-purple-800/50 text-green-400 hover:text-white hover:bg-green-500/20 disabled:opacity-50 transition-all duration-300 border-green-custom-30 hover:border-green-custom hover-glow-green"
                style={{ 
                  border: '2px solid rgba(115, 245, 138, 0.3)',
                  boxShadow: '0 0 10px rgba(115, 245, 138, 0.2)'
                }}
                disabled={isNavigating}
                aria-label="Search"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-2 rounded-lg bg-purple-800/50 text-green-400 hover:text-white hover:bg-green-500/20 disabled:opacity-50 transition-all duration-300 border-green-custom-30 hover:border-green-custom hover-glow-green"
                style={{ 
                  border: '2px solid rgba(115, 245, 138, 0.3)',
                  boxShadow: '0 0 10px rgba(115, 245, 138, 0.2)'
                }}
                disabled={isNavigating}
                aria-label="Menu"
              >
                {isMenuOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar - Enhanced with Green Outline */}
          {isMobileSearchOpen && (
            <div className="md:hidden mt-2 pb-3 animate-slideDown">
              <div className="relative">
                <div className="flex items-center search-container hover-glow-green"
                     style={{
                       border: '2px solid #73F58A',
                       borderRadius: '0.75rem',
                       padding: '0.25rem',
                       background: 'rgba(30, 41, 59, 0.7)',
                       backdropFilter: 'blur(10px)',
                       boxShadow: '0 0 15px rgba(115, 245, 138, 0.2)'
                     }}>
                  <div className="absolute left-3">
                    <SearchIcon className="w-5 h-5 text-green-400" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search anime/manga..."
                    value={localSearchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-white placeholder-green-300 text-sm rounded-lg focus:outline-none pl-10 pr-16 py-2.5 transition-all duration-300 search-input"
                    style={{ 
                      border: '1px solid rgba(115, 245, 138, 0.4)',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.border = '2px solid #73F58A';
                      e.target.style.boxShadow = '0 0 15px rgba(115, 245, 138, 0.4)';
                    }}
                    onBlur={(e) => {
                      e.target.style.border = '1px solid rgba(115, 245, 138, 0.4)';
                      e.target.style.boxShadow = 'none';
                    }}
                    autoFocus
                    disabled={isNavigating}
                  />
                  {localSearchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-10 text-green-400 hover:text-white transition-colors"
                      type="button"
                      disabled={isNavigating}
                      aria-label="Clear search"
                      style={{
                        background: 'rgba(115, 245, 138, 0.1)',
                        borderRadius: '50%',
                        padding: '0.25rem'
                      }}
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsMobileSearchOpen(false)}
                    className="absolute right-3 text-green-400 hover:text-white transition-colors"
                    type="button"
                    disabled={isNavigating}
                    aria-label="Close search"
                    style={{
                      background: 'rgba(115, 245, 138, 0.1)',
                      borderRadius: '50%',
                      padding: '0.25rem'
                    }}
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu - Updated Design with Green Outline */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 shadow-2xl shadow-black/50 animate-fadeIn glow-green"
               style={{ 
                 borderTop: '3px solid #73F58A',
                 borderTopWidth: '3px',
                 borderTopStyle: 'solid',
                 boxShadow: '0 10px 30px rgba(115, 245, 138, 0.3)'
               }}>
            <div className="container mx-auto px-2 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span 
                    className="text-lg"
                    style={{
                      fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", sans-serif',
                      textShadow: '0 0 3px rgba(115, 245, 138, 0.7)'
                    }}
                  >
                    ☠️
                  </span>
                  <h3 className="text-base font-bold text-white">
                    <span className="bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                      anime<span className="text-green-400">bing.in</span>
                    </span>
                  </h3>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg bg-purple-800 text-green-400 hover:text-white transition-colors border-green-custom-30 hover:border-green-custom hover-glow-green"
                  style={{ 
                    border: '2px solid rgba(115, 245, 138, 0.3)',
                    boxShadow: '0 0 10px rgba(115, 245, 138, 0.2)'
                  }}
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                <button 
                  onClick={() => handleNavClick('home')} 
                  className="w-full px-3 py-2.5 rounded-lg bg-purple-800/50 text-purple-300 hover:bg-green-500/20 hover:text-white transition-all duration-300 font-medium disabled:opacity-50 anime-button hover-glow-green flex items-center justify-between"
                  style={{ border: '1px solid rgba(115, 245, 138, 0.3)' }}
                  disabled={isNavigating}
                >
                  <span>Home</span>
                  <span className="text-green-400">→</span>
                </button>
                
                <div className="pt-2">
                  <h4 className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-2 px-1">Languages</h4>
                  <div className="space-y-1">
                    <button 
                      onClick={() => handleFilterClick('Hindi Dub')} 
                      className="w-full px-3 py-2.5 rounded-lg bg-purple-800/50 text-purple-300 hover:bg-green-500/20 hover:text-white transition-all duration-300 font-medium disabled:opacity-50 anime-button hover-glow-green flex items-center justify-between"
                      style={{ border: '1px solid rgba(115, 245, 138, 0.3)' }}
                      disabled={isNavigating}
                    >
                      <span>Hindi Dub</span>
                      <span className="text-green-400">→</span>
                    </button>
                    
                    <button 
                      onClick={() => handleFilterClick('Hindi Sub')} 
                      className="w-full px-3 py-2.5 rounded-lg bg-purple-800/50 text-purple-300 hover:bg-green-500/20 hover:text-white transition-all duration-300 font-medium disabled:opacity-50 anime-button hover-glow-green flex items-center justify-between"
                      style={{ border: '1px solid rgba(115, 245, 138, 0.3)' }}
                      disabled={isNavigating}
                    >
                      <span>Hindi Sub</span>
                      <span className="text-green-400">→</span>
                    </button>
                    
                    <button 
                      onClick={() => handleFilterClick('English Sub')} 
                      className="w-full px-3 py-2.5 rounded-lg bg-purple-800/50 text-purple-300 hover:bg-green-500/20 hover:text-white transition-all duration-300 font-medium disabled:opacity-50 anime-button hover-glow-green flex items-center justify-between"
                      style={{ border: '1px solid rgba(115, 245, 138, 0.3)' }}
                      disabled={isNavigating}
                    >
                      <span>English Sub</span>
                      <span className="text-green-400">→</span>
                    </button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <h4 className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-2 px-1">Categories</h4>
                  <div className="space-y-1">
                    <button 
                      onClick={() => handleContentTypeClick('Movie')} 
                      className="w-full px-3 py-2.5 rounded-lg bg-purple-800/50 text-purple-300 hover:bg-green-500/20 hover:text-white transition-all duration-300 font-medium disabled:opacity-50 anime-button hover-glow-green flex items-center justify-between"
                      style={{ border: '1px solid rgba(115, 245, 138, 0.3)' }}
                      disabled={isNavigating}
                    >
                      <span>Movies</span>
                      <span className="text-green-400">→</span>
                    </button>
                    
                    <button 
                      onClick={() => handleContentTypeClick('Manga')} 
                      className="w-full px-3 py-2.5 rounded-lg bg-purple-800/50 text-purple-300 hover:bg-green-500/20 hover:text-white transition-all duration-300 font-medium disabled:opacity-50 anime-button hover-glow-green flex items-center justify-between"
                      style={{ border: '1px solid rgba(115, 245, 138, 0.3)' }}
                      disabled={isNavigating}
                    >
                      <span>Manga</span>
                      <span className="text-green-400">→</span>
                    </button>
                  </div>
                </div>
                
                <div className="pt-3" style={{ borderTop: '2px solid rgba(115, 245, 138, 0.3)' }}>
                  <button 
                    onClick={() => handleNavClick('list')} 
                    className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-500 hover:to-green-500 text-white transition-all duration-300 font-semibold disabled:opacity-50 border-green-custom-70 hover-glow-green flex items-center justify-center space-x-2"
                    style={{ 
                      border: '2px solid rgba(115, 245, 138, 0.7)',
                      boxShadow: '0 0 15px rgba(115, 245, 138, 0.4)'
                    }}
                    disabled={isNavigating}
                  >
                    <span>Anime List</span>
                    <span>→</span>
                  </button>
                </div>
              </nav>
              
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(115, 245, 138, 0.3)' }}>
                <p className="text-center text-xs text-green-400 font-light">
                  animebing.in
                </p>
              </div>
            </div>
          </div>
        )}
      </header>
      
      <div className="h-12 md:h-16"></div>
    </>
  );
};

export default Header;