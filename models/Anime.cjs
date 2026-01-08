// models/Anime.cjs - UPDATED WITH SEO FIELDS
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
  },
  
  // ✅ SEO FIELDS ADDED HERE
  seoTitle: {
    type: String,
    default: ''
  },
  seoDescription: {
    type: String,
    default: ''
  },
  seoKeywords: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
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

// ✅ YEH MIDDLEWARE ADD KARO: Jab bhi anime save ho to slug auto-generate ho
animeSchema.pre('save', function(next) {
  // Agar slug nahi hai ya title change hua hai to slug generate karo
  if (!this.slug || this.isModified('title')) {
    // Slug generate karo title se
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Special characters remove karo
      .replace(/\s+/g, '-')         // Spaces ko dash se replace karo
      .replace(/-+/g, '-')          // Multiple dashes ko single dash se replace karo
      .trim();
    
    // Slug unique banane ke liye ID add karo agar duplicate ho
    if (this.slug) {
      this.slug = `${this.slug}-${Date.now().toString(36)}`;
    }
  }
  
  // Agar episodes array modify hui hai to lastContentAdded update karo
  if (this.isModified('episodes') && this.episodes && this.episodes.length > 0) {
    this.lastContentAdded = new Date();
  }
  
  // Agar SEO fields empty hain to default values set karo
  if (!this.seoTitle) {
    this.seoTitle = `Watch ${this.title} Online in ${this.subDubStatus} | AnimeBing`;
  }
  
  if (!this.seoDescription) {
    this.seoDescription = `Watch ${this.title} online in ${this.subDubStatus}. HD quality streaming and downloads.`;
  }
  
  if (!this.seoKeywords) {
    // Auto-generate keywords based on title, genre, and subDubStatus
    const keywords = [];
    
    // Title-based keywords
    keywords.push(`${this.title} anime`, `watch ${this.title} online`, `${this.title} ${this.subDubStatus.toLowerCase()}`);
    
    // Genre-based keywords
    if (this.genreList && this.genreList.length > 0) {
      this.genreList.forEach(genre => {
        keywords.push(`${genre.toLowerCase()} anime`, `${this.title} ${genre.toLowerCase()}`);
      });
    }
    
    // Language/Type based keywords
    if (this.subDubStatus.includes('Hindi Dub')) {
      keywords.push('hindi dubbed anime', 'anime in hindi', 'hindi dub');
    }
    if (this.subDubStatus.includes('Hindi Sub')) {
      keywords.push('hindi subbed anime', 'anime with hindi subtitles', 'hindi sub');
    }
    if (this.subDubStatus.includes('English Sub')) {
      keywords.push('english subbed anime', 'anime in english', 'english sub');
    }
    
    // Content type keywords
    if (this.contentType === 'Movie') {
      keywords.push(`${this.title} movie`, 'anime movies', 'full anime movie');
    }
    
    // Remove duplicates and join
    const uniqueKeywords = [...new Set(keywords)];
    this.seoKeywords = uniqueKeywords.join(', ');
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

// ✅ YEH STATIC METHOD ADD KARO: Slug generate karo
animeSchema.statics.generateSlug = async function(title) {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // Check if slug already exists
  let existing = await this.findOne({ slug });
  let counter = 1;
  let originalSlug = slug;
  
  while (existing) {
    slug = `${originalSlug}-${counter}`;
    existing = await this.findOne({ slug });
    counter++;
  }
  
  return slug;
};

// ✅ YEH INDEXES ADD KARO FOR FASTER QUERIES
animeSchema.index({ featured: 1, featuredOrder: -1 }); // For featured anime queries
animeSchema.index({ title: 'text' }); // For text search
animeSchema.index({ lastContentAdded: -1 }); // For recent updates
animeSchema.index({ createdAt: -1 }); // For new arrivals
animeSchema.index({ slug: 1 }); // ✅ SEO: For slug-based URL queries
animeSchema.index({ seoTitle: 'text', seoDescription: 'text', seoKeywords: 'text' }); // ✅ SEO: For SEO content search

module.exports = mongoose.models.Anime || mongoose.model('Anime', animeSchema);