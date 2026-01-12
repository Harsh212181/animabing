// server.cjs - UPDATED WITH DYNAMIC SITEMAP GENERATOR
const express = require('express');
const cors = require('cors');
const connectDB = require('./db.cjs');
require('dotenv').config();

const Analytics = require('./models/Analytics.cjs');
const { generalLimiter, authLimiter, adminLimiter, apiLimiter } = require('./middleware/rateLimit.cjs');

// ✅ IMPORT MIDDLEWARE AND ROUTES
const adminAuth = require('./middleware/adminAuth.cjs');
const animeRoutes = require('./routes/animeRoutes.cjs');
const episodeRoutes = require('./routes/episodeRoutes.cjs');
const chapterRoutes = require('./routes/chapterRoutes.cjs');
const reportRoutes = require('./routes/reportRoutes.cjs');
const socialRoutes = require('./routes/socialRoutes.cjs');
const appDownloadRoutes = require('./routes/appDownloadRoutes.cjs');
const adminRoutes = require('./routes/adminRoutes.cjs');
const contactRoutes = require('./routes/contactRoutes.cjs');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database Connection
connectDB();

// ✅ RATE LIMITING MIDDLEWARE
app.use('/api/', apiLimiter);
app.use('/api/admin/login', authLimiter);
app.use('/api/admin/protected', adminLimiter);

// ✅ ANALYTICS TRACKING MIDDLEWARE
app.use((req, res, next) => {
  if (req.path === '/' || 
      req.path.includes('/anime') || 
      req.path.includes('/api/anime') ||
      req.path.includes('/search')) {
    Analytics.recordVisit(req, 0);
  }
  next();
});

// ✅ DYNAMIC SITEMAP GENERATOR
app.get('/sitemap.xml', async (req, res) => {
  try {
    console.log('🗺️ Generating dynamic sitemap.xml...');
    
    const Anime = require('./models/Anime.cjs');
    
    // Get all anime with SEO fields
    const allAnime = await Anime.find({})
      .select('slug seoTitle thumbnail updatedAt contentType subDubStatus releaseYear')
      .lean();
    
    // Start building XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;
    
    const currentDate = new Date().toISOString().split('T')[0];
    
    // ✅ STATIC PAGES
    const staticPages = [
      { url: 'https://animebing.in', priority: '1.0', changefreq: 'daily' },
      { url: 'https://animebing.in/anime', priority: '0.9', changefreq: 'daily' },
      { url: 'https://animebing.in/anime?filter=Hindi%20Dub', priority: '0.8', changefreq: 'daily' },
      { url: 'https://animebing.in/anime?filter=Hindi%20Sub', priority: '0.8', changefreq: 'daily' },
      { url: 'https://animebing.in/anime?filter=English%20Sub', priority: '0.8', changefreq: 'daily' },
      { url: 'https://animebing.in/privacy', priority: '0.5', changefreq: 'monthly' },
      { url: 'https://animebing.in/terms', priority: '0.5', changefreq: 'monthly' },
      { url: 'https://animebing.in/dmca', priority: '0.5', changefreq: 'monthly' },
      { url: 'https://animebing.in/contact', priority: '0.5', changefreq: 'monthly' }
    ];
    
    // Add static pages
    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
    });
    
    // ✅ SEARCH KEYWORD PAGES (For SEO)
    const searchKeywords = [
      'naruto',
      'one%20piece',
      'dragon%20ball',
      'demon%20slayer',
      'attack%20on%20titan',
      'anime%20in%20hindi',
      'anime%20in%20hindi%20dub',
      'anime%20in%20hindi%20sub',
      'anime%20in%20english%20sub',
      'watch%20anime%20online',
      'free%20anime%20download',
      'anime%20streaming'
    ];
    
    searchKeywords.forEach(keyword => {
      xml += `  <url>
    <loc>https://animebing.in/?search=${keyword}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    });
    
    // ✅ DYNAMIC ANIME PAGES
    console.log(`📺 Adding ${allAnime.length} anime to sitemap...`);
    
    allAnime.forEach(anime => {
      if (anime.slug) {
        const lastmod = anime.updatedAt ? 
          new Date(anime.updatedAt).toISOString().split('T')[0] : 
          currentDate;
        
        xml += `  <url>
    <loc>https://animebing.in/detail/${anime.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>\n`;
        
        // Add image if available
        if (anime.thumbnail) {
          xml += `    <image:image>
      <image:loc>${anime.thumbnail}</image:loc>
      <image:title><![CDATA[${anime.seoTitle || anime.title}]]></image:title>
    </image:image>\n`;
        }
        
        // Add video info if it's a movie or series
        if (anime.contentType === 'Movie') {
          xml += `    <video:video>
      <video:title><![CDATA[${anime.title}]]></video:title>
      <video:description><![CDATA[Watch ${anime.title} online in ${anime.subDubStatus}]]></video:description>
      <video:thumbnail_loc>${anime.thumbnail || ''}</video:thumbnail_loc>
      <video:release_date>${anime.releaseYear || currentDate.split('-')[0]}-01-01</video:release_date>
    </video:video>\n`;
        }
        
        xml += `  </url>\n`;
      }
    });
    
    xml += '</urlset>';
    
    // Set headers and send response
    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(xml);
    
    console.log(`✅ Sitemap generated successfully with ${allAnime.length + staticPages.length + searchKeywords.length} URLs`);
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    
    // Fallback to static sitemap if dynamic fails
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://animebing.in</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://animebing.in/detail</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.send(fallbackSitemap);
  }
});

// ✅ ROBOTS.TXT (For SEO)
app.get('/robots.txt', (req, res) => {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/admin/
Sitemap: https://animebing.in/sitemap.xml

# SEO Instructions for Google
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

# Block bad bots
User-agent: AhrefsBot
Disallow: /
User-agent: SemrushBot
Disallow: /

# SEO Sitemaps
Sitemap: https://animebing.in/sitemap.xml
Sitemap: https://animebing.in/rss.xml`;
  
  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

// ✅ RSS FEED FOR SEO
app.get('/rss.xml', async (req, res) => {
  try {
    const Anime = require('./models/Anime.cjs');
    
    const recentAnime = await Anime.find({})
      .select('title description thumbnail slug seoDescription updatedAt')
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();
    
    const currentDate = new Date().toUTCString();
    
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AnimeBing - Latest Anime Updates</title>
    <link>https://animebing.in</link>
    <description>Watch anime online in Hindi and English. Latest anime episodes and movies.</description>
    <language>en-us</language>
    <pubDate>${currentDate}</pubDate>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="https://animebing.in/rss.xml" rel="self" type="application/rss+xml" />\n`;
    
    recentAnime.forEach(anime => {
      const pubDate = anime.updatedAt ? new Date(anime.updatedAt).toUTCString() : currentDate;
      const description = anime.seoDescription || anime.description || `Watch ${anime.title} online`;
      
      rss += `    <item>
      <title><![CDATA[${anime.title}]]></title>
      <link>https://animebing.in/detail/${anime.slug || anime._id}</link>
      <guid>https://animebing.in/detail/${anime.slug || anime._id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <enclosure url="${anime.thumbnail || ''}" type="image/jpeg" />
    </item>\n`;
    });
    
    rss += `  </channel>
</rss>`;
    
    res.header('Content-Type', 'application/xml');
    res.send(rss);
    
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    res.status(500).send('Error generating RSS feed');
  }
});

// ✅ FIXED ADMIN CREATION FUNCTION
const createAdmin = async () => {
  try {
    const Admin = require('./models/Admin.cjs');
    const bcrypt = require('bcryptjs');
    
    const username = process.env.ADMIN_USER || 'Hellobrother';
    const password = process.env.ADMIN_PASS || 'Anime2121818144';
    
    console.log('🔄 Checking admin user...');
    
    let admin = await Admin.findOne({ username });
    
    if (!admin) {
      console.log('🆕 Creating new admin user...');
      const hashedPassword = await bcrypt.hash(password, 12);
      
      admin = await Admin.create({
        username: username,
        password: hashedPassword,
        email: 'admin@animabing.com',
        role: 'admin'
      });
      
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('✅ Admin user already exists');
      
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash(password, 12);
      admin.password = hashedPassword;
      await admin.save();
      console.log('🔁 Admin password updated');
    }
    
    console.log('=================================');
    console.log('🔑 ADMIN LOGIN CREDENTIALS:');
    console.log('   Username:', username);
    console.log('   Password:', password);
    console.log('   Login URL: http://localhost:5173');
    console.log('   Press Ctrl+Shift+Alt for admin button');
    console.log('=================================');
    
  } catch (err) {
    console.error('❌ ADMIN CREATION ERROR:', err);
    console.log('💡 TROUBLESHOOTING:');
    console.log('1. Check MongoDB connection');
    console.log('2. Check bcrypt installation: npm install bcryptjs');
    console.log('3. Check environment variables in .env file');
  }
};
createAdmin();

// ✅ EMERGENCY ADMIN RESET ROUTE
app.get('/api/admin/emergency-reset', async (req, res) => {
  try {
    const Admin = require('./models/Admin.cjs');
    const bcrypt = require('bcryptjs');
    
    console.log('🆕 EMERGENCY ADMIN RESET INITIATED...');
    
    // Delete any existing admin
    await Admin.deleteMany({});
    console.log('✅ Cleared existing admin users');
    
    // Create new admin with hashed password
    const hashedPassword = await bcrypt.hash('Anime2121818144', 12);
    const admin = new Admin({
      username: 'Hellobrother',
      password: hashedPassword,
      email: 'admin@animabing.com',
      role: 'superadmin'
    });
    
    await admin.save();
    console.log('✅ EMERGENCY ADMIN CREATED SUCCESSFULLY!');
    
    res.json({ 
      success: true, 
      message: '✅ EMERGENCY: Admin account created successfully!',
      credentials: {
        username: 'Hellobrother',
        password: 'Anime2121818144'
      },
      instructions: 'Use these credentials to login at /admin route'
    });
    
  } catch (error) {
    console.error('❌ EMERGENCY ADMIN RESET ERROR:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Check MongoDB connection and bcrypt installation'
    });
  }
});

// ✅ ADMIN DEBUG ROUTE
app.get('/api/admin/debug', async (req, res) => {
  try {
    const Admin = require('./models/Admin.cjs');
    
    const adminCount = await Admin.countDocuments();
    const allAdmins = await Admin.find().select('username email createdAt');
    
    console.log('🔍 ADMIN DEBUG INFO:');
    console.log('Total Admins:', adminCount);
    console.log('Admin List:', allAdmins);
    
    res.json({
      success: true,
      totalAdmins: adminCount,
      admins: allAdmins,
      serverTime: new Date().toISOString(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    });
    
  } catch (error) {
    console.error('Admin debug error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ✅ EMERGENCY ADMIN CREATION ROUTE
app.get('/api/admin/create-default-admin', async (req, res) => {
  try {
    const Admin = require('./models/Admin.cjs');
    const bcrypt = require('bcryptjs');
    
    console.log('🆕 EMERGENCY: Creating default admin user...');
    
    // Delete existing admin if any
    await Admin.deleteMany({ username: 'Hellobrother' });
    
    // Create new admin
    const hashedPassword = await bcrypt.hash('Anime2121818144', 12);
    const admin = new Admin({
      username: 'Hellobrother',
      password: hashedPassword,
      email: 'admin@animabing.com',
      role: 'admin'
    });
    
    await admin.save();
    
    console.log('✅ EMERGENCY ADMIN CREATED:', admin.username);
    
    res.json({ 
      success: true, 
      message: '✅ EMERGENCY: Admin created successfully!',
      credentials: {
        username: 'Hellobrother',
        password: 'Anime2121818144'
      },
      instructions: 'Use these credentials to login at your frontend admin panel'
    });
  } catch (error) {
    console.error('❌ EMERGENCY Admin creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

// ✅ FIXED ADMIN LOGIN ROUTE
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('\n🔐 LOGIN ATTEMPT:', { 
      username, 
      hasPassword: !!password,
      timestamp: new Date().toISOString()
    });
    
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Username and password required' 
      });
    }

    const Admin = require('./models/Admin.cjs');
    const bcrypt = require('bcryptjs');
    
    // Find admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log('❌ Admin not found:', username);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid username or password' 
      });
    }

    console.log('🔑 Admin found, comparing passwords...');
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log('✅ Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid username or password' 
      });
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        id: admin._id, 
        username: admin.username,
        role: admin.role 
      }, 
      process.env.JWT_SECRET || 'supersecretkey', 
      { expiresIn: '24h' }
    );

    console.log('🎉 LOGIN SUCCESSFUL for:', username);
    
    res.json({ 
      success: true, 
      message: 'Login successful', 
      token, 
      username: admin.username,
      role: admin.role
    });
    
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error during login' 
    });
  }
});

// ✅ App downloads API
app.get('/api/app-downloads', async (req, res) => {
  try {
    const AppDownload = require('./models/AppDownload.cjs');
    const appDownloads = await AppDownload.find({ isActive: true });
    res.json(appDownloads);
  } catch (error) {
    console.error('App downloads API error:', error);
    res.json([]);
  }
});

// ✅ EPISODES BY ANIME ID ROUTE - ADDED
app.get('/api/episodes/:animeId', async (req, res) => {
  try {
    const { animeId } = req.params;
    console.log('📺 Fetching episodes for anime:', animeId);
    
    const Episode = require('./models/Episode.cjs');
    const episodes = await Episode.find({ animeId }).sort({ session: 1, episodeNumber: 1 });
    
    console.log(`✅ Found ${episodes.length} episodes for anime ${animeId}`);
    res.json(episodes);
  } catch (error) {
    console.error('Episodes fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ✅ PROTECTED ADMIN ROUTES
// ============================================
app.use('/api/admin/protected', adminAuth, adminRoutes);

// ============================================
// ✅ PUBLIC ROUTES - CORRECTED ORDER
// ============================================
// ✅ SOCIAL MEDIA ROUTES MUST COME BEFORE ADMIN ROUTES FOR /admin paths
app.use('/api/social', socialRoutes);

// Other routes
app.use('/api/anime', animeRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/app-downloads', appDownloadRoutes);
app.use('/api', contactRoutes);

// ============================================
// ✅ DEBUG ROUTES (KEEP FOR TROUBLESHOOTING)
// ============================================
app.get('/api/debug/episodes', async (req, res) => {
  try {
    const Episode = require('./models/Episode.cjs');
    const Anime = require('./models/Anime.cjs');
    
    const allEpisodes = await Episode.find().populate('animeId', 'title');
    
    console.log('📋 ALL EPISODES IN DATABASE:');
    allEpisodes.forEach(ep => {
      console.log(`- ${ep.animeId?.title || 'NO ANIME'} | EP ${ep.episodeNumber} | Session ${ep.session} | AnimeID: ${ep.animeId?._id}`);
    });
    
    res.json({
      totalEpisodes: allEpisodes.length,
      episodes: allEpisodes
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/debug/anime/:animeId', async (req, res) => {
  try {
    const Anime = require('./models/Anime.cjs');
    const Episode = require('./models/Episode.cjs');
    
    const animeId = req.params.animeId;
    const anime = await Anime.findById(animeId);
    const episodes = await Episode.find({ animeId });
    
    console.log('🔍 DEBUG ANIME:');
    console.log('Anime Title:', anime?.title);
    console.log('Anime ID:', anime?._id);
    console.log('Requested ID:', animeId);
    console.log('Episodes found:', episodes.length);
    
    res.json({
      anime: anime,
      episodes: episodes,
      animeId: animeId,
      episodesCount: episodes.length
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/debug/animes', async (req, res) => {
  try {
    const Anime = require('./models/Anime.cjs');
    const animes = await Anime.find().select('title _id contentType');
    
    console.log('📺 ALL ANIMES IN DATABASE:');
    animes.forEach(anime => {
      console.log(`- ${anime.title} | ID: ${anime._id} | Type: ${anime.contentType}`);
    });
    
    res.json({
      totalAnimes: animes.length,
      animes: animes
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ SOCIAL MEDIA DEBUG ROUTE
app.get('/api/debug/social', async (req, res) => {
  try {
    const SocialMedia = require('./models/SocialMedia.cjs');
    
    const allLinks = await SocialMedia.find().sort({ platform: 1 });
    const activeLinks = await SocialMedia.find({ isActive: true });
    
    console.log('🔗 SOCIAL MEDIA DEBUG:');
    console.log('Total Links:', allLinks.length);
    console.log('Active Links:', activeLinks.length);
    
    allLinks.forEach(link => {
      console.log(`- ${link.platform}: ${link.url} [${link.isActive ? 'Active' : 'Inactive'}]`);
    });
    
    res.json({
      success: true,
      totalLinks: allLinks.length,
      activeLinks: activeLinks.length,
      allLinks: allLinks,
      activeLinks: activeLinks
    });
  } catch (error) {
    console.error('Social media debug error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ✅ HEALTH CHECK WITH SEO INFO
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Animabing Server Running - SEO OPTIMIZED',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    seoFeatures: {
      sitemap: 'https://animebing.in/sitemap.xml',
      robots: 'https://animebing.in/robots.txt',
      rssFeed: 'https://animebing.in/rss.xml',
      dynamicUrls: 'Enabled',
      structuredData: 'Enabled'
    }
  });
});

// ✅ EMERGENCY: SET ALL ANIME AS FEATURED ROUTE
app.get('/api/emergency/set-all-featured', async (req, res) => {
  try {
    const Anime = require('./models/Anime.cjs');
    
    console.log('🆕 EMERGENCY: Setting ALL anime as featured...');
    
    const result = await Anime.updateMany(
      {}, 
      { 
        $set: { 
          featured: true,
          featuredOrder: 1 
        } 
      }
    );
    
    console.log(`✅ Set ${result.modifiedCount} anime as featured`);
    
    const featuredAnime = await Anime.find({ featured: true })
      .select('title featured featuredOrder')
      .limit(10)
      .lean();
    
    res.json({ 
      success: true, 
      message: `Set ${result.modifiedCount} anime as featured`,
      modifiedCount: result.modifiedCount,
      sampleFeatured: featuredAnime
    });
    
  } catch (error) {
    console.error('❌ Emergency featured error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ EMERGENCY: RESET SOCIAL MEDIA LINKS
app.get('/api/emergency/reset-social', async (req, res) => {
  try {
    const SocialMedia = require('./models/SocialMedia.cjs');
    
    console.log('🆕 EMERGENCY: Resetting social media links...');
    
    // Delete all existing social media links
    await SocialMedia.deleteMany({});
    
    // Initialize default links
    await SocialMedia.initDefaultLinks();
    
    const links = await SocialMedia.find().sort({ platform: 1 });
    
    console.log('✅ Social media links reset to defaults');
    
    res.json({
      success: true,
      message: 'Social media links reset to default (Facebook, Instagram, Telegram)',
      links: links
    });
  } catch (error) {
    console.error('❌ Social media reset error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ✅ EMERGENCY: FIX SOCIAL MEDIA LINKS WITH CORRECT URLS (NEW ROUTE)
app.get('/api/emergency/fix-social-urls', async (req, res) => {
  try {
    const SocialMedia = require('./models/SocialMedia.cjs');
    
    console.log('🆕 EMERGENCY: Fixing social media links with correct URLs...');
    
    // Delete all existing social media links
    await SocialMedia.deleteMany({});
    
    // CORRECT LINKS with proper formatting
    const correctLinks = [
      {
        platform: 'instagram',
        url: 'https://instagram.com/animebingofficial', // Removed ?igsh parameter
        isActive: true,
        icon: 'instagram',
        displayName: 'Instagram'
      },
      {
        platform: 'telegram', 
        url: 'https://t.me/animebingofficial', // Fixed typo: animebingofficile -> animebingofficial
        isActive: true,
        icon: 'telegram',
        displayName: 'Telegram'
      },
      {
        platform: 'facebook',
        url: 'https://facebook.com/animebingofficial', // Proper Facebook page link
        isActive: true,
        icon: 'facebook',
        displayName: 'Facebook'
      }
    ];
    
    // Insert the correct links
    await SocialMedia.insertMany(correctLinks);
    console.log('✅ Inserted CORRECTED social media links');
    
    // Verify
    const allLinks = await SocialMedia.find().sort({ platform: 1 });
    
    res.json({
      success: true,
      message: '✅ EMERGENCY: Social media links fixed with CORRECT URLs!',
      note: 'Instagram: Removed ?igsh parameter, Telegram: Fixed typo, Facebook: Changed to page link',
      links: allLinks,
      instructions: 'Now refresh your website and test the social media icons. They will now open correct profiles.'
    });
    
  } catch (error) {
    console.error('❌ Emergency social media fix error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================
// ✅ ROOT ROUTE - SEO OPTIMIZED VERSION
// ============================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>AnimeBing - Watch Anime Online in Hindi & English | Free Anime Streaming</title>
      <meta name="description" content="Watch anime online for free in Hindi Dub, Hindi Sub, and English Sub. HD quality streaming and downloads. Latest anime episodes and movies on AnimeBing.">
      <meta name="keywords" content="watch anime online, hindi anime, english anime, anime in hindi, anime in english, free anime streaming, anime download, anime binge">
      <meta name="robots" content="index, follow">
      <link rel="canonical" href="https://animebing.in">
      
      <!-- Open Graph -->
      <meta property="og:title" content="AnimeBing - Watch Anime Online in Hindi & English">
      <meta property="og:description" content="Watch anime online for free in Hindi and English. HD quality streaming and downloads.">
      <meta property="og:image" content="/AnimeBinglogo.jpg">
      <meta property="og:url" content="https://animebing.in">
      <meta property="og:type" content="website">
      
      <!-- Twitter Card -->
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="AnimeBing - Watch Anime Online in Hindi & English">
      <meta name="twitter:description" content="Watch anime online for free in Hindi and English. HD quality streaming and downloads.">
      <meta name="twitter:image" content="/AnimeBinglogo.jpg">
      
      <style>
        body {
          background: #0a0c1c;
          color: white;
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .container {
          text-align: center;
          padding: 2rem;
          max-width: 800px;
        }
        h1 {
          color: #8B5CF6;
          margin-bottom: 1rem;
        }
        a {
          color: #8B5CF6;
          text-decoration: none;
          font-weight: bold;
          margin: 0 10px;
        }
        a:hover {
          text-decoration: underline;
        }
        .seo-badge {
          background: #4CAF50;
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          margin-left: 10px;
        }
        .section {
          margin: 2rem 0;
          padding: 1rem;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          text-align: left;
        }
        .links {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-top: 1rem;
        }
        .btn {
          background: #8B5CF6;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          display: inline-block;
        }
        .btn:hover {
          background: #7C3AED;
        }
        .status {
          color: #4CAF50;
          font-weight: bold;
        }
        .seo-info {
          background: #1a1c2c;
          padding: 1.5rem;
          border-radius: 10px;
          margin: 1.5rem 0;
          border-left: 4px solid #4CAF50;
        }
        .seo-checklist {
          list-style: none;
          padding: 0;
        }
        .seo-checklist li {
          margin: 8px 0;
          padding-left: 24px;
          position: relative;
        }
        .seo-checklist li:before {
          content: "✅";
          position: absolute;
          left: 0;
          color: #4CAF50;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>AnimeBing Server <span class="seo-badge">SEO OPTIMIZED</span></h1>
        <p class="status">✅ Backend API is running correctly - SEO Ready for Google</p>
        <p>📺 Frontend: <a href="https://animebing.in" target="_blank">AnimeBing.in</a></p>
        <p>⚙️ Admin Access: Press Ctrl+Shift+Alt on the frontend</p>
        
        <div class="seo-info">
          <h3>🔍 SEO Features Enabled:</h3>
          <ul class="seo-checklist">
            <li>Dynamic Sitemap: <a href="/sitemap.xml" target="_blank">/sitemap.xml</a></li>
            <li>Robots.txt: <a href="/robots.txt" target="_blank">/robots.txt</a></li>
            <li>RSS Feed: <a href="/rss.xml" target="_blank">/rss.xml</a></li>
            <li>Dynamic URLs with slugs</li>
            <li>Structured Data (JSON-LD)</li>
            <li>Meta Tags on all pages</li>
            <li>Open Graph & Twitter Cards</li>
            <li>Admin SEO Control Panel</li>
          </ul>
        </div>
        
        <div class="section">
          <h3>🚀 Ready for Google Search Console:</h3>
          <p><strong>Steps to submit to Google:</strong></p>
          <ol>
            <li>Go to <a href="https://search.google.com/search-console" target="_blank">Google Search Console</a></li>
            <li>Add property: <code>https://animebing.in</code></li>
            <li>Verify ownership (HTML tag method recommended)</li>
            <li>Submit sitemap: <code>https://animebing.in/sitemap.xml</code></li>
            <li>Wait 24-48 hours for indexing</li>
          </ol>
        </div>
        
        <div class="links">
          <a href="/api/health" class="btn">Health Check</a>
          <a href="/sitemap.xml" class="btn" target="_blank">View Sitemap</a>
          <a href="/robots.txt" class="btn" target="_blank">View Robots.txt</a>
          <a href="/api/anime/featured" class="btn">Check Featured Anime</a>
          <a href="/api/debug/animes" class="btn">Debug Anime</a>
        </div>
        
        <p style="margin-top: 2rem; color: #9CA3AF; font-size: 0.9rem;">
          Server Time: ${new Date().toLocaleString()}<br>
          SEO Status: Complete - Ready for Google Indexing<br>
          Sitemap URLs: ${(() => {
            // Estimate URLs count
            const Anime = require('./models/Anime.cjs');
            Anime.countDocuments({}, (err, count) => {
              if(!err) {
                const totalUrls = count + 20 + 12; // anime + static + search pages
                console.log(`Estimated sitemap URLs: ${totalUrls}`);
              }
            });
            return "Calculating...";
          })()}
        </p>
      </div>
      
      <!-- JSON-LD Structured Data -->
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "AnimeBing",
        "url": "https://animebing.in",
        "description": "Watch anime online for free in Hindi and English. HD quality streaming and downloads.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://animebing.in/?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
      </script>
    </body>
    </html>
  `);
});

// ✅ START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} - SEO OPTIMIZED`);
  console.log(`🔧 Admin: ${process.env.ADMIN_USER} / ${process.env.ADMIN_PASS}`);
  console.log(`🌐 Frontend: https://animebing.in`);
  console.log(`🗺️ Sitemap: https://animebing.in/sitemap.xml`);
  console.log(`🤖 Robots: https://animebing.in/robots.txt`);
  console.log(`📰 RSS Feed: https://animebing.in/rss.xml`);
  console.log(`✅ SEO Features:`);
  console.log(`   - Dynamic sitemap with anime pages`);
  console.log(`   - Robots.txt for search engines`);
  console.log(`   - RSS feed for updates`);
  console.log(`   - Structured data for Google`);
  console.log(`📈 Next Step: Submit sitemap to Google Search Console`);
});