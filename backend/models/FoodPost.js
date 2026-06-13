const mongoose = require('mongoose');

const foodPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    foodType: {
      type: String,
      enum: ['veg', 'non-veg', 'both'],
      default: 'veg',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    expiryTime: {
      type: Date,
      required: [true, 'Expiry time is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    image: {
      type: String, // URL or base64
      default: null,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor ID is required'],
    },
    donorName: {
      type: String,
      required: true,
      trim: true,
    },
    donorEmail: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['available', 'claimed', 'completed', 'expired'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-expire posts
foodPostSchema.index({ expiryTime: 1 });

module.exports = mongoose.model('FoodPost', foodPostSchema);
