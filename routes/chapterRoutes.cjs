  // routes/chapterRoutes.cjs - VALIDATION COMPLETELY REMOVED
const express = require('express');
const router = express.Router();
const Chapter = require('../models/Chapter.cjs');
const Anime = require('../models/Anime.cjs');

// DELETE ALL CHAPTERS
router.delete('/all', async (req, res) => {
  try {
    console.log('🗑️ Deleting ALL chapters...');
    const result = await Chapter.deleteMany({});
    console.log('✅ All chapters deleted:', result.deletedCount);
    res.json({
      message: `All chapters deleted (${result.deletedCount} chapters)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error deleting all chapters:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/chapters -> List all chapters
router.get('/', async (req, res) => {
  try {
    const chapters = await Chapter.find().sort({ session: 1, chapterNumber: 1 });
    res.json(chapters);
  } catch (error) {
    console.error('Error fetching all chapters:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/chapters -> ADD NEW CHAPTER (NO VALIDATION)
router.post('/', async (req, res) => {
  try {
    const { mangaId, title, chapterNumber, secureFileReference, cutyLink, session } = req.body;

    console.log('📥 ADD CHAPTER REQUEST:', {
      mangaId,
      title,
      chapterNumber,
      session,
      cutyLink
    });

    if (!mangaId || typeof chapterNumber === 'undefined') {
      return res.status(400).json({ error: 'mangaId and chapterNumber required' });
    }

    // Check if manga exists
    const manga = await Anime.findById(mangaId);
    if (!manga) {
      console.log('❌ Manga not found with ID:', mangaId);
      return res.status(404).json({ error: 'Manga not found' });
    }
    console.log('✅ Manga found:', manga.title);

    // Check if chapter number exists in the same session only
    const existing = await Chapter.findOne({
      mangaId,
      chapterNumber: Number(chapterNumber),
      session: session || 1
    });
    
    if (existing) {
      return res.status(409).json({
        error: `Chapter ${chapterNumber} already exists in Session ${session || 1}`
      });
    }

    const newChapter = new Chapter({
      mangaId,
      title: title || `Chapter ${chapterNumber}`,
      chapterNumber: Number(chapterNumber),
      secureFileReference: secureFileReference || null,
      cutyLink: cutyLink || '', // ✅ CUTYLINK KO EMPTY ALLOW KARO
      session: session || 1
    });

    console.log('💾 Saving chapter to database...');
    await newChapter.save();
    
    // ✅ YEH IMPORTANT LINE ADD KARO: Manga ko update karo for homepage sorting
    await Anime.updateLastContent(mangaId);
    
    console.log('✅ Chapter saved with ID:', newChapter._id);
    console.log('🔄 Manga lastContentAdded updated for homepage priority');

    res.json({
      message: 'Chapter added successfully! This manga will now appear first on homepage.',
      chapter: newChapter,
      mangaTitle: manga.title
    });
  } catch (error) {
    console.error('❌ Error adding chapter:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/chapters/:mangaId -> all chapters for manga
router.get('/:mangaId', async (req, res) => {
  try {
    console.log('📥 Fetching chapters for manga:', req.params.mangaId);
    
    if (!req.params.mangaId || req.params.mangaId === 'undefined') {
      return res.status(400).json({ error: 'Invalid manga ID' });
    }

    const chapters = await Chapter.find({ mangaId: req.params.mangaId })
      .sort({ session: 1, chapterNumber: 1 })
      .lean();
    
    console.log('✅ Found chapters:', chapters.length);
    
    res.json(chapters || []);
    
  } catch (error) {
    console.error('❌ Error fetching chapters:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/chapters -> UPDATE CHAPTER (NO VALIDATION)
router.patch('/', async (req, res) => {
  try {
    const { mangaId, chapterNumber, title, secureFileReference, cutyLink, session } = req.body;
    
    if (!mangaId || typeof chapterNumber === 'undefined') {
      return res.status(400).json({ error: 'mangaId and chapterNumber are required' });
    }
    
    const query = {
      mangaId,
      chapterNumber: Number(chapterNumber),
      session: session || 1
    };
    
    // Find manga
    const manga = await Anime.findById(mangaId);
    if (!manga) {
      return res.status(404).json({ error: 'Manga not found' });
    }

    const update = {};
    if (typeof title !== 'undefined') update.title = title;
    if (typeof secureFileReference !== 'undefined') update.secureFileReference = secureFileReference;
    if (typeof cutyLink !== 'undefined') update.cutyLink = cutyLink; // ✅ NO VALIDATION
    if (typeof session !== 'undefined') update.session = session;

    const updated = await Chapter.findOneAndUpdate(query, { $set: update }, { new: true });
    
    if (!updated) return res.status(404).json({ error: 'Chapter not found' });
    
    // ✅ YEH BHI ADD KARO: Manga update karo jab chapter modify ho
    await Anime.updateLastContent(mangaId);
    
    res.json({ 
      message: '✅ Chapter updated successfully! This manga will now appear first on homepage.', 
      chapter: updated
    });
  } catch (error) {
    console.error('Error updating chapter:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/chapters -> delete chapter by mangaId + chapterNumber + session
router.delete('/', async (req, res) => {
  try {
    const { mangaId, chapterNumber, session } = req.body;
    
    console.log('🗑️ DELETE REQUEST:', { mangaId, chapterNumber, session });
    
    if (!mangaId || typeof chapterNumber === 'undefined' || typeof session === 'undefined') {
      return res.status(400).json({ error: 'mangaId, chapterNumber, and session required' });
    }
    
    const removed = await Chapter.findOneAndDelete({
      mangaId,
      chapterNumber: Number(chapterNumber),
      session: Number(session)
    });
    
    if (!removed) {
      console.log('❌ Chapter not found for deletion');
      return res.status(404).json({ error: 'Chapter not found' });
    }
    
    // ✅ DELETE KE BAAD BHI MANGA UPDATE KARO
    await Anime.updateLastContent(mangaId);
    
    console.log('✅ Chapter deleted successfully');
    res.json({ message: 'Chapter deleted' });
  } catch (error) {
    console.error('❌ Error deleting chapter:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
