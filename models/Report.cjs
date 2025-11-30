// models/Report.cjs - FINAL VERSION
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Episode Report Fields
  animeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime',
    required: false
  },
  episodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Episode',
    required: false
  },
  episodeNumber: {
    type: Number,
    required: false
  },
  
  // Contact Form Fields
  name: {
    type: String,
    required: false
  },
  subject: {
    type: String,
    required: false
  },
  message: {
    type: String,
    required: false  // ✅ CHANGED TO FALSE
  },
  
  // Common Fields
  issueType: {
    type: String,
    enum: ['Link Not Working', 'Wrong Episode', 'Poor Quality', 'Audio Issue', 'Subtitle Issue', 'Other'],
    required: false
  },
  description: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false  // ✅ CHANGED TO FALSE
  },
  username: {
    type: String,
    default: 'Anonymous'
  },
  
  // Type and Status
  type: {
    type: String,
    enum: ['episode', 'contact'],
    default: 'episode'
  },
  userIP: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Fixed', 'Invalid'],
    default: 'Pending'
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false
  },
  adminResponse: String,
  responseDate: Date
}, { 
  timestamps: true 
});

// ✅ Auto-fill fields for compatibility
reportSchema.pre('save', function(next) {
  // For episode reports: copy description to message
  if (this.type === 'episode' && this.description && !this.message) {
    this.message = this.description;
  }
  // For contact reports: copy message to description  
  if (this.type === 'contact' && this.message && !this.description) {
    this.description = this.message;
  }
  next();
});

module.exports = mongoose.models.Report || mongoose.model('Report', reportSchema);
