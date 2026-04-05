import admin from 'firebase-admin';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(token);
      const email = decodedToken.email;

      // Get user from MongoDB using email
      let user = await User.findOne({ email }).select('-password');

      if (!user) {
          // Optional: Auto-create user record in MongoDB if it exists in Firebase but not in Mongo
          // For now, return unauthorized if not in sync
          return res.status(401).json({ message: 'User record not found in system' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Firebase Auth Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user?.role || 'unknown'}' is not authorized to access this route`
      });
    }
    next();
  };
};
