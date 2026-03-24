const router = require('express').Router();
const { 
  getHabits, 
  createHabit, 
  getHabit, 
  updateHabit, 
  deleteHabit, 
  checkinHabit,
  getHabitsByUserId,
  getStats
} = require('../controllers/habitController');
const authMiddleware = require('../middleware/authMiddleware');

// Verify admin status
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
      next();
  } else {
      res.status(403).json({ success: false, message: "Admins only." });
  }
};

// All routes require authentication
router.use(authMiddleware);

// Stats route (must be before /:id routes)
router.get('/stats', getStats);

// CRUD routes
router.route('/')
  .get(getHabits)
  .post(createHabit);

router.route('/:id')
  .get(getHabit)
  .put(updateHabit)
  .delete(deleteHabit);

// Check-in route
router.post('/:id/checkin', checkinHabit);

// Admin "View" button routes
router.get('/user/:userId', isAdmin, getHabitsByUserId);


module.exports = router;
