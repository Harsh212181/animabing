  // models/SocialMedia.cjs - ONLY FACEBOOK, INSTAGRAM, TELEGRAM
const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'telegram'], // ✅ Only these 3 platforms
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

// ✅ Static method to initialize ONLY 3 default links
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
    }
    // ❌ Twitter and YouTube removed as requested
  ];

  try {
    for (const link of defaultLinks) {
      const existing = await this.findOne({ platform: link.platform });
      if (!existing) {
        await this.create(link);
        console.log(`✅ Created default social link: ${link.platform}`);
      }
    }
    console.log('✅ Social media links initialized (Only Facebook, Instagram, Telegram)');
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
