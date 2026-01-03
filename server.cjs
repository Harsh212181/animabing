  // server.cjs - AD-FREE VERSION WITH SOCIAL MEDIA FIX
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

// ✅ HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Animabing Server Running - AD FREE VERSION',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    socialMedia: 'Fixed - Only Facebook, Instagram, Telegram'
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
// ✅ ROOT ROUTE - AD-FREE VERSION WITH SOCIAL FIX
// ============================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Animabing - Anime & Movies</title>
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
        .emergency-info {
          background: #1a1c2c;
          padding: 1.5rem;
          border-radius: 10px;
          margin: 1.5rem 0;
          text-align: left;
          border-left: 4px solid #8B5CF6;
        }
        .ad-free-badge {
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
        .fix-btn {
          background: #EF4444;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 16px;
          margin-top: 10px;
          display: inline-block;
        }
        .fix-btn:hover {
          background: #DC2626;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Animabing Server <span class="ad-free-badge">AD-FREE</span></h1>
        <p class="status">✅ Backend API is running correctly - Social Media Fixed</p>
        <p>📺 Frontend: <a href="https://rainbow-sfogliatella-b724c0.netlify.app" target="_blank">Netlify</a></p>
        <p>⚙️ Admin Access: Press Ctrl+Shift+Alt on the frontend</p>
        
        <div class="section">
          <h3>🔗 Social Media Status: <span class="status">FIXED</span></h3>
          <p>Social media links are now working correctly (Facebook, Instagram, Telegram only)</p>
          <div class="links">
            <a href="/api/social" class="btn" target="_blank">Check Social Links</a>
            <a href="/api/debug/social" class="btn" target="_blank">Debug Social Links</a>
            <a href="/api/emergency/reset-social" class="btn" target="_blank">Reset to Defaults</a>
          </div>
        </div>
        
        <div class="emergency-info">
          <h3>🚨 IMMEDIATE FIX FOR SOCIAL MEDIA LINKS:</h3>
          <p><strong>Click below to fix ALL social media links instantly:</strong></p>
          <p><a href="/api/emergency/fix-social-urls" class="fix-btn" target="_blank">CLICK HERE TO FIX SOCIAL LINKS</a></p>
          <p>This will set:</p>
          <ul>
            <li>Instagram: https://instagram.com/animebingofficial</li>
            <li>Telegram: https://t.me/animebingofficial (typo fixed)</li>
            <li>Facebook: https://facebook.com/animebingofficial</li>
          </ul>
        </div>
        
        <div class="emergency-info">
          <h3>🔧 Other Emergency Fixes:</h3>
          <p><strong>Featured Anime Fix:</strong> <a href="/api/emergency/set-all-featured" target="_blank">Set All Anime as Featured</a></p>
          <p><strong>Admin Reset:</strong> <a href="/api/admin/emergency-reset" target="_blank">Emergency Admin Reset</a></p>
          <p><strong>Debug Info:</strong> <a href="/api/debug/animes" target="_blank">View All Anime</a></p>
        </div>
        
        <div class="links">
          <a href="/api/health">Health Check</a>
          <a href="/api/anime/featured">Check Featured</a>
          <a href="/api/social">Social Links</a>
          <a href="/api/debug/animes">Debug Anime</a>
        </div>
        
        <p style="margin-top: 2rem; color: #9CA3AF; font-size: 0.9rem;">
          Server Time: ${new Date().toLocaleString()}<br>
          Social Media: Facebook, Instagram, Telegram only
        </p>
      </div>
    </body>
    </html>
  `);
});

// ✅ START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} - AD FREE VERSION`);
  console.log(`🔧 Admin: ${process.env.ADMIN_USER} / ${process.env.ADMIN_PASS}`);
  console.log(`🌐 Frontend: https://animabing.pages.dev`);
  console.log(`🔗 API: https://animabing.onrender.com/api`);
  console.log(`✅ Social Media Routes: Fixed and Working`);
  console.log(`📱 Platforms: Facebook, Instagram, Telegram only`);
  console.log(`🚨 EMERGENCY FIX ROUTE: /api/emergency/fix-social-urls`);
  console.log(`🆕 Other Emergency Routes:`);
  console.log(`   - /api/emergency/reset-social (Reset social links)`);
  console.log(`   - /api/emergency/set-all-featured (Fix featured anime)`);
  console.log(`   - /api/admin/emergency-reset (Reset admin)`);
});
