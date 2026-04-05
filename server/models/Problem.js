import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true,
    default: 'General'
  },
  tags: [String],
  description: {
    type: String,
    required: true
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: [String],
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: {
      type: Boolean,
      default: false
    }
  }],
  starterCode: {
    python: String,
    javascript: String,
    java: String,
    cpp: String
  }
}, {
  timestamps: true
});

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;
