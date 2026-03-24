const Habit = require('../models/Habit');

// @desc    Get all habits for user
// @route   GET /api/habits
// @access  Private
exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.user._id,
      isActive: true 
    }).sort({ createdAt: -1 });

    // Add isCheckedInToday to each habit
    const habitsWithStatus = habits.map(habit => ({
      ...habit.toObject(),
      isCheckedInToday: habit.isCheckedInToday()
    }));

    res.status(200).json({
      success: true,
      count: habits.length,
      data: { habits: habitsWithStatus }
    });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching habits',
      error: error.message
    });
  }
};

// @desc    Create new habit
// @route   POST /api/habits
// @access  Private
exports.createHabit = async (req, res) => {
  try {
    const { name, goal, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a habit name'
      });
    }

    const habit = await Habit.create({
      userId: req.user._id,
      name,
      goal: goal || '1 time',
      icon: icon || '✨',
      color: color || 'blue'
    });

    res.status(201).json({
      success: true,
      message: 'Habit created! 🎉',
      data: { 
        habit: {
          ...habit.toObject(),
          isCheckedInToday: false
        }
      }
    });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating habit',
      error: error.message
    });
  }
};

// @desc    Get single habit
// @route   GET /api/habits/:id
// @access  Private
exports.getHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { 
        habit: {
          ...habit.toObject(),
          isCheckedInToday: habit.isCheckedInToday()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching habit',
      error: error.message
    });
  }
};

// @desc    Update habit
// @route   PUT /api/habits/:id
// @access  Private
exports.updateHabit = async (req, res) => {
  try {
    const { name, goal, icon, color } = req.body;

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, goal, icon, color },
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Habit updated! ✨',
      data: { 
        habit: {
          ...habit.toObject(),
          isCheckedInToday: habit.isCheckedInToday()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating habit',
      error: error.message
    });
  }
};

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Private
exports.deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Habit deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting habit',
      error: error.message
    });
  }
};

// @desc    Check in to a habit
// @route   POST /api/habits/:id/checkin
// @access  Private
exports.checkinHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    const result = habit.checkin();
    await habit.save();

    if (result.alreadyCheckedIn) {
      return res.status(200).json({
        success: true,
        message: 'Already checked in today! 👍',
        data: { 
          habit: {
            ...habit.toObject(),
            isCheckedInToday: true
          },
          alreadyCheckedIn: true
        }
      });
    }

    res.status(200).json({
      success: true,
      message: result.streak > 1 
        ? `🔥 ${result.streak} day streak! Keep it up!` 
        : 'Checked in! Great start! ✨',
      data: { 
        habit: {
          ...habit.toObject(),
          isCheckedInToday: true
        },
        streak: result.streak
      }
    });
  } catch (error) {
    console.error('Checkin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking in',
      error: error.message
    });
  }
};

// @desc    Get habit statistics
// @route   GET /api/habits/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.user._id,
      isActive: true 
    });

    const totalHabits = habits.length;
    const checkedInToday = habits.filter(h => h.isCheckedInToday()).length;
    const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
    const longestStreak = habits.length > 0 
      ? Math.max(...habits.map(h => h.streak)) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalHabits,
          checkedInToday,
          completionRate: totalHabits > 0 
            ? Math.round((checkedInToday / totalHabits) * 100) 
            : 0,
          totalStreak,
          longestStreak
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
};
// @desc    Get habits for a specific user (Admin only)
// @route   GET /api/habits/user/:userId
exports.getHabitsByUserId = async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.params.userId,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user habits',
      error: error.message
    });
  }
};
