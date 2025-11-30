 // routes/animeRoutes.cjs - COMPLETE VERSION WITH ALL FEATURED ROUTES
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
    .select('title thumbnail releaseYear subDubStatus contentType updatedAt createdAt bannerImage rating')
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
      .select('title thumbnail releaseYear subDubStatus contentType updatedAt createdAt')
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
 * ✅ OPTIMIZED: SEARCH anime with PAGINATION
 */
router.get('/search', async (req, res) => {
  try {
    const q = req.query.query || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const skip = (page - 1) * limit;

    const found = await Anime.find({
      title: { $regex: q, $options: 'i' }
    })
    .select('title thumbnail releaseYear subDubStatus contentType updatedAt createdAt')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    const total = await Anime.countDocuments({
      title: { $regex: q, $options: 'i' }
    });

    res.set({
      'Cache-Control': 'public, max-age=300',
      'X-Total-Count': total
    });

    res.json({ 
      success: true, 
      data: found,
      pagination: {
        current: page,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (err) {
    console.error('Error searching anime:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ✅ GET single anime by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await Anime.findById(req.params.id).populate('episodes');
    if (!item) return res.status(404).json({ success: false, message: 'Anime not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    // ✅ Better error handling for invalid ObjectId
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid anime ID format' 
      });
    }
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
