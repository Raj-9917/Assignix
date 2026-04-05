import User from '../models/User.js';

// @desc    Register new user (Sync with Firebase)
// @route   POST /api/auth/register
// @access  Private (Authenticated via Firebase Token)
export const registerUser = async (req, res) => {
  const { email, role, name, username } = req.body;

  try {
    // req.user is set by the protect middleware (which verifies Firebase token)
    // If the user already exists in Mongo, just return it
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      return res.status(200).json(user);
    }

    // Check if username is taken
    const usernameExists = await User.findOne({ username: username?.toLowerCase() });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    user = await User.create({
      name,
      username: username?.toLowerCase(),
      email: email.toLowerCase(),
      role: role || 'student',
      password: 'firebase_authenticated' // Dummy password as Firebase handles auth
    });

    if (user) {
      res.status(201).json(user);
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration/Sync Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, no user data found' });
    }

    const user = await User.findById(req.user._id).populate('friends', 'name username avatar role');

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        xp: user.xp || 0,
        streak: user.streak || 0,
        friends: Array.isArray(user.friends) ? user.friends : [],
        notificationSettings: user.notificationSettings || {},
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error retrieving user data' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.body.username && req.body.username.toLowerCase() !== user.username) {
        const usernameExists = await User.findOne({ username: req.body.username.toLowerCase() });
        if (usernameExists) {
          return res.status(400).json({ message: 'Username is already taken' });
        }
        user.username = req.body.username.toLowerCase();
      }

      user.name = req.body.name || user.name;
      
      if (req.body.notificationSettings) {
        user.notificationSettings = {
          ...user.notificationSettings,
          ...req.body.notificationSettings
        };
      }

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search for users by username
// @route   GET /api/auth/search
// @access  Private
export const searchUsers = async (req, res) => {
  const { query } = req.query;
  if (!query || query.length < 2) return res.status(400).json({ message: 'Search query must be at least 2 characters long' });

  try {
    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.user._id }
    }).select('name username avatar role xp solvedProblems');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a friend
// @route   POST /api/auth/friends/add
// @access  Private
export const addFriend = async (req, res) => {
  const { friendId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const friendToAdd = await User.findById(friendId);
    if (!friendToAdd) return res.status(404).json({ message: 'User not found' });
    if (user.friends.includes(friendId)) return res.status(400).json({ message: 'User is already your friend' });
    
    user.friends.push(friendId);
    await user.save();
    res.json({ message: 'Friend added successfully', friends: user.friends });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Get user notifications
// @route   GET /api/auth/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const notifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/auth/notifications/read
// @access  Private
export const markNotificationsAsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.notifications.forEach(n => { n.read = true; });
    await user.save();
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
