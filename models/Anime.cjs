  // models/Anime.cjs - UPDATED WITH ENGLISH SUB
const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  genreList: [String],
  releaseYear: Number,
  thumbnail: String,
  contentType: {
    type: String,
    enum: ['Anime', 'Movie', 'Manga'],
    default: 'Anime'
  },
  // ✅ UPDATED: Added 'English Sub' to enum
  subDubStatus: {
    type: String,
    enum: ['Hindi Dub', 'Hindi Sub', 'English Sub', 'Both', 'Subbed', 'Dubbed', 'Sub & Dub', 'Dual Audio'],
    default: 'Hindi Sub'
  },
  status: {
    type: String,
    enum: ['Ongoing', 'Complete'],
    default: 'Ongoing'
  },
  reportCount: { type: Number, default: 0 },
  lastReported: Date
}, { timestamps: true });

animeSchema.virtual('episodes', {
  ref: 'Episode',
  localField: '_id',
  foreignField: 'animeId'
});

animeSchema.virtual('chapters', {
  ref: 'Chapter',
  localField: '_id',
  foreignField: 'mangaId'
});

animeSchema.set('toJSON', { virtuals: true });
animeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.Anime || mongoose.model('Anime', animeSchema);
