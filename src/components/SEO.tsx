// src/components/SEO.tsx
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  structuredData?: any;
  noIndex?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = 'anime, hindi anime, english anime, anime dub, anime sub, watch anime online, anime streaming, anime in hindi, anime in english',
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage = '/AnimeBinglogo.jpg',
  ogUrl,
  twitterCard = 'summary_large_image',
  structuredData,
  noIndex = false,
}) => {
  const siteTitle = 'AnimeBing - Watch Anime in Hindi & English Online Free';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultKeywords = 'anime, hindi anime, english anime, anime dub, anime sub, watch anime online, anime streaming, anime in hindi, anime in english';
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl || window.location.href} />
      <meta property="og:site_name" content="AnimeBing" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@animebing" />
      
      {/* Structured Data for Google (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Additional SEO Tags */}
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="googlebot" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <meta name="bingbot" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      
      {/* Mobile Specific */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#3b82f6" />
      
      {/* RSS Feed */}
      <link rel="alternate" type="application/rss+xml" title="AnimeBing RSS Feed" href="/rss.xml" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/AnimeBinglogo.jpg" />
      
      {/* App Links */}
      <meta property="al:android:url" content="https://animebing.in" />
      <meta property="al:android:app_name" content="AnimeBing" />
      <meta property="al:ios:url" content="https://animebing.in" />
      <meta property="al:ios:app_name" content="AnimeBing" />
      <meta property="al:web:url" content="https://animebing.in" />
    </Helmet>
  );
};

export default SEO;

// Additional component for common SEO structures
export const generateAnimeStructuredData = (anime: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": anime.title,
    "description": anime.description || `Watch ${anime.title} online`,
    "image": anime.thumbnail || anime.poster,
    "genre": anime.genres || ["Anime"],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": anime.rating || 4.5,
      "bestRating": "10",
      "ratingCount": anime.views || 1000
    },
    "potentialAction": {
      "@type": "WatchAction",
      "target": `${window.location.origin}/watch/${anime.slug || anime.id}`
    }
  };
};

export const generateWebsiteStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AnimeBing",
    "url": "https://animebing.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://animebing.in/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
};

export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{name: string, url: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};