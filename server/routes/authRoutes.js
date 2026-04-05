import express from 'express';
import { 
  registerUser, 
  getUserProfile, 
  updateUserProfile,
  searchUsers,
  addFriend,
  getAllUsers,
  getNotifications,
  markNotificationsAsRead
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', protect, registerUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/search', protect, searchUsers);
router.post('/friends/add', protect, addFriend);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsAsRead);

// Admin Routes
router.get('/users', protect, authorize('admin'), getAllUsers);

export default router;
