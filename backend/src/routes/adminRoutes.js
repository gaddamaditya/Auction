const express = require('express');
const { getStats, getAllUsers, getAllAuctions, stopAuction, deleteAuction } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/auctions', getAllAuctions);
router.post('/auctions/:id/stop', stopAuction);
router.delete('/auctions/:id', deleteAuction);

module.exports = router;
