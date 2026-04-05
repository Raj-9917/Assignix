import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  classroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Accepted', 'Failed', 'Pending', 'Runtime Error', 'Compilation Error'],
    required: true
  },
  runtime: Number,
  memory: Number,
  testCasesPassed: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  feedback: String,
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
