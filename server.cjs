 // server.cjs - COMPLETE FIXED VERSION WITH ADMIN LOGIN FIX
const express = require('express');
const cors = require('cors');
const connectDB = require('./db.cjs');
require('dotenv').config();

const Analytics = require('./models/Analytics.cjs');
const { generalLimiter, authLimiter, adminLimiter, apiLimiter } = require('./middleware/rateLimit.cjs');

// ✅ IMPORT MIDDLEWARE AND ROUTES - MOVE TO TOP
const adminAuth = require('./middleware/adminAuth.cjs');
const animeRoutes = require('./routes/animeRoutes.cjs');
const episodeRoutes = require('./routes/episodeRoutes.cjs');
const chapterRoutes = require('./routes/chapterRoutes.cjs');
const reportRoutes = require('./routes/reportRoutes.cjs');
const socialRoutes = require('./routes/socialRoutes.cjs');
const appDownloadRoutes = require('./routes/appDownloadRoutes.cjs');
const adRoutes = require('./routes/adRoutes.cjs');
const adminRoutes = require('./routes/adminRoutes.cjs');
const contactRoutes = require('./routes/contactRoutes.cjs');

const app = express();

// ✅ CORS CONFIGURATION FIXED FOR CLOUDFLARE PAGES
const allowedOrigins = [
  'https://animabing.pages.dev',
  'https://animabing.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Allow any origin in development, restrict in production
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        console.log('❌ CORS Blocked Origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ PREFLIGHT REQUESTS HANDLE करें
app.options('*', cors());

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
    
    console.log('\n🔄 Checking admin user...');
    
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
    console.log('   Frontend URL: https://animabing.pages.dev');
    console.log('   Admin Login: https://animabing.pages.dev/admin/login');
    console.log('   API Base: https://animabing.onrender.com/api');
    console.log('=================================\n');
    
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

// ✅ FIXED ADMIN LOGIN ROUTE WITH BETTER ERROR HANDLING
app.post('/api/admin/login', async (req, res) => {
  try {
    console.log('\n🔐 ========== LOGIN ATTEMPT ==========');
    console.log('Time:', new Date().toISOString());
    console.log('Client IP:', req.ip);
    console.log('User Agent:', req.headers['user-agent']);
    
    const { username, password } = req.body;
    
    // Log request details (without password for security)
    console.log('Login attempt for username:', username);
    
    // Input validation
    if (!username || !password) {
      console.log('❌ Missing username or password');
      return res.status(400).json({ 
        success: false,
        error: 'Username and password required' 
      });
    }

    const Admin = require('./models/Admin.cjs');
    const bcrypt = require('bcryptjs');
    
    // Find admin
    console.log('🔍 Looking for admin in database...');
    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log('❌ Admin not found in database:', username);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid username or password' 
      });
    }

    console.log('✅ Admin found:', admin.username);
    console.log('🔑 Comparing passwords...');
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password does not match');
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
      { expiresIn: '7d' } // 7 days expiry
    );

    console.log('🎉 LOGIN SUCCESSFUL!');
    console.log('Generated token for user:', admin.username);
    console.log('Token expiry: 7 days');
    console.log('=================================\n');
    
    res.json({ 
      success: true, 
      message: 'Login successful', 
      token, 
      username: admin.username,
      role: admin.role,
      expiresIn: '7d'
    });
    
  } catch (err) {
    console.error('❌ Login error:', err);
    console.error('Error stack:', err.stack);
    
    res.status(500).json({ 
      success: false,
      error: 'Server error during login',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ✅ ADD ADMIN AUTH CHECK ROUTE
app.get('/api/admin/check-auth', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        isAuthenticated: false,
        error: 'No token provided'
      });
    }

    const jwt = require('jsonwebtoken');
    const Admin = require('./models/Admin.cjs');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        isAuthenticated: false,
        error: 'Admin not found'
      });
    }

    res.json({
      success: true,
      isAuthenticated: true,
      username: admin.username,
      role: admin.role,
      expiresAt: decoded.exp
    });
  } catch (error) {
    console.error('Auth check error:', error.message);
    res.status(401).json({ 
      success: false, 
      isAuthenticated: false,
      error: 'Invalid or expired token'
    });
  }
});

// ✅ AD CLICK TRACKING ROUTE
app.post('/api/admin/protected/track-ad-click', adminAuth, async (req, res) => {
  try {
    const { slotId, earnings } = req.body;
    
    const AdSlot = require('./models/AdSlot.cjs');
    const Analytics = require('./models/Analytics.cjs');
    
    const updatedSlot = await AdSlot.findByIdAndUpdate(
      slotId,
      {
        $inc: {
          clicks: 1,
          earnings: earnings || 0.5
        }
      },
      { new: true }
    );

    await Analytics.recordVisit(req, earnings || 0.5);

    res.json({
      success: true,
      message: 'Ad click tracked',
      adSlot: updatedSlot
    });
  } catch (error) {
    console.error('Ad tracking error:', error);
    res.status(500).json({ error: 'Failed to track ad click' });
  }
});

// ✅ Social media API
app.get('/api/social', async (req, res) => {
  try {
    const SocialMedia = require('./models/SocialMedia.cjs');
    const socialLinks = await SocialMedia.find({ isActive: true });
    res.json(socialLinks);
  } catch (error) {
    console.error('Social media API error:', error);
    res.json([
      {
        platform: 'facebook',
        url: 'https://facebook.com/animabing',
        isActive: true,
        icon: 'facebook',
        displayName: 'Facebook'
      },
      {
        platform: 'instagram', 
        url: 'https://instagram.com/animabing',
        isActive: true,
        icon: 'instagram',
        displayName: 'Instagram'
      },
      {
        platform: 'telegram',
        url: 'https://t.me/animabing', 
        isActive: true,
        icon: 'telegram',
        displayName: 'Telegram'
      }
    ]);
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
// ✅ ADDED: PUBLIC ACTIVE AD SLOTS API ROUTE
// ============================================
app.get('/api/ad-slots/active', async (req, res) => {
  try {
    console.log('📢 Fetching active ad slots...');
    
    const AdSlot = require('./models/AdSlot.cjs');
    const activeAdSlots = await AdSlot.find({ isActive: true }).sort({ position: 1 });
    
    console.log(`✅ Found ${activeAdSlots.length} active ad slots`);
    
    // If no active slots, return empty array (not error)
    res.json(activeAdSlots);
    
  } catch (error) {
    console.error('❌ Error fetching active ad slots:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ============================================
// ✅ PROTECTED ADMIN ROUTES
// ============================================
app.use('/api/admin/protected', adminAuth, adminRoutes);

// ============================================
// ✅ PUBLIC ROUTES
// ============================================
app.use('/api/anime', animeRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/app-downloads', appDownloadRoutes);
app.use('/api/ads', adRoutes);
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

// ✅ DEBUG AD SLOTS ROUTE
app.get('/api/debug/ad-slots', async (req, res) => {
  try {
    const AdSlot = require('./models/AdSlot.cjs');
    
    const adSlots = await AdSlot.find();
    
    console.log('📢 DEBUG AD SLOTS:');
    console.log(`Total ad slots: ${adSlots.length}`);
    
    adSlots.forEach(slot => {
      console.log(`- ${slot.name} (${slot.position}): Active=${slot.isActive}, Impressions=${slot.impressions}, Clicks=${slot.clicks}, Earnings=₹${slot.earnings}`);
    });
    
    res.json({
      success: true,
      totalSlots: adSlots.length,
      adSlots: adSlots
    });
  } catch (error) {
    console.error('❌ Debug ad slots error:', error);
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
    message: 'Animabing Server Running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    adminAvailable: true,
    loginEndpoint: '/api/admin/login'
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

// ============================================
// ✅ ROOT ROUTE
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
          padding: 20px;
        }
        .container {
          text-align: center;
          padding: 2rem;
          max-width: 800px;
          width: 100%;
        }
        h1 {
          color: #8B5CF6;
          margin-bottom: 1rem;
          font-size: 2.5rem;
        }
        h2 {
          color: #7C3AED;
          margin-top: 2rem;
        }
        a {
          color: #8B5CF6;
          text-decoration: none;
          font-weight: bold;
          margin: 0 10px;
          padding: 8px 16px;
          border-radius: 6px;
          background: rgba(139, 92, 246, 0.1);
          transition: all 0.3s;
          display: inline-block;
          margin: 5px;
        }
        a:hover {
          text-decoration: underline;
          background: rgba(139, 92, 246, 0.2);
          transform: translateY(-2px);
        }
        .emergency-info {
          background: #1a1c2c;
          padding: 1.5rem;
          border-radius: 12px;
          margin: 1.5rem 0;
          text-align: left;
          border-left: 4px solid #EF4444;
        }
        .admin-info {
          background: rgba(139, 92, 246, 0.1);
          padding: 1.5rem;
          border-radius: 12px;
          margin: 1.5rem 0;
          text-align: left;
          border-left: 4px solid #8B5CF6;
        }
        .ad-info {
          background: #2a1c4c;
          padding: 1.5rem;
          border-radius: 12px;
          margin: 1.5rem 0;
          text-align: left;
          border-left: 4px solid #10B981;
        }
        .credentials {
          background: #1a1c2c;
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
          font-family: monospace;
        }
        .success {
          color: #10B981;
        }
        .warning {
          color: #F59E0B;
        }
        .error {
          color: #EF4444;
        }
        .section {
          margin: 2rem 0;
        }
        code {
          background: rgba(0,0,0,0.3);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Animabing Server</h1>
        <p class="success">✅ Backend API is running correctly</p>
        
        <div class="admin-info">
          <h2>🔧 Admin Access</h2>
          <p><strong>Frontend Admin Panel:</strong> <a href="https://animabing.pages.dev/admin/login" target="_blank">Go to Admin Login</a></p>
          
          <div class="credentials">
            <p><strong>Default Admin Credentials:</strong></p>
            <p>Username: <code>Hellobrother</code></p>
            <p>Password: <code>Anime2121818144</code></p>
          </div>
          
          <p><a href="/api/admin/debug" target="_blank">Check Admin Status</a></p>
          <p><a href="/api/admin/login" target="_blank">Test Login API</a></p>
        </div>
        
        <div class="section">
          <h2>📊 API Endpoints</h2>
          <p><a href="/api/health" target="_blank">Health Check</a></p>
          <p><a href="/api/anime" target="_blank">All Anime</a></p>
          <p><a href="/api/anime/featured" target="_blank">Featured Anime</a></p>
          <p><a href="/api/social" target="_blank">Social Media Links</a></p>
        </div>
        
        <div class="ad-info">
          <h3>📢 Ad Management:</h3>
          <p>Active Ad Slots: <a href="/api/ad-slots/active" target="_blank">Check Active Ads</a></p>
          <p>All Ad Slots: <a href="/api/debug/ad-slots" target="_blank">Debug Ad Slots</a></p>
          <p>Ad Analytics: <a href="/api/admin/protected/ad-analytics" target="_blank">View Analytics</a> (Admin Only)</p>
        </div>
        
        <div class="emergency-info">
          <h3>🚨 Emergency Fixes:</h3>
          <p class="warning">Use these only if admin login is not working:</p>
          <p><a href="/api/admin/emergency-reset" target="_blank">Emergency Admin Reset</a> - Creates new admin</p>
          <p><a href="/api/admin/create-default-admin" target="_blank">Create Default Admin</a> - Creates default admin user</p>
          <p><a href="/api/emergency/set-all-featured" target="_blank">Set All Anime as Featured</a> - Fix homepage</p>
        </div>
        
        <div class="section">
          <p><strong>🌐 Frontend:</strong> <a href="https://animabing.pages.dev" target="_blank">https://animabing.pages.dev</a></p>
          <p><strong>🔗 API Base:</strong> <a href="/api" target="_blank">https://animabing.onrender.com/api</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// ✅ START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ============================================
  🚀 Animabing Server Started Successfully!
  ============================================
  Port: ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  Frontend: https://animabing.pages.dev
  Admin Login: https://animabing.pages.dev/admin/login
  API Base: https://animabing.onrender.com/api
  
  🔧 Admin Credentials:
  Username: ${process.env.ADMIN_USER || 'Hellobrother'}
  Password: ${process.env.ADMIN_PASS || 'Anime2121818144'}
  
  📊 Debug Endpoints:
  Health Check: https://animabing.onrender.com/api/health
  Admin Debug: https://animabing.onrender.com/api/admin/debug
  Active Ads: https://animabing.onrender.com/api/ad-slots/active
  
  🚨 Emergency Routes:
  Admin Reset: https://animabing.onrender.com/api/admin/emergency-reset
  Set Featured: https://animabing.onrender.com/api/emergency/set-all-featured
  ============================================
  `);
});
