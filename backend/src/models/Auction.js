const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    basePrice: { type: Number, required: true, min: 0 },
    currentBid: { type: Number, default: 0 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

auctionSchema.pre('save', function (next) {
  if (this.isNew && (this.currentBid === undefined || this.currentBid === null || this.currentBid === 0)) {
    this.currentBid = this.basePrice;
  }
  if (this.endTime <= this.startTime) {
    return next(new Error('endTime must be after startTime'));
  }
  next();
});

module.exports = mongoose.model('Auction', auctionSchema);
