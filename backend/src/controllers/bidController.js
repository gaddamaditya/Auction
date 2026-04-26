const mongoose = require('mongoose');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

async function placeBid(req, res, next) {
  try {
    const { auctionId, amount } = req.body;
    if (!auctionId || amount === undefined) {
      return res.status(400).json({ message: 'auctionId and amount are required' });
    }
    if (!mongoose.isValidObjectId(auctionId)) {
      return res.status(400).json({ message: 'Invalid auctionId' });
    }
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'amount must be a positive number' });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    const now = new Date();
    if (now < auction.startTime) {
      return res.status(400).json({ message: 'Auction has not started yet' });
    }
    if (now >= auction.endTime || auction.status === 'ended') {
      return res.status(400).json({ message: 'Auction has already ended' });
    }
    if (String(auction.seller) === String(req.user._id)) {
      return res.status(400).json({ message: 'Sellers cannot bid on their own auction' });
    }
    
    // First check to give user feedback (not binding due to race conditions)
    if (numericAmount <= auction.currentBid) {
      return res
        .status(400)
        .json({ message: `Bid must be greater than current bid (₹${auction.currentBid})` });
    }

    // Use atomic MongoDB update with $gt operator to prevent race conditions
    // This ensures the bid only succeeds if currentBid hasn't changed since our check
    const updatedAuction = await Auction.findByIdAndUpdate(
      {
        _id: auctionId,
        currentBid: { $lt: numericAmount } // Atomic check: currentBid MUST be less than new bid
      },
      {
        currentBid: numericAmount,
        highestBidder: req.user._id,
        status: auction.status === 'scheduled' ? 'live' : auction.status,
      },
      { new: true, runValidators: true }
    );

    // If null, it means another bid came in and increased currentBid
    if (!updatedAuction) {
      // Re-fetch to get the current bid amount for error message
      const latestAuction = await Auction.findById(auctionId);
      return res.status(409).json({ 
        message: `Bid failed: current bid is now ₹${latestAuction?.currentBid || 'unknown'}. Your bid must be higher.`,
        currentBid: latestAuction?.currentBid
      });
    }

    const bid = await Bid.create({
      auction: auctionId,
      bidder: req.user._id,
      amount: numericAmount,
    });

    const populatedBid = await bid.populate('bidder', 'name email');
    const populatedAuction = await updatedAuction.populate('highestBidder', 'name email');

    const io = req.app.get('io');
    if (io) {
      io.to(`auction:${auctionId}`).emit('newBid', {
        auctionId: auctionId,
        currentBid: numericAmount,
        highestBidder: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
        bid: populatedBid,
      });
      io.emit('auctionUpdated', {
        auctionId: auctionId,
        currentBid: numericAmount,
        status: updatedAuction.status,
      });
    }

    res.status(201).json(populatedBid);
  } catch (err) {
    next(err);
  }
}

async function getBidsForAuction(req, res, next) {
  try {
    const { auctionId } = req.params;
    if (!mongoose.isValidObjectId(auctionId)) {
      return res.status(400).json({ message: 'Invalid auctionId' });
    }
    const bids = await Bid.find({ auction: auctionId })
      .populate('bidder', 'name email')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    next(err);
  }
}

async function getUserBids(req, res, next) {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate('bidder', 'name email')
      .populate({
        path: 'auction',
        select: 'title currentBid status endTime',
      })
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    next(err);
  }
}

module.exports = { placeBid, getBidsForAuction, getUserBids };
