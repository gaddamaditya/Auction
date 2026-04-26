const Auction = require('../models/Auction');

async function createAuction(req, res, next) {
  try {
    const { title, description, basePrice, startingPrice, startTime, endTime, image } = req.body;
    
    // Accept both basePrice and startingPrice for compatibility
    const price = basePrice !== undefined ? basePrice : startingPrice;
    
    if (!title || price === undefined || !endTime) {
      return res.status(400).json({ message: 'title, basePrice (or startingPrice), and endTime are required' });
    }
    
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only sellers or admins can create auctions' });
    }
    
    // If no startTime provided, use current time
    const start = startTime ? new Date(startTime) : new Date();
    const end = new Date(endTime);
    
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid startTime or endTime' });
    }
    
    if (end <= start) {
      return res.status(400).json({ message: 'endTime must be after startTime' });
    }
    
    const now = new Date();
    const status = now >= start ? (now >= end ? 'ended' : 'live') : 'scheduled';
    
    const auction = await Auction.create({
      title,
      description,
      image,
      basePrice: price,
      currentBid: price,
      startTime: start,
      endTime: end,
      seller: req.user._id,
      status,
    });
    
    res.status(201).json(auction);
  } catch (err) {
    next(err);
  }
}

async function getAuctions(req, res, next) {
  try {
    const auctions = await Auction.find()
      .populate('seller', 'name email')
      .populate('highestBidder', 'name email')
      .populate('winner', 'name email')
      .sort({ createdAt: -1 });
    res.json(auctions);
  } catch (err) {
    next(err);
  }
}

async function getAuctionById(req, res, next) {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'name email')
      .populate('highestBidder', 'name email')
      .populate('winner', 'name email');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    res.json(auction);
  } catch (err) {
    next(err);
  }
}

async function getUserAuctions(req, res, next) {
  try {
    const auctions = await Auction.find({ seller: req.user._id })
      .populate('seller', 'name email')
      .populate('highestBidder', 'name email')
      .populate('winner', 'name email')
      .sort({ createdAt: -1 });
    res.json(auctions);
  } catch (err) {
    next(err);
  }
}

module.exports = { createAuction, getAuctions, getAuctionById, getUserAuctions };
