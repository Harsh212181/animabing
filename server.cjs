  // server.cjs — Clean, Fixed, Production-friendly server file
/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// DB connect
const connectDB = require('./db.cjs');

// Models (required lazily where used)
const Analytics = require('./models/Analytics.cjs');

// Middleware & Rate-limiters
const { generalLimiter, authLimiter, adminLimiter, apiLimiter } = require('./middleware/rateLimit.cjs');
const adminAuth = require('./middleware/adminAuth.cjs');

// Routes (ensure these files exist in ./routes)
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

/* ---------------------------
   Basic Middleware
   --------------------------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static public files (frontend build or static assets)
app.use(express.static(path.join(process.cwd(), 'public')));

/* ---------------------------
   Connect Database
   --------------------------- */
connectDB()
  .then(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ MongoDB connected');
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    // do not exit here — keep server running for debug routes if desired
  });

/* ---------------------------
   Rate limiting (apply early)
   --------------------------- */
// Basic API limiter for public endpoints
app.use('/api/', apiLimiter);
// Authentication specific limiter (login)
app.use('/api/admin/login', authLimiter);
// Admin protected area limiter
app.use('/api/admin/protected', adminLimiter);

/* ---------------------------
   Analytics middleware (lightweight)
   - record visits for important endpoints
   --------------------------- */
app.use((req, res, next) => {
  try {
    const trackPaths = [
      '/',
      '/api/anime',
      '/api/anime/featured',
      '/search'
    ];

    // track if request path matches any of the tracked prefixes
    const shouldTrack = trackPaths.some(p => req.path === p || req.path.startsWith(p.replace(/\/$/, '')));
    if (shouldTrack) {
      // call recordVisit asynchronously; do not block response
      try {
        Analytics.recordVisit(req, 0).catch(() => {/* swallow analytics errors */});
      } catch (e) { /* ignore */ }
    }
  } catch (e) {
    // keep alive even if analytics fails
  } finally {
    next();
  }
});

/* ---------------------------
   HELPER: Create or update default admin
   --------------------------- */
const createAdmin = async () => {
  try {
    const Admin = require('./models/Admin.cjs');
    const bcrypt = require('bcryptjs');

    const username = process.env.ADMIN_USER || 'Hellobrother';
    const password = process.env.ADMIN_PASS || 'Anime2121818144';
    const email = process.env.ADMIN_EMAIL || 'admin@animabing.com';

    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 Checking/creating admin user...');
    }

    let admin = await Admin.findOne({ username });
    const hashedPassword = await bcrypt.hash(password, 12);

    if (!admin) {
      admin = await Admin.create({
        username,
        password: hashedPassword,
        email,
        role: 'admin'
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Admin created:', username);
      }
    } else {
      // Ensure password matches expected default (helpful on dev deployments)
      admin.password = hashedPassword;
      await admin.save();
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔁 Admin exists — password updated for consistency');
      }
    }

    // Only reveal credentials in non-production for safety
    if (process.env.NODE_ENV !== 'production') {
      console.log('=================================');
      console.log('🔑 ADMIN LOGIN CREDENTIALS (DEV ONLY):');
      console.log('   Username:', username);
      console.log('   Password:', password);
      console.log('   Admin Panel (frontend): Press Ctrl+Shift+Alt to reveal admin button');
      console.log('=================================');
    }
  } catch (err) {
    console.error('❌ createAdmin error:', err);
  }
};

// Run admin creation in background (non-blocking)
createAdmin().catch(() => { /* ignore errors */ });

/* ---------------------------
   Public & Debug Routes
   --------------------------- */

// Root (simple HTML status page)
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Animabing API</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          body { background:#0a0c1c; color:#fff; font-family: system-ui, sans-serif; }
          a { color:#8B5CF6 }
          .card { background:#111223; padding:16px; border-radius:8px; margin:12px 0; }
        </style>
      </head>
      <body>
        <div style="max-width:880px;margin:48px auto;">
          <h1 style="color:#8B5CF6">Animabing Server</h1>
          <p>Backend API is running.</p>
          <div class="card">
            <h3>Links</h3>
            <ul>
              <li><a href="/api/health">/api/health</a></li>
              <li><a href="/api/anime/featured">/api/anime/featured</a></li>
              <li><a href="/api/ad-slots/active">/api/ad-slots/active</a></li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

/* ---------------------------
   Admin utility & emergency routes
   (use carefully; consider protecting in production)
   --------------------------- */

// Emergency: recreate/clear and create default admin
app.get('/api/admin/emergency-reset', async (req, res) => {
  try {
    const Admin = require('./models/Admin.cjs');
    const bcrypt = require('bcryptjs');

    await Admin.deleteMany({});
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS || 'Anime2121818144', 12);

    const admin = new Admin({
      username: process.env.ADMIN_USER || 'Hellobrother',
      password: hashedPassword,
      email: process.env.ADMIN_EMAIL || 'admin@animabing.com',
      role: 'superadmin'
    });
    await admin.save();

    res.json({
      success: true,
      message: 'Emergency admin created (check logs or developer for credentials in dev environment).'
    });
  } catch (err) {
    console.error('emergency-reset error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin debug info (safe for dev — restrict in prod)
app.get('/api/admin/debug', async (req, res) => {
  try {
    const Admin = require('./models/Admin.cjs');
    const adminCount = await Admin.countDocuments();
    const admins = await Admin.find().select('username email createdAt role');

    res.json({
      success: true,
      totalAdmins: adminCount,
      admins,
      serverTime: new Date().toISOString(),
      nodeVersion: process.version,
      env: process.env.NODE_ENV || 'development'
    });
  } catch (err) {
    console.error('admin debug error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin create-default-admin (safe utility)
app.get('/api/admin/create-default-admin', async (req, res) => {
  try {
    const Admin = require('./models/Admin.cjs');
    const bcrypt = require('bcryptjs');

    await Admin.deleteMany({ username: process.env.ADMIN_USER || 'Hellobrother' });

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS || 'Anime2121818144', 12);
    const admin = new Admin({
      username: process.env.ADMIN_USER || 'Hellobrother',
      password: hashedPassword,
      email: process.env.ADMIN_EMAIL || 'admin@animabing.com',
      role: 'admin'
    });
    await admin.save();

    res.json({
      success: true,
      message: 'Default admin created.'
    });
  } catch (err) {
    console.error('create-default-admin error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------------------
   Admin login (public) — returns JWT
   --------------------------- */
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }

    const Admin = require('./models/Admin.cjs');
    const bcrypt = require('bcryptjs');

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({
      id: admin._id,
      username: admin.username,
      role: admin.role
    }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '24h' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      username: admin.username,
      role: admin.role
    });
  } catch (err) {
    console.error('admin login error:', err);
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
});

/* ---------------------------
   Protected admin-only endpoints
   (prefix /api/admin/protected - adminAuth middleware applied below)
   --------------------------- */

// Example: track ad click (protected)
app.post('/api/admin/protected/track-ad-click', adminAuth, async (req, res) => {
  try {
    const { slotId, earnings } = req.body;
    const AdSlot = require('./models/AdSlot.cjs');
    const AnalyticsModel = require('./models/Analytics.cjs');

    const updated = await AdSlot.findByIdAndUpdate(
      slotId,
      { $inc: { clicks: 1, earnings: earnings || 0.5 } },
      { new: true }
    );

    // record earnings in analytics (best-effort)
    try { await AnalyticsModel.recordVisit(req, earnings || 0.5); } catch (e) { /* ignore */ }

    res.json({ success: true, message: 'Ad click tracked', adSlot: updated });
  } catch (err) {
    console.error('track-ad-click error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------------------
   Episodes route (public)
   --------------------------- */
app.get('/api/episodes/:animeId', async (req, res) => {
  try {
    const { animeId } = req.params;
    const Episode = require('./models/Episode.cjs');

    const episodes = await Episode.find({ animeId }).sort({ session: 1, episodeNumber: 1 }).lean();
    res.json(episodes);
  } catch (err) {
    console.error('episodes fetch error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------------------
   Public active ad slots API
   --------------------------- */
app.get('/api/ad-slots/active', async (req, res) => {
  try {
    const AdSlot = require('./models/AdSlot.cjs');
    const activeAdSlots = await AdSlot.find({ isActive: true }).sort({ position: 1 }).lean();
    res.json(activeAdSlots || []);
  } catch (err) {
    console.error('active ad slots error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------------------
   Public APIs (mounted)
   --------------------------- */
app.use('/api/anime', animeRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/app-downloads', appDownloadRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/admin', adminRoutes); // admin routes (some may be protected further)
app.use('/api', contactRoutes);

/* ---------------------------
   Debug routes (safe for development)
   --------------------------- */
app.get('/api/debug/episodes', async (req, res) => {
  try {
    const Episode = require('./models/Episode.cjs');
    const allEpisodes = await Episode.find().populate('animeId', 'title').lean();
    res.json({ totalEpisodes: allEpisodes.length, episodes: allEpisodes });
  } catch (err) {
    console.error('debug episodes error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/debug/anime/:animeId', async (req, res) => {
  try {
    const Anime = require('./models/Anime.cjs');
    const Episode = require('./models/Episode.cjs');
    const animeId = req.params.animeId;
    const anime = await Anime.findById(animeId).lean();
    const episodes = await Episode.find({ animeId }).lean();
    res.json({ anime, episodes, episodesCount: episodes.length });
  } catch (err) {
    console.error('debug anime error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/debug/animes', async (req, res) => {
  try {
    const Anime = require('./models/Anime.cjs');
    const animes = await Anime.find().select('title _id contentType').lean();
    res.json({ totalAnimes: animes.length, animes });
  } catch (err) {
    console.error('debug animes error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/debug/ad-slots', async (req, res) => {
  try {
    const AdSlot = require('./models/AdSlot.cjs');
    const adSlots = await AdSlot.find().lean();
    res.json({ success: true, totalSlots: adSlots.length, adSlots });
  } catch (err) {
    console.error('debug ad slots error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------------------
   Emergency: set all anime as featured
   --------------------------- */
app.get('/api/emergency/set-all-featured', async (req, res) => {
  try {
    const Anime = require('./models/Anime.cjs');

    const result = await Anime.updateMany({}, { $set: { featured: true, featuredOrder: 1 } });
    const sample = await Anime.find({ featured: true }).select('title featuredOrder').limit(10).lean();

    res.json({
      success: true,
      modifiedCount: result.modifiedCount || result.nModified || 0,
      sampleFeatured: sample
    });
  } catch (err) {
    console.error('emergency set-all-featured error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------------------
   Start server
   --------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔗 Local frontend: http://localhost:5173`);
  }
  console.log(`📢 Public API base (if deployed): ${process.env.PUBLIC_API_BASE || 'https://animabing.onrender.com/api'}`);
});

module.exports = app;
