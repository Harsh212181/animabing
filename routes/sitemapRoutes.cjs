// routes/sitemapRoutes.cjs
const express = require('express');
const router = express.Router();
const Anime = require('../models/Anime.cjs');

/**
 * ✅ DYNAMIC SITEMAP FOR ANIME PAGES
 * This generates XML with all anime detail pages
 */
router.get('/sitemap/anime', async (req, res) => {
  try {
    console.log('📊 Generating dynamic sitemap for anime pages...');
    
    // Get all anime with slug and update date
    const animeList = await Anime.find({})
      .select('slug updatedAt title thumbnail')
      .sort({ updatedAt: -1 })
      .lean();
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
    
    // Add each anime to sitemap
    animeList.forEach(anime => {
      const lastmod = anime.updatedAt 
        ? new Date(anime.updatedAt).toISOString().split('T')[0]
        : '2024-01-15';
      
      const animeSlug = anime.slug || anime._id.toString();
      const animeUrl = `https://animebing.in/detail/${animeSlug}`;
      
      xml += `  <url>\n`;
      xml += `    <loc>${animeUrl}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      
      // Add image if available
      if (anime.thumbnail) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${anime.thumbnail}</image:loc>\n`;
        xml += `      <image:title>${anime.title || 'Anime Image'}</image:title>\n`;
        xml += `      <image:caption>${anime.title || 'Anime Image'}</image:caption>\n`;
        xml += `    </image:image>\n`;
      }
      
      xml += `  </url>\n`;
    });
    
    xml += '</urlset>';
    
    // Set proper headers for XML
    res.set({
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });
    
    console.log(`✅ Generated sitemap with ${animeList.length} anime pages`);
    res.send(xml);
    
  } catch (err) {
    console.error('❌ Sitemap generation error:', err);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * ✅ SITEMAP INDEX (Optional)
 * If you have multiple sitemaps
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Main sitemap
    xml += '  <sitemap>\n';
    xml += '    <loc>https://animebing.in/sitemap-static.xml</loc>\n';
    xml += '    <lastmod>2024-01-15</lastmod>\n';
    xml += '  </sitemap>\n';
    
    // Anime sitemap (dynamic)
    xml += '  <sitemap>\n';
    xml += '    <loc>https://animebing.in/api/sitemap/anime</loc>\n';
    xml += '    <lastmod>2024-01-15</lastmod>\n';
    xml += '  </sitemap>\n';
    
    xml += '</sitemapindex>';
    
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap index error:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;