// routes/animeRoutes.cjs - UPDATED WITH SEO SUPPORT
const express = require('express');
const router = express.Router();
const Anime = require('../models/Anime.cjs');

/**
 * ✅ ADDED: FEATURED ANIME ROUTE (FIXES THE ERROR)
 * This must be added BEFORE the /:id route
 */
router.get('/featured', async (req, res) => {
  try {
    // ✅ Get featured anime - using featured field from schema
    const featuredAnime = await Anime.find({ 
      featured: true 
    })
    .select('title thumbnail releaseYear subDubStatus contentType updatedAt createdAt bannerImage rating slug seoTitle') // ✅ Added SEO fields
    .sort({ featuredOrder: -1, createdAt: -1 }) // ✅ Added featuredOrder for manual ordering
    .limit(10)
    .lean();

    // ✅ Set cache headers for featured content
    res.set({
      'Cache-Control': 'public, max-age=600', // 10 minutes cache for featured
    });

    res.json({ 
      success: true, 
      data: featuredAnime
    });
  } catch (err) {
    console.error('Error fetching featured anime:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ✅ NEW: GET ANIME BY SLUG (SEO-friendly URL)
 */
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      return res.status(400).json({ 
        success: false, 
        error: 'Slug parameter is required' 
      });
    }

    const anime = await Anime.findOne({ slug })
      .populate('episodes')
      .lean();

    if (!anime) {
      return res.status(404).json({ 
        success: false, 
        message: 'Anime not found with this slug' 
      });
    }

    // ✅ SEO cache headers
    res.set({
      'Cache-Control': 'public, max-age=3600', // 1 hour cache for SEO pages
      'Content-Type': 'application/json; charset=utf-8'
    });

    res.json({ 
      success: true, 
      data: anime
    });
  } catch (err) {
    console.error('Error fetching anime by slug:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ✅ OPTIMIZED: GET anime with PAGINATION
 * Returns paginated anime from DB sorted by LATEST UPDATE
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const skip = (page - 1) * limit;

    // ✅ OPTIMIZED: Only get necessary fields for listing
    const anime = await Anime.find()
      .select('title thumbnail releaseYear subDubStatus contentType updatedAt createdAt slug') // ✅ Added slug
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Faster response

    const total = await Anime.countDocuments();

    // ✅ OPTIMIZED: Set cache headers
    res.set({
      'Cache-Control': 'public, max-age=300', // 5 minutes cache
      'X-Total-Count': total,
      'X-Page': page,
      'X-Limit': limit
    });

    res.json({ 
      success: true, 
      data: anime,
      pagination: {
        current: page,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (err) {
    console.error('Error fetching anime:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ✅ OPTIMIZED: SEARCH anime with PAGINATION WITH SEO SUPPORT
 */
router.get('/search', async (req, res) => {
  try {
    const q = req.query.query || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const skip = (page - 1) * limit;

    // ✅ IMPROVED: Search in multiple fields for better SEO
    const searchQuery = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { seoKeywords: { $regex: q, $options: 'i' } },
        { seoTitle: { $regex: q, $options: 'i' } },
        { seoDescription: { $regex: q, $options: 'i' } }
      ]
    };

    const found = await Anime.find(searchQuery)
      .select('title thumbnail releaseYear subDubStatus contentType updatedAt createdAt slug seoTitle seoDescription') // ✅ Added SEO fields
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Anime.countDocuments(searchQuery);

    // ✅ SEO headers for search results
    res.set({
      'Cache-Control': 'public, max-age=300',
      'X-Total-Count': total,
      'X-Search-Query': encodeURIComponent(q)
    });

    res.json({ 
      success: true, 
      data: found,
      pagination: {
        current: page,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
        totalItems: total
      },
      searchInfo: {
        query: q,
        resultsFound: total
      }
    });
  } catch (err) {
    console.error('Error searching anime:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ✅ UPDATED: GET single anime by ID OR SLUG
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the ID is a valid MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let item;
    
    if (isObjectId) {
      // Search by ID
      item = await Anime.findById(id)
        .populate('episodes')
        .lean();
    } else {
      // Try searching by slug
      item = await Anime.findOne({ slug: id })
        .populate('episodes')
        .lean();
    }
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Anime not found' 
      });
    }
    
    // ✅ SEO headers
    res.set({
      'Cache-Control': 'public, max-age=3600', // 1 hour for anime details
      'Content-Type': 'application/json; charset=utf-8'
    });
    
    res.json({ 
      success: true, 
      data: item
    });
  } catch (err) {
    // ✅ Better error handling for invalid ObjectId
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid anime ID format' 
      });
    }
    console.error('Error fetching anime:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ✅ NEW: GET ANIME LIST WITH SEO FILTERS
 */
router.get('/filter/seo', async (req, res) => {
  try {
    const { language, type, genre } = req.query;
    
    const filter = {};
    
    // Apply language filter
    if (language) {
      if (language === 'hindi') {
        filter.$or = [
          { subDubStatus: { $regex: 'Hindi', $options: 'i' } },
          { seoKeywords: { $regex: 'hindi', $options: 'i' } }
        ];
      } else if (language === 'english') {
        filter.$or = [
          { subDubStatus: { $regex: 'English', $options: 'i' } },
          { seoKeywords: { $regex: 'english', $options: 'i' } }
        ];
      }
    }
    
    // Apply type filter
    if (type) {
      filter.contentType = type.charAt(0).toUpperCase() + type.slice(1);
    }
    
    // Apply genre filter
    if (genre) {
      filter.genreList = { $regex: genre, $options: 'i' };
    }
    
    const anime = await Anime.find(filter)
      .select('title thumbnail releaseYear subDubStatus contentType slug seoTitle seoDescription')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    // ✅ SEO cache for filtered results
    res.set({
      'Cache-Control': 'public, max-age=1800', // 30 minutes
    });
    
    res.json({
      success: true,
      data: anime,
      filter: { language, type, genre }
    });
  } catch (err) {
    console.error('Error filtering anime by SEO:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ✅ NEW: BULK UPDATE SEO DATA
 */
router.put('/bulk/seo', async (req, res) => {
  try {
    const { animeList } = req.body;
    
    if (!Array.isArray(animeList) || animeList.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'animeList must be a non-empty array'
      });
    }
    
    const bulkOps = animeList.map(anime => ({
      updateOne: {
        filter: { _id: anime._id },
        update: {
          $set: {
            seoTitle: anime.seoTitle || '',
            seoDescription: anime.seoDescription || '',
            seoKeywords: anime.seoKeywords || '',
            slug: anime.slug || '',
            updatedAt: new Date()
          }
        }
      }
    }));
    
    const result = await Anime.bulkWrite(bulkOps);
    
    res.json({
      success: true,
      message: `Updated SEO data for ${result.modifiedCount} anime`,
      data: result
    });
  } catch (err) {
    console.error('Error bulk updating SEO data:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ ADDED: FEATURED MANAGEMENT ROUTES

// Add anime to featured
router.post('/:id/featured', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Count current featured animes for ordering
    const featuredCount = await Anime.countDocuments({ featured: true });
    
    const updatedAnime = await Anime.findByIdAndUpdate(
      id,
      { 
        featured: true,
        featuredOrder: featuredCount + 1
      },
      { new: true }
    );
    
    if (!updatedAnime) {
      return res.status(404).json({ success: false, error: 'Anime not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Anime added to featured',
      data: updatedAnime 
    });
  } catch (err) {
    console.error('Error adding to featured:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Remove anime from featured
router.delete('/:id/featured', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedAnime = await Anime.findByIdAndUpdate(
      id,
      { 
        featured: false,
        featuredOrder: 0
      },
      { new: true }
    );
    
    if (!updatedAnime) {
      return res.status(404).json({ success: false, error: 'Anime not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Anime removed from featured',
      data: updatedAnime 
    });
  } catch (err) {
    console.error('Error removing from featured:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update featured order (bulk update)
router.put('/featured/order', async (req, res) => {
  try {
    const { order } = req.body; // array of anime IDs in desired order
    
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, error: 'Order must be an array of anime IDs' });
    }
    
    const bulkOps = order.map((animeId, index) => ({
      updateOne: {
        filter: { _id: animeId },
        update: { 
          featuredOrder: index + 1,
          featured: true // Ensure they remain featured
        }
      }
    }));
    
    await Anime.bulkWrite(bulkOps);
    
    res.json({ 
      success: true, 
      message: `Featured order updated for ${order.length} animes` 
    });
  } catch (err) {
    console.error('Error updating featured order:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;