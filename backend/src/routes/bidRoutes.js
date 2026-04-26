const express = require('express');
const { placeBid, getBidsForAuction, getUserBids } = require('../controllers/bidController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, placeBid);
router.get('/mine', protect, getUserBids);
router.get('/:auctionId', getBidsForAuction);

module.exports = router;
