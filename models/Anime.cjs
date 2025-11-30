 // models/Anime.cjs - CORRECTED WITH CONSISTENT FEATURED FIELD
const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  genreList: [String],
  releaseYear: Number,
  thumbnail: String,
  bannerImage: String, // ✅ ADDED: For featured/carousel display
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
  lastReported: Date,
  
  // ✅ YEH NAYA FIELD ADD KARO: Last episode/chapter added timestamp
  lastContentAdded: { 
    type: Date, 
    default: Date.now 
  },

  // ✅ CORRECTED: USE 'featured' INSTEAD OF 'isFeatured' FOR CONSISTENCY
  featured: {
    type: Boolean,
    default: false
  },
  featuredOrder: {
    type: Number,
    default: 0
  },
  
  // ✅ ADDITIONAL FIELDS FOR BETTER FUNCTIONALITY
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  totalEpisodes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true, // ✅ Yeh automatically createdAt and updatedAt fields add karega
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ YEH VIRTUAL FIELDS ADD KARO
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

// ✅ YEH MIDDLEWARE ADD KARO: Jab bhi episode add ho to anime update ho
animeSchema.pre('save', function(next) {
  // Agar episodes array modify hui hai to lastContentAdded update karo
  if (this.isModified('episodes') && this.episodes && this.episodes.length > 0) {
    this.lastContentAdded = new Date();
  }
  next();
});

// ✅ YEH STATIC METHOD ADD KARO: Anime update karo jab episode add ho
animeSchema.statics.updateLastContent = async function(animeId) {
  await this.findByIdAndUpdate(animeId, {
    lastContentAdded: new Date(),
    updatedAt: new Date()
  });
};

// ✅ YEH INDEXES ADD KARO FOR FASTER QUERIES
animeSchema.index({ featured: 1, featuredOrder: -1 }); // For featured anime queries
animeSchema.index({ title: 'text' }); // For text search
animeSchema.index({ lastContentAdded: -1 }); // For recent updates
animeSchema.index({ createdAt: -1 }); // For new arrivals

module.exports = mongoose.models.Anime || mongoose.model('Anime', animeSchema);
