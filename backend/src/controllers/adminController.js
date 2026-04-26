const User = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

async function getStats(req, res, next) {
  try {
    const totalUsers = await User.countDocuments();
    const totalAuctions = await Auction.countDocuments();
    const activeAuctions = await Auction.countDocuments({ status: 'live' });
    const completedAuctions = await Auction.countDocuments({ status: 'ended' });

    res.json({
      totalUsers,
      totalAuctions,
      activeAuctions,
      completedAuctions,
    });
  } catch (err) {
    next(err);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function getAllAuctions(req, res, next) {
  try {
    const auctions = await Auction.find()
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(auctions);
  } catch (err) {
    next(err);
  }
}

async function stopAuction(req, res, next) {
  try {
    const { id } = req.params;
    const auction = await Auction.findById(id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    
    if (auction.status === 'ended') {
      return res.status(400).json({ message: 'Auction is already ended' });
    }

    auction.status = 'ended';
    auction.endTime = new Date();
    auction.winner = auction.highestBidder || null;
    await auction.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`auction:${auction._id}`).emit('auctionEnded', {
        auctionId: auction._id,
        winner: auction.winner,
        finalBid: auction.currentBid,
      });
      io.emit('auctionUpdated', {
        auctionId: auction._id,
        status: 'ended',
      });
    }

    res.json(auction);
  } catch (err) {
    next(err);
  }
}

async function deleteAuction(req, res, next) {
  try {
    const { id } = req.params;
    const auction = await Auction.findByIdAndDelete(id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    
    // Delete associated bids
    await Bid.deleteMany({ auction: id });
    
    const io = req.app.get('io');
    if (io) {
      // Broadcast that an auction was deleted so clients can update lists
      io.emit('auctionDeleted', { auctionId: id });
    }

    res.json({ message: 'Auction deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats, getAllUsers, getAllAuctions, stopAuction, deleteAuction };
