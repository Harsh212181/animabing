 // models/SocialMedia.cjs - COMPLETE UPDATED VERSION
const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'telegram', 'twitter', 'youtube', 'whatsapp', 'discord'],
    required: true,
    unique: true,
    lowercase: true
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\//.test(v);
      },
      message: 'URL must start with http:// or https://'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: ''
  },
  displayName: {
    type: String,
    required: true
  }
}, { 
  timestamps: true 
});

// ✅ Add pre-save middleware to set displayName if not provided
socialMediaSchema.pre('save', function(next) {
  if (!this.displayName) {
    this.displayName = this.platform.charAt(0).toUpperCase() + this.platform.slice(1);
  }
  next();
});

// ✅ Static method to initialize default links
socialMediaSchema.statics.initDefaultLinks = async function() {
  const defaultLinks = [
    { 
      platform: 'facebook', 
      url: 'https://facebook.com/animebing',
      isActive: true,
      icon: 'facebook',
      displayName: 'Facebook'
    },
    { 
      platform: 'instagram', 
      url: 'https://instagram.com/animebing',
      isActive: true,
      icon: 'instagram',
      displayName: 'Instagram'
    },
    { 
      platform: 'telegram', 
      url: 'https://t.me/animebing',
      isActive: true,
      icon: 'telegram',
      displayName: 'Telegram'
    },
    { 
      platform: 'twitter', 
      url: 'https://twitter.com/animebing',
      isActive: false,
      icon: 'twitter',
      displayName: 'Twitter'
    },
    { 
      platform: 'youtube', 
      url: 'https://youtube.com/c/animebing',
      isActive: false,
      icon: 'youtube',
      displayName: 'YouTube'
    }
  ];

  try {
    for (const link of defaultLinks) {
      const existing = await this.findOne({ platform: link.platform });
      if (!existing) {
        await this.create(link);
        console.log(`✅ Created default social link: ${link.platform}`);
      }
    }
    console.log('✅ Social media links initialized');
  } catch (error) {
    console.error('❌ Error initializing social links:', error);
  }
};

const SocialMedia = mongoose.model('SocialMedia', socialMediaSchema);

// ✅ Initialize when model is loaded (only once)
let initialized = false;
if (!initialized) {
  SocialMedia.initDefaultLinks();
  initialized = true;
}

module.exports = SocialMedia;
