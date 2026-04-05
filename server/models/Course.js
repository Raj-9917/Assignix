import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  id: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    default: 'General'
  },
  thumbnail: {
    type: String,
    default: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800'
  },
  color: {
    type: String,
    default: '#6366f1' // Brand Primary
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  problemCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Course = mongoose.model('Course', courseSchema);
export default Course;
