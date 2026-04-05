import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  assignments: [{
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem'
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['Active', 'Archived'],
      default: 'Active'
    }
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

const Classroom = mongoose.model('Classroom', classroomSchema);
export default Classroom;
