 // components/AdSlot.tsx - UPDATED VERSION FOR ADSTERRA
import React, { useEffect, useRef, useState } from 'react';

interface AdSlotProps {
  position: string;
  className?: string;
  adCode?: string;
  isActive?: boolean;
  onAdLoaded?: () => void;
  onAdError?: (error: string) => void;
}

const AdSlot: React.FC<AdSlotProps> = ({ 
  position, 
  className = '', 
  adCode, 
  isActive = true,
  onAdLoaded,
  onAdError
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adShown, setAdShown] = useState(false);

  useEffect(() => {
    if (!adRef.current) return;

    // Clear previous content
    adRef.current.innerHTML = '';
    setError(null);
    setAdShown(false);

    // If no ad code or inactive
    if (!adCode || !isActive) {
      adRef.current.innerHTML = `
        <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div class="text-slate-400 text-sm mb-1">📢 Advertisement</div>
          <div class="text-slate-500 text-xs">
            ${position} Slot - ${!adCode ? 'No Ad Configured' : 'Inactive'}
          </div>
        </div>
      `;
      setLoading(false);
      if (onAdLoaded) onAdLoaded();
      return;
    }

    setLoading(true);
    
    // Check if it's Adsterra code
    const isAdsterra = adCode.includes('highperformanceformat.com');
    
    if (isAdsterra) {
      // ✅ FIXED: Adsterra के लिए SPECIAL HANDLING
      handleAdsterraAdNew();
    } else {
      // Handle other ads normally
      handleRegularAd();
    }
    
    function handleAdsterraAdNew() {
      try {
        console.log(`🎯 Loading Adsterra ad for ${position}...`);
        
        // Create a unique ID for this ad instance
        const adId = `adsterra-${position}-${Date.now()}`;
        
        // Create container div
        const container = document.createElement('div');
        container.id = adId;
        container.style.width = '100%';
        container.style.minHeight = '90px';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.overflow = 'hidden';
        container.style.position = 'relative';
        container.style.background = 'transparent';
        
        // Insert the Adsterra code directly
        container.innerHTML = adCode;
        
        adRef.current?.appendChild(container);
        
        // Extract and execute scripts
        const scripts = container.getElementsByTagName('script');
        const scriptElements: HTMLScriptElement[] = [];
        
        // Process each script
        Array.from(scripts).forEach((oldScript, index) => {
          const newScript = document.createElement('script');
          newScript.type = 'text/javascript';
          
          // For inline script (atOptions)
          if (oldScript.textContent && oldScript.textContent.trim()) {
            newScript.textContent = oldScript.textContent;
          }
          
          // For external script (invoke.js)
          if (oldScript.src) {
            newScript.src = oldScript.src;
            newScript.async = true;
            newScript.defer = true;
          }
          
          // Add data attributes for tracking
          newScript.setAttribute('data-ad-position', position);
          newScript.setAttribute('data-ad-id', adId);
          
          document.head.appendChild(newScript);
          scriptElements.push(newScript);
        });
        
        // Wait for scripts to load
        setTimeout(() => {
          // Check if ad loaded by looking for iframes or images
          const iframes = container.getElementsByTagName('iframe');
          const images = container.getElementsByTagName('img');
          
          if (iframes.length > 0 || images.length > 0) {
            console.log(`✅ Adsterra ad loaded for ${position}`);
            setAdShown(true);
            setLoading(false);
            if (onAdLoaded) onAdLoaded();
          } else {
            // Try another method - force script execution
            console.log(`🔄 Retrying ad load for ${position}...`);
            retryAdsterraAd();
          }
        }, 2000);
        
        function retryAdsterraAd() {
          try {
            // Create a fresh container
            const newContainer = document.createElement('div');
            newContainer.id = `${adId}-retry`;
            newContainer.style.width = '728px';
            newContainer.style.height = '90px';
            newContainer.style.margin = '0 auto';
            newContainer.style.position = 'relative';
            
            // Create a wrapper with minimal styling
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
              <div id="${adId}-target" style="width:728px;height:90px;position:relative;"></div>
            `;
            
            newContainer.appendChild(wrapper);
            
            // Clear old content and add new
            if (adRef.current) {
              adRef.current.innerHTML = '';
              adRef.current.appendChild(newContainer);
            }
            
            // Direct script injection method
            if (window) {
              // Set atOptions globally
              (window as any).atOptions = {
                'key' : 'c6453a7195ca19ca3f3f729410f11117',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
              };
              
              // Create and append the invoke script
              const invokeScript = document.createElement('script');
              invokeScript.type = 'text/javascript';
              invokeScript.src = '//www.highperformanceformat.com/c6453a7195ca19ca3f3f729410f11117/invoke.js';
              invokeScript.async = true;
              invokeScript.onload = () => {
                console.log(`✅ Adsterra script loaded for ${position}`);
                setAdShown(true);
                setLoading(false);
                if (onAdLoaded) onAdLoaded();
              };
              invokeScript.onerror = () => {
                console.error(`❌ Adsterra script failed for ${position}`);
                showFallbackAd();
              };
              
              document.head.appendChild(invokeScript);
            }
          } catch (retryErr: any) {
            console.error(`❌ Retry failed for ${position}:`, retryErr);
            showFallbackAd();
          }
        }
        
      } catch (err: any) {
        console.error(`❌ Adsterra ad error for ${position}:`, err);
        setError(err.message || 'Failed to load Adsterra ad');
        setLoading(false);
        if (onAdError) onAdError(err.message || 'Failed to load Adsterra ad');
        showFallbackAd();
      }
    }
    
    function handleRegularAd() {
      try {
        console.log(`📢 Loading regular ad for ${position}`);
        
        // Create container for ad
        const container = document.createElement('div');
        container.id = `ad-container-${position}`;
        container.innerHTML = adCode;
        
        adRef.current?.appendChild(container);
        
        // Execute scripts
        const scripts = container.getElementsByTagName('script');
        Array.from(scripts).forEach(oldScript => {
          const newScript = document.createElement('script');
          
          // Copy all attributes
          if (oldScript.attributes) {
            Array.from(oldScript.attributes).forEach(attr => {
              newScript.setAttribute(attr.name, attr.value);
            });
          }
          
          // Copy content
          if (oldScript.src) {
            newScript.src = oldScript.src;
            newScript.async = true;
          } else if (oldScript.textContent) {
            newScript.textContent = oldScript.textContent;
          }
          
          document.head.appendChild(newScript);
        });
        
        console.log(`✅ Regular ad loaded for ${position}`);
        setAdShown(true);
        setLoading(false);
        if (onAdLoaded) onAdLoaded();
        
      } catch (err: any) {
        console.error(`❌ Regular ad error for ${position}:`, err);
        setError(err.message || 'Failed to load ad');
        setLoading(false);
        if (onAdError) onAdError(err.message || 'Failed to load ad');
        showFallbackAd();
      }
    }
    
    function showFallbackAd() {
      if (adRef.current) {
        // Create a visually appealing test ad
        adRef.current.innerHTML = `
          <div style="
            width: 100%;
            max-width: 728px;
            margin: 0 auto;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            text-align: center;
            border-radius: 8px;
            min-height: 90px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border: 2px solid #805ad5;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          ">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold;">🎬 AnimeBing</h3>
            <p style="margin: 0 0 12px 0; font-size: 14px; opacity: 0.9;">
              Watch Anime in HD | ${position} Ad
            </p>
            <button onclick="alert('🎉 Test Ad Clicked!\\n\\nAd Position: ${position}\\nThis is a test advertisement.')" 
                    style="
                      background: white;
                      color: #667eea;
                      border: none;
                      padding: 8px 20px;
                      border-radius: 5px;
                      cursor: pointer;
                      font-weight: bold;
                      font-size: 14px;
                      transition: all 0.2s;
                    "
                    onmouseover="this.style.transform='scale(1.05)'"
                    onmouseout="this.style.transform='scale(1)'"
            >
              Click Here (Test)
            </button>
            <div style="margin-top: 8px; font-size: 11px; opacity: 0.7;">
              Position: ${position} | 728×90 | Test Mode
            </div>
          </div>
        `;
        console.log(`🔄 Showing fallback ad for ${position}`);
        setAdShown(true);
        setLoading(false);
        if (onAdLoaded) onAdLoaded();
      }
    }
    
  }, [adCode, isActive, position, onAdLoaded, onAdError]);

  // Loading state
  if (loading) {
    return (
      <div className={`ad-slot ${className}`}>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="text-slate-400 text-sm mb-1">📢 Loading Advertisement</div>
            <div className="text-slate-500 text-xs mb-2">{position} Slot</div>
            <div className="flex items-center space-x-2">
              <div className="inline-block w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-slate-400">Loading Adsterra...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !adShown) {
    return (
      <div className={`ad-slot ${className}`}>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-slate-400 text-sm mb-1">⚠️ Ad Error</div>
          <div className="text-slate-500 text-xs mb-2">{position} Slot</div>
          <div className="text-red-400 text-xs mb-3 max-w-xs mx-auto break-words">
            {error.length > 100 ? error.substring(0, 100) + '...' : error}
          </div>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => {
                setLoading(true);
                setError(null);
                setTimeout(() => setLoading(false), 100);
              }}
              className="mt-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition"
            >
              Retry
            </button>
            <button 
              onClick={() => {
                if (adRef.current) {
                  showFallbackAd();
                }
              }}
              className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded transition"
            >
              Show Test Ad
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={adRef}
      className={`ad-slot ${className}`}
      data-position={position}
      data-ad-shown={adShown}
      style={{
        minHeight: '90px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}
    />
  );
};

export default AdSlot;
