  // routes/adminRoutes.cjs - COMPLETE FIXED VERSION WITH ALL AD ROUTES
const express = require('express');
const router = express.Router();
const Anime = require('../models/Anime.cjs');
const Episode = require('../models/Episode.cjs'); // ✅ Changed to Episod.cjs
const Chapter = require('../models/Chapter.cjs');
const Report = require('../models/Report.cjs');
const SocialMedia = require('../models/SocialMedia.cjs');
const AdSlot = require('../models/AdSlot.cjs');
const Analytics = require('../models/Analytics.cjs');

// ✅ GET filtered anime list with content type
router.get('/anime-list', async (req, res) => {
  try {
    const { status, contentType } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (contentType && contentType !== 'All') query.contentType = contentType;
    
    const animes = await Anime.find(query).populate('episodes').sort({ createdAt: -1 });
    res.json(animes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ADD anime/movie
router.post('/add-anime', async (req, res) => {
  try {
    const { title, description, thumbnail, status, subDubStatus, genreList, releaseYear, contentType } = req.body;
    
    const existing = await Anime.findOne({ title });
    if (existing) return res.status(400).json({ error: 'Anime/Movie already exists' });

    const anime = new Anime({ 
      title, 
      description, 
      thumbnail, 
      status: status || 'Ongoing',
      subDubStatus, 
      genreList, 
      releaseYear,
      contentType: contentType || 'Anime'
    });
    
    await anime.save();
    res.json({ success: true, message: `${contentType || 'Anime'} added!`, anime });
  } catch (err) {
    console.error('Add anime error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ EDIT anime/movie
router.put('/edit-anime/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const anime = await Anime.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!anime) return res.status(404).json({ error: 'Anime/Movie not found' });
    
    res.json({ success: true, message: 'Updated successfully!', anime });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE anime/movie
router.delete('/delete-anime', async (req, res) => {
  try {
    const { id } = req.body;
    await Anime.findByIdAndDelete(id);
    // Also delete associated episodes and reports
    await Episode.deleteMany({ animeId: id });
    await Report.deleteMany({ animeId: id });
    res.json({ success: true, message: 'Deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ EPISODE MANAGEMENT ROUTES (UPDATED FOR MULTIPLE DOWNLOAD LINKS)

// Edit episode (UPDATED FOR MULTIPLE DOWNLOAD LINKS)
router.put('/edit-episode/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, downloadLinks, secureFileReference, session } = req.body;

    console.log('📝 Edit episode request:', {
      id,
      hasDownloadLinks: !!downloadLinks,
      downloadLinksCount: downloadLinks ? downloadLinks.length : 0
    });

    // ✅ Validate downloadLinks if provided
    if (downloadLinks !== undefined) {
      if (!Array.isArray(downloadLinks) || downloadLinks.length === 0) {
        return res.status(400).json({ error: 'At least one download link is required' });
      }

      if (downloadLinks.length > 5) {
        return res.status(400).json({ error: 'Maximum 5 download links allowed' });
      }

      // Validate each download link
      for (let i = 0; i < downloadLinks.length; i++) {
        const link = downloadLinks[i];
        if (!link.name || !link.url) {
          return res.status(400).json({ 
            error: `Download link ${i + 1} must have both name and url` 
          });
        }
      }
    }

    const updateData = {};
    if (typeof title !== 'undefined') updateData.title = title;
    if (typeof secureFileReference !== 'undefined') updateData.secureFileReference = secureFileReference;
    if (typeof session !== 'undefined') updateData.session = session;
    
    // ✅ Handle downloadLinks update
    if (downloadLinks !== undefined) {
      updateData.downloadLinks = downloadLinks.map((link, index) => ({
        name: link.name || `Download Link ${index + 1}`,
        url: link.url,
        quality: link.quality || '',
        type: link.type || 'direct'
      }));
    }

    const episode = await Episode.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!episode) return res.status(404).json({ error: 'Episode not found' });

    // ✅ Update anime's lastContentAdded for homepage priority
    await Anime.updateLastContent(episode.animeId);

    res.json({ 
      success: true, 
      message: 'Episode updated successfully!', 
      episode 
    });
  } catch (err) {
    console.error('Edit episode error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// ✅ NEW ROUTE: Edit chapter (FOR MULTIPLE DOWNLOAD LINKS)
router.put('/edit-chapter/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, downloadLinks, secureFileReference, session } = req.body;

    console.log('📝 Edit chapter request:', {
      id,
      hasDownloadLinks: !!downloadLinks,
      downloadLinksCount: downloadLinks ? downloadLinks.length : 0
    });

    // ✅ Validate downloadLinks if provided
    if (downloadLinks !== undefined) {
      if (!Array.isArray(downloadLinks) || downloadLinks.length === 0) {
        return res.status(400).json({ error: 'At least one download link is required' });
      }

      if (downloadLinks.length > 5) {
        return res.status(400).json({ error: 'Maximum 5 download links allowed' });
      }

      // Validate each download link
      for (let i = 0; i < downloadLinks.length; i++) {
        const link = downloadLinks[i];
        if (!link.name || !link.url) {
          return res.status(400).json({ 
            error: `Download link ${i + 1} must have both name and url` 
          });
        }
      }
    }

    const updateData = {};
    if (typeof title !== 'undefined') updateData.title = title;
    if (typeof secureFileReference !== 'undefined') updateData.secureFileReference = secureFileReference;
    if (typeof session !== 'undefined') updateData.session = session;
    
    // ✅ Handle downloadLinks update
    if (downloadLinks !== undefined) {
      updateData.downloadLinks = downloadLinks.map((link, index) => ({
        name: link.name || `Download Link ${index + 1}`,
        url: link.url,
        quality: link.quality || '',
        type: link.type || 'direct'
      }));
    }

    const chapter = await Chapter.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

    // ✅ Update manga's lastContentAdded for homepage priority
    await Anime.updateLastContent(chapter.mangaId);

    res.json({ 
      success: true, 
      message: 'Chapter updated successfully!', 
      chapter 
    });
  } catch (err) {
    console.error('Edit chapter error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// ✅ REPORT MANAGEMENT ROUTES

// Get all reports
router.get('/reports', async (req, res) => {
  try {
    console.log('📋 Admin fetching reports...');
    
    const reports = await Report.find()
      .populate('animeId', 'title thumbnail')
      .populate('resolvedBy', 'username')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${reports.length} reports for admin`);
    
    res.json(reports);
  } catch (err) {
    console.error('❌ Admin reports error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update report status with response - FIXED VERSION
router.put('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const updateData = {
      status,
      ...(adminResponse && {
        adminResponse,
        responseDate: new Date()
      })
    };

    // ✅ FIXED: Server automatically sets resolvedBy from admin token
    if (status === 'Fixed') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = req.admin.id;
    }

    const report = await Report.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('resolvedBy', 'username');

    res.json({ 
      success: true, 
      message: 'Report updated successfully!', 
      report 
    });
  } catch (err) {
    console.error('Report update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE single report
router.delete('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting report with ID:', id);

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await Report.findByIdAndDelete(id);
    
    console.log('✅ Report deleted successfully');
    res.json({ 
      success: true, 
      message: 'Report deleted successfully!' 
    });
  } catch (err) {
    console.error('❌ Delete report error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ BULK DELETE reports
router.post('/reports/bulk-delete', async (req, res) => {
  try {
    const { reportIds } = req.body;
    await Report.deleteMany({ _id: { $in: reportIds } });
    res.json({ 
      success: true, 
      message: `${reportIds.length} reports deleted successfully!` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ SOCIAL MEDIA MANAGEMENT ROUTES

// Get social media links
router.get('/social-media', async (req, res) => {
  try {
    const socialLinks = await SocialMedia.find();
    res.json(socialLinks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update social media link
router.put('/social-media/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { url, isActive } = req.body;
    
    const socialLink = await SocialMedia.findOneAndUpdate(
      { platform },
      { url, isActive },
      { new: true, upsert: true }
    );
    
    res.json(socialLink);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ✅ COMPLETE AD MANAGEMENT ROUTES (UPDATED)
// ============================================

// GET all ad slots
router.get('/ad-slots', async (req, res) => {
  try {
    console.log('📢 Fetching ad slots for admin...');
    
    const adSlots = await AdSlot.find().sort({ position: 1 });
    
    // If no ad slots exist, create default ones
    if (adSlots.length === 0) {
      console.log('🆕 No ad slots found, creating default slots...');
      await AdSlot.initDefaultSlots();
      const newAdSlots = await AdSlot.find().sort({ position: 1 });
      return res.json(newAdSlots);
    }
    
    console.log(`✅ Found ${adSlots.length} ad slots`);
    res.json(adSlots);
  } catch (error) {
    console.error('❌ Error fetching ad slots:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// UPDATE ad slot
router.put('/ad-slots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adCode, isActive, name } = req.body;
    
    console.log(`📢 Updating ad slot ${id}`, { 
      hasAdCode: !!adCode, 
      isActive,
      name 
    });
    
    const updateData = {};
    if (adCode !== undefined) updateData.adCode = adCode;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (name !== undefined) updateData.name = name;
    
    const adSlot = await AdSlot.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!adSlot) {
      return res.status(404).json({ 
        success: false,
        error: 'Ad slot not found' 
      });
    }
    
    console.log(`✅ Ad slot updated: ${adSlot.name} (Active: ${adSlot.isActive})`);
    
    res.json({
      success: true,
      message: 'Ad slot updated successfully!',
      adSlot
    });
  } catch (error) {
    console.error('❌ Error updating ad slot:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// TRACK ad click
router.post('/track-ad-click', async (req, res) => {
  try {
    const { slotId, earnings = 0.5 } = req.body;
    
    console.log(`🎯 Tracking ad click for slot: ${slotId}`);
    
    // Update ad slot stats
    const adSlot = await AdSlot.findByIdAndUpdate(
      slotId,
      {
        $inc: {
          clicks: 1,
          earnings: earnings,
          impressions: 1
        }
      },
      { new: true }
    );
    
    if (!adSlot) {
      return res.status(404).json({
        success: false,
        error: 'Ad slot not found'
      });
    }
    
    // Record in analytics
    await Analytics.recordVisit(req, earnings);
    
    res.json({
      success: true,
      message: 'Ad click tracked successfully!',
      adSlot,
      earningsAdded: earnings
    });
  } catch (error) {
    console.error('❌ Error tracking ad click:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET ad analytics
router.get('/ad-analytics', async (req, res) => {
  try {
    const { range = 'today' } = req.query;
    
    console.log(`📊 Fetching ad analytics for range: ${range}`);
    
    // Get all ad slots data
    const adSlots = await AdSlot.find();
    
    // Calculate totals
    const totalImpressions = adSlots.reduce((sum, slot) => sum + (slot.impressions || 0), 0);
    const totalClicks = adSlots.reduce((sum, slot) => sum + (slot.clicks || 0), 0);
    const totalEarnings = adSlots.reduce((sum, slot) => sum + (slot.earnings || 0), 0);
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
    
    // Get active ads count
    const activeAds = adSlots.filter(slot => slot.isActive).length;
    
    res.json({
      success: true,
      adPerformance: {
        totalImpressions,
        totalClicks,
        totalRevenue: totalEarnings,
        ctr: parseFloat(ctr),
        activeAds
      },
      adSlots: adSlots.map(slot => ({
        id: slot._id,
        name: slot.name,
        position: slot.position,
        isActive: slot.isActive,
        earnings: slot.earnings || 0,
        clicks: slot.clicks || 0,
        impressions: slot.impressions || 0,
        ctr: slot.impressions > 0 ? ((slot.clicks / slot.impressions) * 100).toFixed(2) : 0
      })),
      topPerformingSlots: adSlots
        .filter(slot => slot.earnings > 0)
        .sort((a, b) => (b.earnings || 0) - (a.earnings || 0))
        .slice(0, 3)
        .map(slot => ({
          name: slot.name,
          position: slot.position,
          earnings: slot.earnings || 0,
          clicks: slot.clicks || 0,
          ctr: slot.impressions > 0 ? ((slot.clicks / slot.impressions) * 100).toFixed(2) : 0
        }))
    });
    
  } catch (error) {
    console.error('❌ Error fetching ad analytics:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// INCREMENT ad impressions
router.post('/increment-impression/:slotId', async (req, res) => {
  try {
    const { slotId } = req.params;
    
    const adSlot = await AdSlot.findByIdAndUpdate(
      slotId,
      { $inc: { impressions: 1 } },
      { new: true }
    );
    
    if (!adSlot) {
      return res.status(404).json({
        success: false,
        error: 'Ad slot not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Impression incremented',
      impressions: adSlot.impressions
    });
  } catch (error) {
    console.error('❌ Error incrementing impression:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ✅ EXISTING ANALYTICS ROUTE (keep as is)
router.get('/analytics', async (req, res) => {
  try {
    const totalAnimes = await Anime.countDocuments({ contentType: 'Anime' });
    const totalMovies = await Anime.countDocuments({ contentType: 'Movie' });
    const totalManga = await Anime.countDocuments({ contentType: 'Manga' });
    const totalEpisodes = await Episode.countDocuments();
    const totalChapters = await Chapter.countDocuments();
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'Pending' });

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStats = await Analytics.findOne({ 
      date: { 
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Aggregation for all-time stats
    let allTimeStats;
    try {
      allTimeStats = await Analytics.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: '$uniqueVisitors' },
            totalPageViews: { $sum: '$pageViews' },
            totalEarnings: { $sum: '$earnings' }
          }
        }
      ]);
    } catch (aggError) {
      console.log('Using fallback for analytics aggregation');
      allTimeStats = [];
    }

    const totals = allTimeStats.length > 0 ? allTimeStats[0] : {
      totalUsers: 0,
      totalPageViews: 0,
      totalEarnings: 0
    };

    // Get ad performance data
    const adSlots = await AdSlot.find();
    const totalAdImpressions = adSlots.reduce((sum, slot) => sum + (slot.impressions || 0), 0);
    const totalAdClicks = adSlots.reduce((sum, slot) => sum + (slot.clicks || 0), 0);
    const totalAdRevenue = adSlots.reduce((sum, slot) => sum + (slot.earnings || 0), 0);
    const adCtr = totalAdImpressions > 0 ? (totalAdClicks / totalAdImpressions * 100).toFixed(2) : 0;

    res.json({
      totalAnimes,
      totalMovies,
      totalManga,
      totalEpisodes,
      totalChapters,
      totalReports,
      pendingReports,
      todayUsers: todayStats ? todayStats.uniqueVisitors : 0,
      totalUsers: totals.totalUsers || 0,
      todayEarnings: todayStats ? todayStats.earnings : 0,
      totalEarnings: totals.totalEarnings || 0,
      todayPageViews: todayStats ? todayStats.pageViews : 0,
      totalPageViews: totals.totalPageViews || 0,
      adPerformance: {
        totalImpressions: totalAdImpressions,
        totalClicks: totalAdClicks,
        totalRevenue: totalAdRevenue,
        ctr: parseFloat(adCtr)
      },
      weeklyStats: [],
      deviceStats: { desktop: 60, mobile: 35, tablet: 5 },
      browserStats: { Chrome: 70, Firefox: 15, Safari: 10, Edge: 4, Unknown: 1 }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// ✅ GET user info
router.get('/user-info', async (req, res) => {
  try {
    const Admin = require('../models/Admin.cjs');
    const admin = await Admin.findById(req.admin.id);
    res.json({
      username: admin.username,
      email: admin.email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ NEW ROUTE: Get episode details for editing (including download links)
router.get('/episode/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const episode = await Episode.findById(id);
    
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }
    
    res.json({
      success: true,
      episode: {
        _id: episode._id,
        animeId: episode.animeId,
        title: episode.title,
        episodeNumber: episode.episodeNumber,
        session: episode.session,
        secureFileReference: episode.secureFileReference,
        downloadLinks: episode.downloadLinks || []
      }
    });
  } catch (err) {
    console.error('Get episode error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ NEW ROUTE: Get chapter details for editing (including download links)
router.get('/chapter/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const chapter = await Chapter.findById(id);
    
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    
    res.json({
      success: true,
      chapter: {
        _id: chapter._id,
        mangaId: chapter.mangaId,
        title: chapter.title,
        chapterNumber: chapter.chapterNumber,
        session: chapter.session,
        secureFileReference: chapter.secureFileReference,
        downloadLinks: chapter.downloadLinks || []
      }
    });
  } catch (err) {
    console.error('Get chapter error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
