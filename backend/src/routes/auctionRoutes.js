const express = require('express');
const { createAuction, getAuctions, getAuctionById, getUserAuctions } = require('../controllers/auctionController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('seller', 'admin'), createAuction);
router.get('/mine', protect, getUserAuctions);
router.get('/', getAuctions);
router.get('/:id', getAuctionById);

module.exports = router;
