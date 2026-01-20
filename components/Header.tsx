 // components/Header.tsx - UPDATED LAYOUT VERSION
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
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-white text-xl font-semibold mb-2">Loading animebing.in</h3>
          <p className="text-slate-400">Preparing your content...</p>
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
      `}</style>
      
      <header 
        ref={headerRef}
        className={`
          fixed top-0 left-0 right-0 z-40 transition-all duration-300
          ${isScrolled 
            ? 'bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-purple-500/20 py-2' 
            : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 backdrop-blur-xl border-b border-purple-500/20 py-3'
          }
        `}
      >
        <div className="container mx-auto px-2 md:px-3 relative">
          <div className="flex justify-between items-center h-12 md:h-16">
            
            {/* Logo with Skull Emoji */}
            <button 
              onClick={() => handleNavClick('home')} 
              className="flex items-center space-x-2 group relative"
              disabled={isNavigating}
            >
              <span 
                className="text-lg md:text-xl group-hover:scale-110 transition-transform duration-300"
                style={{
                  fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", sans-serif',
                  textShadow: '0 0 1px rgba(255,255,255,0.5)',
                  filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.3))'
                }}
              >
                ☠️
              </span>
              
              <div className="relative">
                <h1 className="relative text-base md:text-xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    anime<span className="text-purple-400">bing.in</span>
                  </span>
                </h1>
              </div>
            </button>

            {/* Desktop Navigation - Cleaner Layout */}
            <nav className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-4 bg-slate-800/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700">
                <button 
                  onClick={() => handleNavClick('home')} 
                  className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-purple-500/20 transition-all duration-300 font-medium text-sm disabled:opacity-50 border border-transparent hover:border-purple-500/30"
                  disabled={isNavigating}
                >
                  Home
                </button>
                
                {/* Language Filters */}
                <button 
                  onClick={() => handleFilterClick('Hindi Dub')} 
                  className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-purple-500/20 transition-all duration-300 font-medium text-sm disabled:opacity-50 border border-transparent hover:border-purple-500/30 whitespace-nowrap"
                  disabled={isNavigating}
                >
                  Hindi Dub
                </button>
                
                <button 
                  onClick={() => handleFilterClick('Hindi Sub')} 
                  className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-purple-500/20 transition-all duration-300 font-medium text-sm disabled:opacity-50 border border-transparent hover:border-purple-500/30 whitespace-nowrap"
                  disabled={isNavigating}
                >
                  Hindi Sub
                </button>
                
                <button 
                  onClick={() => handleFilterClick('English Sub')} 
                  className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-purple-500/20 transition-all duration-300 font-medium text-sm disabled:opacity-50 border border-transparent hover:border-purple-500/30 whitespace-nowrap"
                  disabled={isNavigating}
                >
                  English Sub
                </button>
                
                {/* Content Type */}
                <button 
                  onClick={() => handleContentTypeClick('Movie')} 
                  className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-purple-500/20 transition-all duration-300 font-medium text-sm disabled:opacity-50 border border-transparent hover:border-purple-500/30 whitespace-nowrap"
                  disabled={isNavigating}
                >
                  Movies
                </button>
                
                <button 
                  onClick={() => handleContentTypeClick('Manga')} 
                  className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-purple-500/20 transition-all duration-300 font-medium text-sm disabled:opacity-50 border border-transparent hover:border-purple-500/30 whitespace-nowrap"
                  disabled={isNavigating}
                >
                  Manga
                </button>
                
                {/* Anime List Button with accent */}
                <button 
                  onClick={() => handleNavClick('list')} 
                  className="px-4 py-1.5 rounded-md bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white transition-all duration-300 font-semibold text-sm disabled:opacity-50 border border-purple-500/50"
                  disabled={isNavigating}
                >
                  Anime List
                </button>
              </div>
            </nav>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <div className="flex items-center">
                  <div className="absolute left-3">
                    <SearchIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search anime/manga..."
                    value={localSearchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-48 lg:w-56 bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 text-sm rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 pl-10 pr-8 py-2 transition-all duration-300 backdrop-blur-sm"
                    disabled={isNavigating}
                  />
                  {localSearchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-2 text-slate-400 hover:text-white transition-colors"
                      type="button"
                      disabled={isNavigating}
                      aria-label="Clear search"
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
                className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-purple-500/20 disabled:opacity-50 transition-all duration-300 border border-slate-700 hover:border-purple-500/30"
                disabled={isNavigating}
                aria-label="Search"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-purple-500/20 disabled:opacity-50 transition-all duration-300 border border-slate-700 hover:border-purple-500/30"
                disabled={isNavigating}
                aria-label="Menu"
              >
                {isMenuOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isMobileSearchOpen && (
            <div className="md:hidden mt-2 pb-3 animate-slideDown">
              <div className="relative">
                <div className="flex items-center">
                  <div className="absolute left-3">
                    <SearchIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search anime/manga..."
                    value={localSearchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 pl-10 pr-16 py-2.5 transition-all duration-300 backdrop-blur-sm"
                    autoFocus
                    disabled={isNavigating}
                  />
                  {localSearchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-10 text-slate-400 hover:text-white transition-colors"
                      type="button"
                      disabled={isNavigating}
                      aria-label="Clear search"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsMobileSearchOpen(false)}
                    className="absolute right-3 text-slate-400 hover:text-white transition-colors"
                    type="button"
                    disabled={isNavigating}
                    aria-label="Close search"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu - Updated Design */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 shadow-2xl shadow-black/50 animate-fadeIn border-t border-purple-500/20">
            <div className="container mx-auto px-2 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span 
                    className="text-lg"
                    style={{
                      fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", sans-serif',
                    }}
                  >
                    ☠️
                  </span>
                  <h3 className="text-base font-bold text-white">
                    <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                      anime<span className="text-purple-400">bing.in</span>
                    </span>
                  </h3>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-700 hover:border-purple-500/30"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                <button 
                  onClick={() => handleNavClick('home')} 
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-purple-500/20 hover:text-white transition-all duration-300 font-medium disabled:opacity-50 border border-slate-700 hover:border-purple-500/30 flex items-center justify-between"
                  disabled={isNavigating}
                >
                  <span>Home</span>
                  <span className="text-purple-400">→</span>
                </button>
                
                <div className="pt-2">
                  <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 px-1">Languages</h4>
                  <div className="space-y-1">
                    <button 
                      onClick={() => handleFilterClick('Hindi Dub')} 
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-purple-500/20 hover:text-white transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-between border border-slate-700 hover:border-purple-500/30"
                      disabled={isNavigating}
                    >
                      <span>Hindi Dub</span>
                      <span className="text-purple-400">→</span>
                    </button>
                    
                    <button 
                      onClick={() => handleFilterClick('Hindi Sub')} 
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-purple-500/20 hover:text-white transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-between border border-slate-700 hover:border-purple-500/30"
                      disabled={isNavigating}
                    >
                      <span>Hindi Sub</span>
                      <span className="text-purple-400">→</span>
                    </button>
                    
                    <button 
                      onClick={() => handleFilterClick('English Sub')} 
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-purple-500/20 hover:text-white transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-between border border-slate-700 hover:border-purple-500/30"
                      disabled={isNavigating}
                    >
                      <span>English Sub</span>
                      <span className="text-purple-400">→</span>
                    </button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 px-1">Categories</h4>
                  <div className="space-y-1">
                    <button 
                      onClick={() => handleContentTypeClick('Movie')} 
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-purple-500/20 hover:text-white transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-between border border-slate-700 hover:border-purple-500/30"
                      disabled={isNavigating}
                    >
                      <span>Movies</span>
                      <span className="text-purple-400">→</span>
                    </button>
                    
                    <button 
                      onClick={() => handleContentTypeClick('Manga')} 
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-purple-500/20 hover:text-white transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-between border border-slate-700 hover:border-purple-500/30"
                      disabled={isNavigating}
                    >
                      <span>Manga</span>
                      <span className="text-purple-400">→</span>
                    </button>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-slate-700">
                  <button 
                    onClick={() => handleNavClick('list')} 
                    className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white transition-all duration-300 font-semibold disabled:opacity-50 border border-purple-500/50 flex items-center justify-center space-x-2"
                    disabled={isNavigating}
                  >
                    <span>Anime List</span>
                    <span>→</span>
                  </button>
                </div>
              </nav>
              
              <div className="mt-4 pt-3 border-t border-slate-700">
                <p className="text-center text-xs text-slate-400 font-light">
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