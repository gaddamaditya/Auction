const Auction = require('../models/Auction');

async function finalizeEndedAuctions(io) {
  const now = new Date();
  const ended = await Auction.find({
    status: { $ne: 'ended' },
    endTime: { $lte: now },
  });

  for (const auction of ended) {
    auction.status = 'ended';
    auction.winner = auction.highestBidder || null;
    await auction.save();

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
  }
}

function startAuctionScheduler(io, intervalMs = 1000) {
  setInterval(() => {
    finalizeEndedAuctions(io).catch((err) =>
      console.error('Auction scheduler error:', err)
    );
  }, intervalMs);
}

module.exports = { startAuctionScheduler, finalizeEndedAuctions };
