  // components/DownloadRedirectPage.tsx - UPDATED (Mobile layout fix)
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// ✅ Define DownloadLink interface
interface DownloadLink {
  name: string;
  url: string;
  quality?: string;
  type?: string;
}

// ✅ Define the state structure
interface DownloadPageState {
  title: string;
  animeTitle: string;
  animeId?: string; // ✅ ADDED: For back navigation
  contentType: 'episode' | 'chapter';
  contentNumber: number;
  downloadLinks: DownloadLink[];
}

const DownloadRedirectPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedLinkIndex, setSelectedLinkIndex] = useState<number | null>(null);

  // ✅ Get data from location state (passed from AnimeDetailPage)
  const state = location.state as DownloadPageState | null;

  // ✅ Fallback for old single link format (backward compatibility)
  const fileId = new URLSearchParams(location.search).get('id');
  const fileName = new URLSearchParams(location.search).get('fileName') || 'video.mp4';

  // Check if user is on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ Handle countdown for multiple links (auto-select first link)
  useEffect(() => {
    if (state?.downloadLinks && state.downloadLinks.length > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto-select first link when countdown ends
            if (state.downloadLinks.length === 1) {
              handleDownloadClick(state.downloadLinks[0], 0);
            } else {
              setSelectedLinkIndex(0);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else if (fileId) {
      // Old single link format
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            startSingleDownload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setError('No download links available');
    }
  }, [state, fileId]);

  // ✅ Old single download function (for backward compatibility)
  const startSingleDownload = () => {
    setIsDownloading(true);
    
    if (!fileId) {
      setError('Download link is invalid or missing file ID');
      setIsDownloading(false);
      return;
    }
    
    const downloadUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0`;
    
    // For mobile, try to download directly
    if (isMobile) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        setIsDownloading(false);
      }, 2000);
    } else {
      const newWindow = window.open(downloadUrl, '_blank');
      
      if (!newWindow) {
        setError('Please allow pop-ups for this site to start download.');
        setIsDownloading(false);
      } else {
        setTimeout(() => {
          setIsDownloading(false);
        }, 2000);
      }
    }
  };

  // ✅ NEW: Handle download click for multiple links
  const handleDownloadClick = (link: DownloadLink, index: number) => {
    setIsDownloading(true);
    setSelectedLinkIndex(index);
    
    // Open the download URL
    window.open(link.url, '_blank');
    
    // Show success message after 2 seconds
    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  // ✅ NEW: Handle going back to anime detail page
  const handleBackToAnime = () => {
    if (state?.animeId) {
      // Navigate back to anime detail page
      navigate(`/detail/${state.animeId}`);
    } else {
      // Fallback: go back in history
      navigate(-1);
    }
  };

  const handleManualDownload = () => {
    if (state?.downloadLinks && state.downloadLinks.length > 0) {
      if (state.downloadLinks.length === 1) {
        handleDownloadClick(state.downloadLinks[0], 0);
      }
    } else if (fileId) {
      startSingleDownload();
    }
  };

  // ✅ Render download links list - SIMPLIFIED (NO LINK URLS)
  const renderDownloadLinks = () => {
    if (!state?.downloadLinks || state.downloadLinks.length === 0) {
      return null;
    }

    const links = state.downloadLinks;

    return (
      <div className="mt-4 md:mt-6">
        {/* Header for mobile */}
        <div className="text-center mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-bold text-white mb-2">
            {links.length === 1 ? 'Download Ready' : `Choose Download Link (${links.length})`}
          </h3>
          <p className="text-slate-300 text-sm">
            {links.length === 1 
              ? 'Tap the download button to start' 
              : 'Select one of the download links below'}
          </p>
        </div>
        
        {/* Download links list - Mobile optimized */}
        <div className="space-y-3 md:space-y-4">
          {links.map((link, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                selectedLinkIndex === index
                  ? 'bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500 shadow-lg'
                  : 'bg-slate-900/60 border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/60'
              }`}
            >
              {/* ✅ UPDATED: Mobile view - Text on first line, button on second line */}
              <div className="flex flex-col">
                {/* First line: Link Info */}
                <div className="flex items-start mb-3 gap-3">
                  {/* Number badge */}
                  <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${
                    selectedLinkIndex === index
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                      : 'bg-gradient-to-r from-purple-700/50 to-blue-700/50'
                  }`}>
                    <span className="text-white font-bold text-base">{index + 1}</span>
                  </div>
                  
                  {/* Link details - Takes full width */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-base mb-1 break-words">
                      {link.name}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {link.quality && (
                        <span className="bg-green-600/20 text-green-400 px-2 py-0.5 rounded text-xs">
                          {link.quality}
                        </span>
                      )}
                      {link.type && (
                        <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-xs">
                          {link.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* ✅ Second line: Download button - Full width on mobile */}
                <button
                  onClick={() => handleDownloadClick(link, index)}
                  disabled={isDownloading}
                  className={`w-full px-4 py-3 rounded-lg font-medium text-base transition-all ${
                    isDownloading && selectedLinkIndex === index
                      ? 'bg-gradient-to-r from-purple-700 to-blue-700 cursor-wait'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-95'
                  }`}
                >
                  {isDownloading && selectedLinkIndex === index ? (
                    <span className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Downloading...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Now
                    </span>
                  )}
                </button>
              </div>
              
              {/* ✅ REMOVED: Link URL section */}
            </div>
          ))}
        </div>
        
        {/* Tips for mobile */}
        <div className="mt-6 p-4 bg-blue-900/20 rounded-xl border border-blue-800/30">
          <h4 className="text-blue-300 font-medium text-sm mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tips for Best Experience:
          </h4>
          <ul className="text-xs text-blue-200 space-y-1">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2 mt-0.5">•</span>
              <span>Tap "Download Now" to start download</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2 mt-0.5">•</span>
              <span>If one link doesn't work, try another</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2 mt-0.5">•</span>
              <span>Complete the link ad for download</span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  // ✅ Get title for display
  const getDisplayTitle = () => {
    if (state) {
      const shortTitle = state.animeTitle.length > 30 
        ? state.animeTitle.substring(0, 30) + '...'
        : state.animeTitle;
      return `${shortTitle} - ${state.contentType} ${state.contentNumber}`;
    }
    return fileName;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0c1c] flex flex-col p-4">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 rounded-xl mb-6">
          <div className="container mx-auto">
            <h1 className="text-xl md:text-2xl font-bold text-white">AnimeBing Download</h1>
          </div>
        </div>
        
        <main className="flex-grow flex items-center justify-center">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 w-full max-w-md border border-slate-700">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.282 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white mb-3 text-center">Download Error</h1>
            <p className="text-slate-300 mb-6 text-center text-sm">{error}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={handleBackToAnime}
                className="w-full bg-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-600 transition-all"
              >
                Back to Anime
              </button>
            </div>
          </div>
        </main>
        
        <footer className="mt-8 bg-slate-900/80 p-4 text-center rounded-xl border border-slate-800">
          <p className="text-slate-400 text-xs">© {new Date().getFullYear()} AnimeBing</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c1c] flex flex-col p-4">
      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 rounded-xl mb-6">
        <div className="container mx-auto">
          <h1 className="text-xl md:text-2xl font-bold text-white">AnimeBing Download</h1>
          <p className="text-slate-300 mt-1 text-sm">
            {state ? `${state.contentType.charAt(0).toUpperCase() + state.contentType.slice(1)} ${state.contentNumber}` : 'File Download'}
          </p>
          
          {/* ✅ ADDED: Quick Back Button at Top */}
          <button
            onClick={handleBackToAnime}
            className="mt-3 bg-slate-800/60 hover:bg-slate-700/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Anime
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg p-4 md:p-6 w-full max-w-2xl border border-slate-700">
          {/* File Info - Mobile Optimized */}
          <div className="flex items-center mb-4 md:mb-6 p-3 bg-slate-900/50 rounded-lg">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-900/30 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-white text-sm md:text-base truncate" title={getDisplayTitle()}>
                {getDisplayTitle()}
              </h2>
              {state?.animeTitle && (
                <p className="text-xs text-slate-400 truncate" title={state.animeTitle}>
                  From: {state.animeTitle}
                </p>
              )}
              {state?.downloadLinks && (
                <p className="text-xs text-slate-400 mt-1">
                  {state.downloadLinks.length} link{state.downloadLinks.length > 1 ? 's' : ''} available
                </p>
              )}
            </div>
          </div>

          {/* ✅ Show download links list if multiple links */}
          {state?.downloadLinks && state.downloadLinks.length > 0 ? (
            renderDownloadLinks()
          ) : (
            <>
              {/* Countdown (for single link or old format) */}
              <div className="text-center mb-6 md:mb-8">
                <p className="text-slate-300 mb-2 text-sm">
                  {state?.downloadLinks?.length === 1 
                    ? 'Download will start in:' 
                    : 'Download will start in:'}
                </p>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text mb-1">
                  {countdown}
                </div>
                <p className="text-slate-400 text-xs md:text-sm">seconds</p>
              </div>

              {/* Download Status */}
              <div className="mb-4 md:mb-6">
                {isDownloading ? (
                  <div className="text-center">
                    <div className="inline-block w-12 h-12 md:w-14 md:h-14 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                    <p className="text-white font-medium text-sm md:text-base">Download in progress...</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {isMobile ? 'Check downloads folder' : 'Please wait while download starts'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3">
                      <svg className="w-full h-full text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-white font-medium text-base md:text-lg">Ready to download</p>
                  </div>
                )}
              </div>

              {/* Action Buttons - Mobile Optimized */}
              <div className="space-y-3">
                <button
                  onClick={handleManualDownload}
                  disabled={isDownloading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                >
                  {isDownloading ? (
                    <span className="flex items-center justify-center">
                      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Downloading...
                    </span>
                  ) : (
                    'Download Now'
                  )}
                </button>

                {/* ✅ CHANGED: "Go Back" to "Back to Anime" */}
                <button
                  onClick={handleBackToAnime}
                  className="w-full border-2 border-slate-600 text-white py-3 rounded-lg font-medium hover:bg-slate-800/50 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Anime
                </button>
              </div>

              {/* Tips - Mobile Optimized */}
              <div className="mt-6 pt-4 border-t border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Download Tips
                </h3>
                <ul className="text-xs text-slate-400 space-y-1.5">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2 mt-0.5">•</span>
                    <span>{isMobile ? 'Tap Download Now to start' : 'Allow pop-ups for download'}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2 mt-0.5">•</span>
                    <span>Check browser downloads folder</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2 mt-0.5">•</span>
                    <span>Use stable internet connection</span>
                  </li>
                  {isMobile && (
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2 mt-0.5">•</span>
                      <span>Keep page open until download completes</span>
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
      </main>
      
      {/* Footer - Mobile Optimized */}
      <footer className="mt-6 bg-slate-900/80 p-3 text-center rounded-xl border border-slate-800">
        <p className="text-slate-400 text-xs">© {new Date().getFullYear()} AnimeBing - All rights reserved</p>
      </footer>
    </div>
  );
};

export default DownloadRedirectPage;
